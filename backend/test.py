from existDB import ExistData
from mongoDB import MongoData
from tools import Tools
from analysis.classification import DocumentClassifier
from analysis.frequency import FrequencyDistribution
from analysis.utilities import Utilities
from models.analysisItem import AnalysisItem, AnalysisSummary
from models.visSearch import VisSearchParams, VisSearchFeatures
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

chart_list = ['5bcda7e9b3cad4189dc94f91', '5bcdad7cb3cad41b28a9b7f1', '5bcdadc2b3cad41b54965747']
story_list = ['5bcdae36b3cad41b8f8ef903', '5bcdafedb3cad41bddd7eb34']
infobox_list = ['5bcdb227b3cad41d1a6f6bb9', '5bcdb25bb3cad41d4cba836e']

user_id = 'ae635eb02a404a479cb5f5dea4e560e2'
chart_id = '5bcdad7cb3cad41b28a9b7f1'
result = mdb.delete_custom_chart(chart_id)
print(result)

