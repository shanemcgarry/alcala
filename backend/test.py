from existDB import ExistData
from mongoDB import MongoData
from tools import Tools
from analysis.classification import DocumentClassifier
from analysis.frequency import FrequencyDistribution
from analysis.utilities import Utilities
from models.analysisItem import AnalysisItem, AnalysisSummary
from models.search import SearchParameters, SearchFeatures
from models.dashboard import CustomChartInfo, CustomStoryInfo, CustomDashboardInfo, CustomInfoBox
from eulxml import xmlmap
import json
import re
from pathlib import Path
import config
from nltk import FreqDist
from models.users import SiteUser
import os.path
import uuid

edb = ExistData()
mdb = MongoData()

# Read the training data from a file
# training_first100 = Utilities.read_transactions_from_file('training_data_first100.json')
# training_freq100 = Utilities.read_transactions_from_file('training_data_freq100.json')
# training_random100 = Utilities.read_transactions_from_file('training_data_random100.json')
#
# # Insert training data into mongo
# mdb.insert_multiple_transactions(transaction_list=training_first100, use_training=True)
# mdb.insert_multiple_transactions(transaction_list=training_freq100, use_training=True)
# mdb.insert_multiple_transactions(transaction_list=training_random100, use_training=True)
#
# # Get a list of clean transactions & a combined list of all training data
# transactions = Utilities.get_clean_transactions();
# training_data = mdb.get_transactions(use_training=True)
#
# # Get a list of predicted labels
# classifier = DocumentClassifier()
#
# # Loop through and update the transactions with the predicted category
# predicted_categories = classifier.classify(data_train=training_data, data=transactions)
# for t, c in zip(transactions, predicted_categories):
#     t.categories = c
#
# # Write everything to mongo
# mdb.update_multiple_transactions(transaction_list=transactions)

# year = None
# results = mdb.get_transactions(year=year)
# fdist = FreqDist([w.lower() for w in Utilities.build_word_list(results)])
# categoryResults = mdb.get_category_summary(year=year)
# monthResults = mdb.get_month_summary(year=year)
# summaryResult = AnalysisSummary(category_grouping=categoryResults, month_grouping=monthResults, freq_dict=fdist, transaction_list=results)
# print(summaryResult.toJson())

# Create user accounts for Tom & John
# users = list()
# users.append(SiteUser(_id=uuid.uuid4().hex, username='jkeating', password='@lCala2018!', firstname='John', surname='Keating', roles=['admin']))
# users.append(SiteUser(_id=uuid.uuid4().hex, username='toconnor', password='@lCala2018!', firstname='Tom', surname='O\'Connor', roles=['admin']))
#
# for u in users:
#     mdb.insert_user(u)
#
# Assign training documents to each of them
# training_docs = mdb.get_transactions(use_training=True)
# counter = 1
# for t in training_docs:
#     t.categories = list()
#     if counter % 2 == 0:
#         t.userId = users[0]._id
#     else:
#         t.userId = users[1]._id
#     counter += 1
#
# results = mdb.insert_multiple_training_for_curation(training_docs)

# user_id = 'ae635eb02a404a479cb5f5dea4e560e2'
# # user_id = '2da06d594a0847348cfd0a7bcf1fed70'
# result = mdb.get_search_log(user_id, searchType='keyword')
# print(Tools.serialise_list(result))

seanc = SiteUser(username='u180364',password='&XsdZs4r', firstname='Sean', surname='Comerford', roles=['tester'])
seanr = SiteUser(username='p180066',password='d#9rtjPF', firstname='Sean', surname='Rooney', roles=['tester'])
riang = SiteUser(username='u180488',password='&DSeU2eH', firstname='Rian', surname='Gallagher', roles=['tester'])
aaronm = SiteUser(username='u180555',password='HCZ?f44Z', firstname='Aaron', surname='McAdams', roles=['tester'])
colmr = SiteUser(username='p180097',password='@VBqj497', firstname='Colm', surname='Rourke', roles=['tester'])

seanc._id = mdb.insert_user(seanc)
seanr._id = mdb.insert_user(seanr)
riang._id = mdb.insert_user(riang)
aaronm._id = mdb.insert_user(aaronm)
colmr._id = mdb.insert_user(colmr)

print(seanc.toJson())
print(seanr.toJson())
print(riang.toJson())
print(aaronm.toJson())
print(colmr.toJson())

del mdb

