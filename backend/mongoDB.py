from pymongo import MongoClient
from models.analysisItem import AnalysisItem, CategoryData, AnalysisUserItem, TimeSeriesData, KeyTimePivotData, \
    TimeSummary, DataPackage
from models.pivotData import CategoryMonthPivotItem, CategoryYearPivotItem, MonthYearPivotItem, AllPointsPivotItem, \
    WordFreqPivotItem, CategoryPivotItem, YearPivotItem, WordFreqMonthPivotItem, WordFreqYearPivotItem
from models.users import SiteUser
from tools import Tools
import config
import math


class MongoData:
    """
    Handles all interactions with an instance of MongoDB. Unlike the ExistData class, MongoData allows for both read
    and write operations as it is the analysis aspect of the system (where eXist-db is a system of record).

    Requirements:
    * pymongo
    * config.py
    * math
    * various custom data models (see import statements).
    """

    def __init__(self):
        """Initialises an instance of mongodb based on parameters supplied in config.py"""
        if 'username' in config.MONGODB_CONFIG:
            self.client = MongoClient(host=config.MONGODB_CONFIG['server'],
                                      port=config.MONGODB_CONFIG['port'],
                                      username=config.MONGODB_CONFIG['username'],
                                      password=config.MONGODB_CONFIG['password'],
                                      authSource=config.MONGODB_CONFIG['database'],
                                      authMechanism='SCRAM-SHA-1')
        else:  # if there is no username, we supply fewer parameters to the constructor
            self.client = MongoClient(host=config.MONGODB_CONFIG['server'],
                                      port=config.MONGODB_CONFIG['port'],
                                      authSource=config.MONGODB_CONFIG['database'])
        # This class only works with alcala data. Although the constructor could be expanded to work with other datasets
        self.db = self.client.alcala

    def log_search(self, searchParams, searchType):
        """Logs the search and returns a valid search id"""
        if searchParams.userID is not None:
            search_obj = { 'userID': searchParams.userID, 'type': searchType, 'params': searchParams.get_properties() }
            search_id = self.db.search_log.insert_one(search_obj)
        else:
            search_id = None

        return str(search_id.inserted_id)

    def log_features(self, visFeatures, searchType='visualisation'):
        """Logs the features of visualisation search for reproduction"""
        features_obj = {'searchID': visFeatures.searchID, 'type': searchType, 'features': visFeatures.get_properties() }
        feature_id = self.db.search_feature.insert_one(features_obj)
        return str(feature_id.inserted_id)

    def insert_one_transaction(self, transaction, use_training=False):
        """Inserts a single transaction (AnalysisItem object) into either the transaction or training collection."""
        if use_training:
            transaction_id = self.db.transactions_training.insert_one(transaction.get_properties())
        else:
            transaction_id = self.db.transactions.insert_one(transaction.get_properties())
        return transaction_id

    def insert_multiple_transactions(self, transaction_list, use_training=False):
        """Inserts multiple transactions (AnalysisItem object) into either the transaction or training collection."""
        json_docs = list(map(lambda t: t.get_properties(), transaction_list))
        if use_training:
            result = self.db.transactions_training.insert_many(json_docs)
        else:
            result = self.db.transactions.insert_many(json_docs)
        return result.inserted_ids

    def update_multiple_transactions(self, transaction_list, use_training=False):
        """Updates multiple transactions (AnalysisItem object) in either the transaction or training collection."""
        if use_training:
            bulk = self.db.transactions_training.initialize_ordered_bulk_op()
        else:
            bulk = self.db.transactions.initialize_ordered_bulk_op()

        for t in transaction_list:
            bulk.find({'_id': t._id}).update({'$set': {'categories': t.categories}})

        bulk.execute()

    def update_training_data(self, id, categories):
        """Updates the cateogries on training data in the curated training data collection."""
        db_result = self.db.curated_training.update_one({'_id': id}, {'$set': {'categories': categories}}, upsert=False)
        query = self.db.curated_training.find({'_id': id})
        return AnalysisUserItem(**query[0])

    def get_word_summary(self, year=None):
        """
        Returns a list of WordFreqPivotItem objects that provides aggregates of amounts for each word in the system.
        NOTE: Can be filtered by year.
        """

        pipeline = []
        pipeline.append({"$unwind": "$words"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
        pipeline.append({"$group": {
                                "_id": {
                                    "word": "$words"
                                },
                                "reales": {"$sum": "$reales"},
                                "maravedises": {"$sum": "$maravedises"},
                                "transaction_count": {"$sum": 1}
                            }
                        })

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(WordFreqPivotItem(word=j['_id']['word'], frequency=j['transaction_count'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_full_summary(self, filters=None):
        """
        Returns a list of AllPointsPivotItem objects that provides aggregates of amounts for each category in the system
        broken down by year and month.
        NOTE: Can be filtered by year.
        """

        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
                                "_id": {
                                    "year": "$year",
                                    "month": "$month",
                                    "category": "$categories"
                                },
                                "reales": {"$sum": "$reales"},
                                "maravedises": {"$sum": "$maravedises"},
                                "transaction_count": {"$sum": 1}
                            }
                        })
        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(AllPointsPivotItem(category=j['_id']['category'], month=j['_id']['month'], year=j['_id']['year'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_category_summary(self, filters=None):
        """
        Returns a list of CaetegoryPivotItem objects that provides aggregates of amounts for each category in the system
        NOTE: Can be filtered by year.
        """

        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group":  {
                                "_id": "$categories",
                                "reales": { "$sum": "$reales"},
                                "maravedises": { "$sum": "$maravedises"},
                                "transaction_count": {"$sum": 1}
                            }
                        })

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(CategoryPivotItem(category=j['_id'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_time_series_data(self, keyName, listData, timeType):
        """
        :param keyName: the name of the key item which you are slicing time data for (typically category or word)
        :param listData: the data from which you are deriving the time data
        :param timeType: whether you are slicing by year (y) or month (m)
        :return: A list of KeyTimePivotData objects that shows the total amount and transaction count broken down by the
        requisite time series (year or month) for each key in the dataset.
        """

        results = []
        curr_key = None
        time_data = []

        # If we are dealing with years, there are certain years which exist in the database. Otherwise if we are dealing
        # with months then we want to get a list of valid months. This will be used to "fill in" missing times in the data
        # for each key
        if timeType == 'y':
            validTimes = [1774, 1775, 1776, 1777, 1778, 1779, 1781]
            timeAttr = 'year'
        elif timeType == 'm':
            validTimes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            timeAttr = 'monthNum'
        else:
            raise Exception('Invalid timeType supplied')

        prevTime = validTimes[0] - 1
        for item in listData:
            if curr_key != item[keyName] and curr_key is not None:
                lastIndex = validTimes.index(prevTime)
                for i in range(lastIndex + 1, len(validTimes), 1):
                    time_data.append(TimeSeriesData(timeValue=validTimes[i], timeType=timeType, totalAmount=0, transactionCount=0))
                results.append(KeyTimePivotData(key=curr_key, timeSeries=time_data))
                time_data = []
                curr_key = item[keyName]
                prevTime = validTimes[0] - 1
            elif curr_key is None:
                curr_key = item[keyName]

            if prevTime not in validTimes:
                startLoop = 0
            else:
                startLoop = validTimes.index(prevTime) + 1

            for i in range(startLoop, validTimes.index(item[timeAttr]), 1):
                time_data.append(TimeSeriesData(timeValue=validTimes[i], timeType=timeType, totalAmount=0, transactionCount=0))

            time_data.append(TimeSeriesData(timeValue=item[timeAttr], timeType=timeType, totalAmount=item.totalAmount, transactionCount=item.transactionCount))
            prevTime = item[timeAttr]
        return results

    def get_word_time_data(self, searchParams=None):
        """
        :param year: Specify a year if you wish to see a monthly breakdown. Set to None if you wish to see a yearly breakdown
        :return: A DataPackage object which contains overall summary information plus a breakdown of timeseries data for each
        word.
        """

        if searchParams is not None and searchParams.year is not None:
            temp_data = self.get_word_by_month_summary(filters=searchParams)
            temp_data = sorted(temp_data, key=lambda x: (x.word, x.monthNum))
            time_summary = self.get_month_summary(filters=searchParams)
            timeType = 'm'
            timeKey = 'month'
        else:
            temp_data = self.get_word_by_year_summary(filters=searchParams)
            temp_data = sorted(temp_data, key=lambda x: (x.word, x.year))
            time_summary = self.get_year_summary(filters=searchParams)
            timeType = 'y'
            timeKey = 'year'

        results = self.get_time_series_data(keyName='word', timeType=timeType, listData=temp_data)
        rawData = self.search_transactions(searchParams)
        summary_info = self.get_total_spent(filters=searchParams)
        grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + (
                    (summary_info['maravedises'] % 34) / 100)

        time_results = list()
        for t in time_summary:
            time_results.append(TimeSummary(timeValue=t[timeKey], timeType=timeType, reales=t.reales,
                                            maravedises=t.maravedises, totalAmount=t.totalAmount,
                                            transactionCount=t.transactionCount))

        return DataPackage(reales=summary_info['reales'], maravedises=summary_info['maravedises'], grandTotal=grand_total,
                           totalTransactions=summary_info['transaction_count'], timeSummary=time_results, data=results,
                           rawData=rawData)

    def get_category_time_data(self, searchParams=None):
        """
        :param year: Specify a year if you wish to see a monthly breakdown. Set to None if you wish to see a yearly breakdown
        :return: A DataPackage object which contains overall summary information plus a breakdown of timeseries data for each
        category.
        """

        if searchParams is not None and searchParams.year is not None:
            temp_data = self.get_category_by_month_summary(filters=searchParams)
            temp_data = sorted(temp_data, key=lambda x: (x.category, x.monthNum))
            time_summary = self.get_month_summary(filters=searchParams)
            timeType = 'm'
            timeKey = 'month'
        else:
            temp_data = self.get_category_by_year_summary(filters=searchParams)
            temp_data = sorted(temp_data, key=lambda x: (x.category, x.year))
            time_summary = self.get_year_summary(filters=searchParams)
            timeType = 'y'
            timeKey = 'year'

        results = self.get_time_series_data(keyName='category', timeType=timeType, listData=temp_data)
        rawData = self.search_transactions(searchParams=searchParams)
        summary_info = self.get_total_spent(filters=searchParams)
        grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + (
                    (summary_info['maravedises'] % 34) / 100)

        time_results = list()
        for t in time_summary:
            time_results.append(TimeSummary(timeValue=t[timeKey], timeType=timeType, reales=t.reales,
                                            maravedises=t.maravedises, totalAmount=t.totalAmount,
                                            transactionCount=t.transactionCount))

        return DataPackage(reales=summary_info['reales'], maravedises=summary_info['maravedises'], grandTotal=grand_total,
                           totalTransactions=summary_info['transaction_count'], timeSummary=time_results, data=results,
                           rawData=rawData)

    def get_categories(self):
        json_list = self.db.transactions.distinct('categories')
        return json_list

    def get_total_spent(self, filters=None):
        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        # pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
            "_id": None,
            "reales": {"$sum": "$reales"},
            "maravedises": {"$sum": "$maravedises"},
            "transaction_count": {"$sum": 1}
        }})

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        return json_list['cursor']['firstBatch'][0]

    def get_word_by_year_summary(self, filters=None):
        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$words"})
        pipeline.append({"$group": {
            "_id": {
                "year": "$year",
                "word": "$words"
            },
            "reales": {"$sum": "$reales"},
            "maravedises": {"$sum": "$maravedises"},
            "transaction_count": {"$sum": 1}
        }})

        print(pipeline)

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(WordFreqYearPivotItem(year=j['_id']['year'], word=j['_id']['word'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_word_by_month_summary(self, filters=None):
        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$words"})
        pipeline.append({"$group": {
            "_id": {
                "month": "$month",
                "word": "$words"
            },
            "reales": {"$sum": "$reales"},
            "maravedises": {"$sum": "$maravedises"},
            "transaction_count": {"$sum": 1}
        }})

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(WordFreqMonthPivotItem(monthNum=j['_id']['month'], word=j['_id']['word'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_category_by_year_summary(self, filters=None):
        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
                            "_id": {
                                "year": "$year",
                                "category": "$categories"
                            },
                            "reales": {"$sum": "$reales"},
                            "maravedises": {"$sum": "$maravedises"},
                            "transaction_count": {"$sum": 1}
                        }
                      })

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(CategoryYearPivotItem(year=j['_id']['year'], category=j['_id']['category'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_category_by_month_summary(self, filters=None):
        """
        Returns a list of CategoryMonthPivotItem objects that provides aggregates of amounts for each category in the system
        broken down by month.
        NOTE: Can be filtered by year.
        """

        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
                            "_id": {
                                "category": "$categories",
                                "month": "$month"
                            },
                            "reales": {"$sum": "$reales"},
                            "maravedises": {"$sum": "$maravedises"},
                            "transaction_count": {"$sum": 1}
                         }})

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(CategoryMonthPivotItem(month_name=self.get_month_name(j['_id']['month']), month=j['_id']['month'],
                                                  category=j['_id']['category'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_month_summary(self, filters=None):
        pipeline = []

        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        # pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
                                "_id": {
                                    "year": "$year",
                                    "month": "$month"
                                },
                                "reales": {"$sum": "$reales"},
                                "maravedises": {"$sum": "$maravedises"},
                                "transaction_count": {"$sum": 1}
                            }
                        })

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(MonthYearPivotItem(year=j['_id']['year'], month=self.get_month_name(j['_id']['month']), **j))
        if len(results) == 0:
            results = None
        return results

    def get_year_summary(self, filters=None):
        pipeline = []
        if filters is not None:
            if filters.keywords is not None:
                pipeline.append({"$match":{"$text": {"$search": filters.keywords}}})
            if filters.year is not None:
                pipeline.append({"$match": {"year": filters.year}})
            if filters.filteredCategories is not None:
                pipeline.append({"$match": {"categories": {"$in": filters.filteredCategories}}})

        # pipeline.append({"$unwind": "$categories"})
        pipeline.append({"$group": {
                                "_id": {
                                    "year": "$year"
                                },
                                "reales": {"$sum": "$reales"},
                                "maravedises": {"$sum": "$maravedises"},
                                "transaction_count": {"$sum": 1}
                            }
                        })

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        results = list()
        for j in json_list['cursor']['firstBatch']:
            results.append(YearPivotItem(year=j['_id']['year'], **j))
        if len(results) == 0:
            results = None
        return results

    def get_month_name(self, month):
        import calendar
        return calendar.month_name[month]

    def insert_category_colours(self, category_colours):
        json_docs = list(map(lambda t:t.get_properties(), category_colours))
        result = self.db.category_info.insert_many(json_docs)
        return result.inserted_ids

    def get_category_colours(self):
        json_list = self.db.category_info.find()
        results = list()
        for j in json_list:
            results.append(CategoryData(**j))
        if len(results) == 0:
            results = None
        return results

    def insert_user(self, user):
        db_user = self.get_user(user.username)
        if db_user is None:
            result = self.db.user_info.insert_one(user.get_properties())
        else:
            result = db_user
        return result.inserted_id

    def get_training_data_by_user(self, user_id):
        json_doc = self.db.curated_training.find({'userId': user_id})
        if json_doc is None:
            return None
        else:
            results = list()
            for j in json_doc:
                results.append(AnalysisUserItem(**j))
            return results

    def insert_multiple_training_for_curation(self, transaction_list):
        json_docs = list(map(lambda t: t.get_properties(), transaction_list))
        result = self.db.curated_training.insert_many(json_docs)
        return result.inserted_ids

    def get_user(self, username):
        json_doc = self.db.user_info.find_one({'username': username})
        if json_doc is None:
            return None
        else:
            return SiteUser(**json_doc)

    def get_user_by_id(self, id):
        json_doc = self.db.user_info.find_one({'_id': id})
        if json_doc is None:
            return None
        else:
            return SiteUser(**json_doc)

    def update_user(self, user):
        result = self.db.user_info.update_one({'_id': user._id}, {'$set': user.get_properties()}, upsert=False)
        return result

    def search_transactions(self, searchParams=None):
        filters = []
        if searchParams is not None:
            if searchParams.year is not None:
                filters.append({'year': searchParams.year})
            if searchParams.keywords is not None:
                filters.append({'$text': {'$search': searchParams.keywords}})
            if searchParams.filteredCategories is not None:
                filters.append({'categories': {'$in': searchParams.filteredCategories}})

        if len(filters) > 0:
            query = {'$and': filters}
        else:
            query = None

        json_list = self.db.transactions.find(query)
        results = list()
        for j in json_list:
            results.append(AnalysisItem(**j))
        if len(results) == 0:
            results = None
        return results

    def get_transactions(self, use_training=False, year=None):
        if use_training:
            collection_name = 'transactions_training'
        else:
            collection_name = 'transactions'

        if year is not None:
            json_list = self.db[collection_name].find({'year': year})
        else:
            json_list = self.db[collection_name].find()

        results = list()
        for j in json_list:
            results.append(AnalysisItem(**j))
        if len(results) == 0:
            results = None
        return results

    def ticks_since_epoch(self, year=None, month=None):
        from datetime import datetime

        start_time = datetime.utcnow()
        if year is not None:
            start_time = datetime(year, 1, 1)
        elif month is not None:
            start_time = datetime(1781, month, 1)

        #ticks_per_ms = 10000
        ms_per_second = 1000
        #ticks_per_second = ticks_per_ms * ms_per_second
        span = datetime(1970, 1, 1) - start_time
        ticks = int(span.total_seconds() * ms_per_second)
        return ticks
