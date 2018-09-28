from analysis.utilities import Utilities
from gensim import corpora, models
import gensim
import pyLDAvis.gensim
import warnings


class LDAResult(object):
    def __init__(self, d, l, m):
        self.data = d
        self.labels = l
        self.model = m


class LDA(object):

    def __init__(self):
        self.exclusion_file = "data/excludedWords.txt"

    def do_full_analysis(self, topics=20, num_passes=20):
        data = Utilities.get_transactions_text()
        documents = list(map(lambda d:' '.join(d.words)))

        # Create a dictionary
        dictionary = corpora.Dictionary(documents)
        print("Number of unique words in initial dictionary: %d" % len(dictionary))

        # Generated a document-term matrix
        dtm = [dictionary.doc2bow(doc) for doc in documents]
        print('Number of documents: %d' % len(dtm))

        # Now create the model
        temp = dictionary[0] # hack to load the dictionary
        lda_model = gensim.models.ldamodel.LdaModel(dtm, num_topics=topics, id2word=dictionary.id2token, passes=num_passes)

        # Finally visualise the model
        warnings.filterwarnings("ignore", category=DeprecationWarning)

        data_vis = pyLDAvis.gensim.prepare(lda_model, dtm, dictionary)
        pyLDAvis.show(data_vis)
        return data_vis
