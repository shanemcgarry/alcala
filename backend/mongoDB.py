from pymongo import MongoClient
from sshtunnel import SSHTunnelForwarder
import pymongo
from bson.objectid import ObjectId
from bson.code import Code
from models.analysisItem import AnalysisItem, CategoryData, AnalysisUserItem, TimeSeriesData, KeyTimePivotData, \
    TimeSummary, DataPackage
from models.search import SearchLogEntry
from models.dashboard import CustomStoryInfo, CustomDashboardInfo, CustomChartInfo, CustomInfoBox
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
        elif 'ssh' in config.MONGODB_CONFIG: # if ssh is specified then we need to connect over an ssh tunnel
            self.server = SSHTunnelForwarder(config.MONGODB_CONFIG['server'],
                                             ssh_username=config.MONGODB_CONFIG['ssh']['user'],
                                             ssh_password=config.MONGODB_CONFIG['ssh']['password'],
                                             remote_bind_address=(config.MONGODB_CONFIG['ssh']['localhost'],
                                                                  config.MONGODB_CONFIG['ssh']['localport']))
            self.server.start()
            self.client = MongoClient(config.MONGODB_CONFIG['ssh']['localhost'], self.server.local_bind_port)
        else:  # if there is no username, we supply fewer parameters to the constructor
            self.client = MongoClient(host=config.MONGODB_CONFIG['server'],
                                      port=config.MONGODB_CONFIG['port'],
                                      authSource=config.MONGODB_CONFIG['database'])
        # This class only works with alcala data. Although the constructor could be expanded to work with other datasets
        self.db = self.client.alcala

    def __del__(self):
        if hasattr(self, 'server') and self.server is not None:
            self.server.stop()

    def get_search_log(self, userID, searchType=None):
        """Gets a list of search logs for a specified user (and type if requested)"""
        if searchType is not None:
            json_doc = self.db.search_log.find({'userID': userID, 'type': searchType}).sort('dateCreated', pymongo.DESCENDING)
        else:
            json_doc = self.db.search_log.find({'userID': userID}).sort('dateCreated', pymongo.DESCENDING)

        results = []
        for j in json_doc:
            results.append(SearchLogEntry(**j))

        if len(results) == 0:
            results = None
        return results

    def log_search(self, userID, searchParams, searchType, totalHits=None):
        """Logs the search and returns a valid search id"""
        import datetime
        if userID is not None:
            search_obj = { 'userID': userID, 'type': searchType, 'dateCreated': datetime.datetime.now(), 'params': searchParams.get_properties() }
            if totalHits is not None:
                search_obj['totalHits'] = totalHits
            search_id = self.db.search_log.insert_one(search_obj)
        else:
            search_id = None

        return str(search_id.inserted_id)

    def log_features(self, searchID, search_features):
        """Logs the features of visualisation search for reproduction"""
        print('SearchID is %s' % searchID)
        update_result = self.db.search_log.update({'_id': ObjectId(searchID)}, {
            '$addToSet': {'features': {'$each': [search_features.get_properties()]}}
        })
        json_doc = self.db.search_log.find({'_id': ObjectId(searchID)})
        return SearchLogEntry(**json_doc[0])

    def get_custom_charts(self, userID=None):
        """Gets a list of all custom charts (associated with userID if supplied)"""
        results = []
        if userID is not None:
            json_doc = self.db.user_charts.find({'userID': userID})
        else:
            json_doc = self.db.user_charts.find()

        for j in json_doc:
            results.append(CustomChartInfo(**j))

        if len(results) == 0:
            results = None

        return results

    def get_custom_infoboxes(self, userID=None):
        """Gets a list of all custom info boxes (associated with userID if supplied)"""
        results = []
        if userID is not None:
            json_doc = self.db.user_infoboxes.find({'userID': userID})
        else:
            json_doc = self.db.user_infoboxes.find()

        for j in json_doc:
            results.append(CustomInfoBox(**j))

        if len(results) == 0:
            results = None

        return results

    def get_custom_stories(self, userID=None):
        """Gets a list of all custom stories (associated with userID if supplied)"""
        results = []
        if userID is not None:
            json_doc = self.db.user_stories.find({'userID': userID})
        else:
            json_doc = self.db.user_stories.find()

        for j in json_doc:
            results.append(CustomStoryInfo(**j))

        if len(results) == 0:
            results = None

        return results

    def get_custom_dashboard(self, userID):
        """Gets the dashboard for the specified user"""
        result = None
        json_doc = self.db.user_dashboard.find({'userID': userID})
        for j in json_doc:
            result = CustomDashboardInfo(**j)

        if result is None:
            result = CustomDashboardInfo(userID=userID, charts=[], infoBoxes=[], stories=[])
            result._id = self.insert_custom_dashboard(result)

        return result

    def insert_custom_infobox(self, infoBox):
        """Inserts a saved, customised info box into the database"""
        infoBox_id = self.db.user_infoboxes.insert_one(infoBox.get_properties())
        return str(infoBox_id.inserted_id)

    def update_custom_infobox(self, infoBox):
        update_result = self.db.user_infoboxes.update({'_id': ObjectId(infoBox._id)}, {
            '$set': {'type': infoBox.type, 'icon': infoBox.icon, 'label': infoBox.label, 'colour': infoBox.colour}
        })
        query = self.db.user_infoboxes.find({'_id': ObjectId(infoBox._id)})
        return CustomInfoBox(**query[0])

    def delete_custom_infobox(self, infobox_id):
        delete_result = self.db.user_infoboxes.remove({'_id': ObjectId(infobox_id)}, {'justOne': True})
        self.db.user_dashboard.update({}, {
            '$pull': {'infoBoxes': {'$in': [infobox_id]}}
        })
        return True # This means we didn't raise an exception

    def insert_custom_chart(self, chartObj):
        """Inserts a saved, customised chart into the database"""
        chart_id = self.db.user_charts.insert_one(chartObj.get_properties())
        return str(chart_id.inserted_id)

    def update_custom_chart(self, chartObj):
        update_result = self.db.user_charts.update({'_id': ObjectId(chartObj._id)},{
            '$set': {'title': chartObj.title, 'description': chartObj.description}
        })
        json_doc = self.db.user_charts.find({'_id': ObjectId(chartObj._id)})
        return CustomChartInfo(**json_doc[0])

    def delete_custom_chart(self, chart_id):
        delete_result = self.db.user_charts.remove({'_id': ObjectId(chart_id)}, {'justOne': True})
        self.db.user_stories.update({}, {
            '$pull': {'charts': {'$in': [chart_id]}}
        })
        self.db.user_dashboard.update({}, {
            '$pull': {'charts': {'$in': [chart_id]}}
        })
        return True # this means we didn't raise an exception

    def insert_custom_story(self, storyObj):
        """Inserts a customised user story into the database"""
        story_id = self.db.user_stories.insert_one(storyObj.get_properties())
        return str(story_id.inserted_id)

    def update_custom_story(self, storyInfo):
        query = self.db.user_stories.find({'_id': ObjectId(storyInfo._id)})
        db_story = CustomStoryInfo(**query[0])
        removed_charts = [x for x in db_story.charts if x not in storyInfo.charts]
        self.db.user_stories.update({'_id': ObjectId(storyInfo._id)}, {
            '$set': {'title': storyInfo.title, 'description': storyInfo.description},
            '$addToSet': {'charts': {'$each': storyInfo.charts}}
        })
        self.db.user_stories.update({'_id': ObjectId(storyInfo._id)}, {
            '$pull': {'charts': {'$in': removed_charts}}
        })
        json_doc = self.db.user_stories.find({'_id': ObjectId(storyInfo._id)})
        return CustomStoryInfo(**json_doc[0])

    def delete_custom_story(self, story_id):
        delete_result = self.db.user_stories.remove({'_id': ObjectId(story_id)}, {'justOne': True})
        self.db.user_dashboard.update({}, {
            '$pull': {'stories': {'$in': [story_id]}}
        })
        return True # this means we didn't raise an exception

    def insert_custom_dashboard(self, dashboardObj):
        """Inserts a customised dashboard object into the database"""
        dashboard_id = self.db.user_dashboard.insert_one(dashboardObj.get_properties())
        return str(dashboard_id.inserted_id)

    def update_custom_dashboard(self, dashboardObj):
        query = self.db.user_dashboard.find({'_id': ObjectId(dashboardObj._id)})
        db_dashboard = CustomDashboardInfo(**query[0])
        removed_charts = [x for x in db_dashboard.charts if x not in dashboardObj.charts]
        removed_stories = [x for x in db_dashboard.stories if x not in dashboardObj.stories]
        removed_infoBoxes = [x for x in db_dashboard.infoBoxes if x not in dashboardObj.infoBoxes]

        self.db.user_dashboard.update({'_id': ObjectId(dashboardObj._id)}, {
            '$addToSet': {'charts': {'$each': dashboardObj.charts}, 'stories': {'$each': dashboardObj.stories}, 'infoBoxes': {'$each': dashboardObj.infoBoxes}}
        })
        self.db.user_dashboard.update({'_id': ObjectId(dashboardObj._id)}, {
            '$pull': {'charts': {'$in': removed_charts}, 'stories': {'$in': removed_stories}, 'infoBoxes': {'$in': removed_infoBoxes}}
        })
        query = self.db.user_dashboard.find({'_id': ObjectId(dashboardObj._id)})
        return CustomDashboardInfo(**query[0])

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
        if listData is not None:
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

        # Need to add in the last of the data:
        if prevTime == validTimes[0] - 1:
            lastIndex = validTimes.index(validTimes[0])
        else:
            lastIndex = validTimes.index(prevTime)
        for i in range(lastIndex + 1, len(validTimes), 1):
            time_data.append(
                TimeSeriesData(timeValue=validTimes[i], timeType=timeType, totalAmount=0, transactionCount=0))
        results.append(KeyTimePivotData(key=curr_key, timeSeries=time_data))
        return results

    def get_word_time_data(self, searchParams=None):
        """
        :param year: Specify a year if you wish to see a monthly breakdown. Set to None if you wish to see a yearly breakdown
        :return: A DataPackage object which contains overall summary information plus a breakdown of timeseries data for each
        word.
        """

        if searchParams is not None and searchParams.year is not None:
            temp_data = self.get_word_by_month_summary(filters=searchParams)
            if temp_data is not None:
                temp_data = sorted(temp_data, key=lambda x: (x.word, x.monthNum))
            time_summary = self.get_month_summary(filters=searchParams)
            timeType = 'm'
            timeKey = 'month'
        else:
            temp_data = self.get_word_by_year_summary(filters=searchParams)
            if temp_data is not None:
                temp_data = sorted(temp_data, key=lambda x: (x.word, x.year))
            time_summary = self.get_year_summary(filters=searchParams)
            timeType = 'y'
            timeKey = 'year'

        results = self.get_time_series_data(keyName='word', timeType=timeType, listData=temp_data)
        rawData = self.search_transactions(searchParams)
        summary_info = self.get_total_spent(filters=searchParams)
        if summary_info is not None:
            grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + (
                        (summary_info['maravedises'] % 34) / 100)
            total_reales = summary_info['reales']
            total_maravedises = summary_info['maravedises']
            total_transactions = summary_info['transaction_count']
        else:
            grand_total = None
            total_reales = None
            total_maravedises = None
            total_transactions = None

        time_results = list()
        if time_summary is not None:
            for t in time_summary:
                time_results.append(TimeSummary(timeValue=t[timeKey], timeType=timeType, reales=t.reales,
                                                maravedises=t.maravedises, totalAmount=t.totalAmount,
                                                transactionCount=t.transactionCount))

        return DataPackage(reales=total_reales, maravedises=total_maravedises, grandTotal=grand_total,
                           totalTransactions=total_transactions, timeSummary=time_results, data=results,
                           rawData=rawData)

    def get_category_time_data(self, searchParams=None):
        """
        :param year: Specify a year if you wish to see a monthly breakdown. Set to None if you wish to see a yearly breakdown
        :return: A DataPackage object which contains overall summary information plus a breakdown of timeseries data for each
        category.
        """

        if searchParams is not None and searchParams.year is not None:
            temp_data = self.get_category_by_month_summary(filters=searchParams)
            if temp_data is not None:
                temp_data = sorted(temp_data, key=lambda x: (x.category, x.monthNum))
            time_summary = self.get_month_summary(filters=searchParams)
            timeType = 'm'
            timeKey = 'month'
        else:
            temp_data = self.get_category_by_year_summary(filters=searchParams)
            if temp_data is not None:
                temp_data = sorted(temp_data, key=lambda x: (x.category, x.year))
            time_summary = self.get_year_summary(filters=searchParams)
            timeType = 'y'
            timeKey = 'year'

        results = self.get_time_series_data(keyName='category', timeType=timeType, listData=temp_data)
        rawData = self.search_transactions(searchParams=searchParams)
        summary_info = self.get_total_spent(filters=searchParams)
        if summary_info is not None:
            grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + (
                        (summary_info['maravedises'] % 34) / 100)
            total_reales = summary_info['reales']
            total_maravedises = summary_info['maravedises']
            total_transactions = summary_info['transaction_count']
        else:
            grand_total = None
            total_reales = None
            total_maravedises = None
            total_transactions = None

        time_results = list()
        if time_summary is not None:
            for t in time_summary:
                time_results.append(TimeSummary(timeValue=t[timeKey], timeType=timeType, reales=t.reales,
                                                maravedises=t.maravedises, totalAmount=t.totalAmount,
                                                transactionCount=t.transactionCount))

        return DataPackage(reales=total_reales, maravedises=total_maravedises, grandTotal=grand_total,
                           totalTransactions=total_transactions, timeSummary=time_results, data=results,
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
        if len(json_list['cursor']['firstBatch']):
            return json_list['cursor']['firstBatch'][0]
        else:
            return None

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
            new_user = self.db.user_info.insert_one(user.get_properties())
            result = new_user.inserted_id
        else:
            result = db_user._id
        return str(result)

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
