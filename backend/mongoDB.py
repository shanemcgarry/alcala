from pymongo import MongoClient
from models.analysisItem import AnalysisItem, CategoryData, AnalysisUserItem
from models.pivotData import CategoryMonthPivotItem, CategoryYearPivotItem, MonthYearPivotItem, AllPointsPivotItem, WordFreqPivotItem, CategoryPivotItem, YearPivotItem
from models.users import SiteUser
from tools import Tools
import config
import math


class MongoData:
    def __init__(self):
        if 'username' in config.MONGODB_CONFIG:
            self.client = MongoClient(host=config.MONGODB_CONFIG['server'],
                                      port=config.MONGODB_CONFIG['port'],
                                      username=config.MONGODB_CONFIG['username'],
                                      password=config.MONGODB_CONFIG['password'],
                                      authSource=config.MONGODB_CONFIG['database'],
                                      authMechanism='SCRAM-SHA-1')
        else:
            self.client = MongoClient(host=config.MONGODB_CONFIG['server'],
                                      port=config.MONGODB_CONFIG['port'],
                                      authSource=config.MONGODB_CONFIG['database'])
        self.db = self.client.alcala

    def insert_one_transaction(self, transaction, use_training=False):
        if use_training:
            transaction_id = self.db.transactions_training.insert_one(transaction.get_properties())
        else:
            transaction_id = self.db.transactions.insert_one(transaction.get_properties())
        return transaction_id

    def insert_multiple_transactions(self, transaction_list, use_training=False):
        json_docs = list(map(lambda t: t.get_properties(), transaction_list))
        if use_training:
            result = self.db.transactions_training.insert_many(json_docs)
        else:
            result = self.db.transactions.insert_many(json_docs)
        return result.inserted_ids

    def update_multiple_transactions(self, transaction_list, use_training=False):
        if use_training:
            bulk = self.db.transactions_training.initialize_ordered_bulk_op()
        else:
            bulk = self.db.transactions.initialize_ordered_bulk_op()

        for t in transaction_list:
            bulk.find({'_id': t._id}).update({'$set': {'categories': t.categories}})

        bulk.execute()

    def update_training_data(self, id, categories):
        db_result = self.db.curated_training.update_one({'_id': id}, {'$set': {'categories': categories}}, upsert=False)
        query = self.db.curated_training.find({'_id': id})
        return AnalysisUserItem(**query[0])


    def get_word_frequency_summary(self, year=None):
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


    def get_full_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
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

    def get_category_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
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

    def get_category_by_month_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})

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

    def get_category_time_data(self, year=None):
        results = []
        curr_category = None
        line_data = []
        checks = []

        if year is not None:
            temp_data = self.get_category_by_month_summary(year=year)
            temp_data = sorted(temp_data, key=lambda x: (x.category, x.monthNum))
            prev_key = 0

            for item in temp_data:
                if curr_category != item.category and curr_category is not None:
                    for i in range(12 - prev_key -1, -1, -1):
                        line_data.append([12-i, 0])
                    results.append({ 'key': curr_category, 'values': line_data })
                    line_data = []
                    curr_category = item.category
                    prev_key = 0
                elif curr_category is None:
                    curr_category = item.category

                for i in range(item.monthNum - prev_key - 1):
                    line_data.append([prev_key + i + 1, 0])
                line_data.append([item.monthNum, item.totalAmount])
                prev_key = item.monthNum

        else:
            temp_data = self.get_category_by_year_summary()
            temp_data = sorted(temp_data, key=lambda x: (x.category, x.year))
            prev_key = 1773

            for item in temp_data:
                if curr_category != item.category and curr_category is not None:
                    for i in range(1781 - prev_key - 1):
                        if prev_key + i + 1 == 1780:
                            line_data.append([prev_key + i + 2, 0]) #The +2 is a hack because we need to skip the year 1780
                        else:
                            line_data.append([prev_key + i + 1, 0])
                    results.append({ 'key': curr_category, 'values': line_data })
                    line_data = []
                    checks = []
                    curr_category = item.category
                    prev_key = 1773
                elif curr_category is None:
                    curr_category = item.category

                for i in range(item.year - prev_key - 1):
                    if prev_key != 1779 and item.year != 1781:
                        line_data.append([prev_key + i + 1, 0])
                    elif item.year == 1781 and prev_key != 1779 and i < 6:
                        line_data.append([prev_key + i + 1, 0])
                line_data.append([item.year, item.totalAmount])
                prev_key = item.year
                checks.append(item.year)

        summary_info = self.get_total_spent(year)
        grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + ((summary_info['maravedises'] % 34) / 100)

        if year is not None:
            time_summary = self.get_month_summary(year=year)
        else:
            time_summary = self.get_year_summary(year=year)

        time_results = list()
        for t in time_summary:
            if year is not None:
                time_results.append({'key': t.month, 'totalAmount': t.totalAmount, 'transactionCount': t.transactionCount,
                                     'reales': t.reales, 'maravedises': t.maravedises})
            else:
                time_results.append({'key': t.year, 'totalAmount': t.totalAmount, 'transactionCount': t.transactionCount,
                                     'reales': t.reales, 'maravedises': t.maravedises})


        return { 'summary': {
                    'reales': summary_info['reales'],
                    'maravedises': summary_info['maravedises'],
                    'grandTotal': grand_total,
                    'totalTransactions': summary_info['transaction_count'],
                    'timeGroup': time_results
                    },
                 'data': results }


    def get_total_spent(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})

        pipeline.append({"$group": {
            "_id": None,
            "reales": {"$sum": "$reales"},
            "maravedises": {"$sum": "$maravedises"},
            "transaction_count": {"$sum": 1}
        }})

        json_list = self.db.command('aggregate', 'transactions', pipeline=pipeline, explain=False)
        return json_list['cursor']['firstBatch'][0]

    def get_category_by_year_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
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

    def get_month_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
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

    def get_year_summary(self, year=None):
        pipeline = []
        pipeline.append({"$unwind": "$categories"})
        if year is not None:
            pipeline.append({"$match": {"year": year}})
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
