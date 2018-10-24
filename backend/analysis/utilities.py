from existDB import ExistData
from mongoDB import MongoData
from models.analysisItem import AnalysisItem, CategoryData
from models.search import SearchParameters
from analysis.frequency import FrequencyDistribution
from nltk.tokenize import RegexpTokenizer, word_tokenize, sent_tokenize
from stop_words import get_stop_words
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.stem.porter import PorterStemmer
from pathlib import Path
import os.path
import config
import json
import random
from tools import Tools

class Utilities:

    # ------------------------------------------------------------------------------------------------------------------------------------------------------
    # Code Adapter From: RStudio-pubs, The Analytics Store
    # URL: https://rstudio-pubs-static.s3.amazonaws.com/79360_850b2a69980c4488b1db95987a24867a.html
    #           http://www.theanalyticsstore.com/
    # Remarks: This code was adapted from the above website as well as a course on NLP offered
    #                    by the Analytics Store and modified to work for this application
    # ------------------------------------------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def preprocess(text, to_lowercase=True, remove_num=True, tokenize=True, remove_stopwords=True, normalise_method="lem"):
        if to_lowercase:
            text = text.lower()

        if tokenize:
            text = Utilities.get_tokenizer().tokenize(text)

        if remove_num:
            text = [w for w in text if not w.isdigit()]

        if remove_stopwords:
            text = [w for w in text if not w in Utilities.get_stopwords('en')]

        if normalise_method == "lem":
            text = [Utilities.get_lemmatizer().lemmatize(w) for w in text]
        elif normalise_method == "stem":
            text = [Utilities.get_stemmer().stem(w) for w in text]
        else:
            raise ValueError("You have provided an invalid value for the normalise_method argument. Current valid values are 'stem' and 'lem'.")


        return text

    @staticmethod
    def get_clean_transactions():
        documents = []
        mdb = MongoData()
        cached_data = mdb.get_transactions()
        if cached_data is not None:
            documents = cached_data
        else:
            exist_data = Utilities.load_data()
            for e in exist_data:
                mdb.insert_one_transaction(e)
                documents.append(e)

        return documents

    @staticmethod
    def process_search_params(req_params):
        searchParams = Tools.check_search_params(searchParams=req_params)
        mdb = MongoData()

        raw_data = mdb.search_transactions(searchParams=searchParams)
        fdist = sorted(FrequencyDistribution(raw_data).freq_dist.items(), key=lambda x: x[1], reverse=True)

        if searchParams.topWords is not None:
            if searchParams.keywords is None:
                searchParams.keywords = ''
            for w in fdist[0:searchParams.topWords]:
                searchParams.keywords += w[0] + ' '

        if searchParams.bottomWords is not None:
            bWords = [x for x in fdist if x[1] <= searchParams.bottomWords]
            if searchParams.keywords is None:
                searchParams.keywords = ''
            for w in bWords:
                searchParams.keywords += w[0] + ' '

        return searchParams

    @staticmethod
    def get_lemmatizer():
        lemmatizer = WordNetLemmatizer()
        return lemmatizer

    @staticmethod
    def get_tokenizer():
        tokenizer = RegexpTokenizer(r'\w+')
        return tokenizer

    @staticmethod
    def get_category_colours():
        mdb = MongoData()
        cached_data = mdb.get_category_colours()
        if cached_data is not None:
            results = cached_data
        else:
            results = list()
            category_list = mdb.get_category_summary()
            category_list = sorted(category_list, key=lambda x: x.totalAmount, reverse=True)
            #baseHSL = [0, 18, 28] # This is the HSL equivalent of the base color in the UI
            baseHSL = [50, 18, 17]
            color_list = Tools.calculate_color_list(len(category_list), baseHSL)
            for i, c in enumerate(category_list):
                color = next((x for x in color_list if x['index'] == i), None)
                #item = CategoryData(category=c.category, colour='#%06x' % random.randint(0, 0xFFFFFF))
                item = CategoryData(category=c.category, colour=color['hex'])
                results.append(item)
            mdb.insert_category_colours(results)

        return results


    @staticmethod
    def get_stopwords(language='en'):
        exclusion_file = Path(config.NLP_CONFIG['data_dir'] + "excludedWords.txt")
        excluded_words = list()
        with exclusion_file.open(mode='r') as ef:
            for line in ef:
                word = line.replace('\n', '').replace('\r', '')
                if word is not None:
                    excluded_words.append(word)
        stopwords = get_stop_words(language)
        stopwords.extend(excluded_words)
        return stopwords

    @staticmethod
    def get_unique_categories(training_data):
        results = list()
        for i in training_data:
            for c in i.categories:
                if c not in results:
                    results.append(c)
        return results

    @staticmethod
    def read_transactions_from_file(file_name):
        new_docs = Path(config.NLP_CONFIG['data_dir'] + file_name)
        doc_col = list()
        with new_docs.open(mode='r') as tf:
            for line in tf:
                json_str = line.replace('\r', '').replace('\n', '')
                json_obj = json.loads(json_str)
                analysis_item = AnalysisItem(**json_obj)
                doc_col.append(analysis_item)
        return doc_col

    @staticmethod
    def write_transactions_to_file(transactions, file_name):
        data_file = Path(config.NLP_CONFIG['data_dir'] + file_name)
        with data_file.open(mode='w') as tf:
            for i in transactions:
                tf.write(i.toJson())
                tf.write('\r\n')

    @staticmethod
    def get_stemmer():
        stemmer = PorterStemmer()
        return stemmer

    @staticmethod
    def load_data():
        db = ExistData()
        all_pages = db.get_all_pages()
        results = list()
        for p in all_pages:
            for m in p.months:
                for ex in m.expenses:
                    for e in ex.entries:
                        if e.description is not None:
                            results.append(AnalysisItem(Utilities.preprocess(e.description.english),
                                                        pageid=p.id, year=p.year, month=m.month,
                                                        reales=e.amount.reales, maravedises=e.amount.maravedises))
                    if ex.adjustment is not None and ex.adjustment.description is not None:
                        results.append(AnalysisItem(Utilities.preprocess(ex.adjustment.description.english),
                                                    pageid=p.id, year=p.year, month=m.month,
                                                    reales=ex.adjustment.amount.reales, maravedises=ex.adjustment.amount.maravedises))
                if m.otherAdjustments is not None and m.otherAdjustments.description is not None:
                    results.append(AnalysisItem(Utilities.preprocess(m.otherAdjustments.description.english),
                                                pageid=p.id, year=p.year, month=m.month,
                                                reales=m.otherAdjustments.amount.reales, maravedises=m.otherAdjustments.amount.maravedises))
        return results

    @staticmethod
    def analysis_missing_items():
        edb = ExistData()

        page_ids = edb.get_all_page_ids()
        base_dir = '/users/shanemcgarry/Development/static/alcala/images/'
        missing_files = list()
        extra_files = list()

        for page in page_ids:
            if not os.path.isfile(base_dir + str(page) + '.jpg'):
                missing_files.append(str(page))

        image_files = os.listdir(base_dir)
        for image in image_files:
            ext_pos = image.find('.')
            if ext_pos != -1:
                file_name = image[:ext_pos]
                if not any(file_name in x for x in page_ids) and image.find('Blank') == -1:
                    extra_files.append(file_name)

        print('The following %s image files are missing: ' % len(missing_files))
        print(missing_files)

        print('The following %s files are extraneous to the data:' % len(extra_files))
        print(extra_files)
