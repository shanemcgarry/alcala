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

# newUser = SiteUser(username='u180364',password='&XsdZs4r', firstname='Sean', surname='Comerford', roles=['tester'])

james = SiteUser(username='18385701', password='@$k2DqRQ', firstname='James', surname='Adewunmi', allowLogging=False)
julia = SiteUser(username='18471116', password='dY%vdU4?', firstname='Julia', surname='Broughan')
rebecca = SiteUser(username='18470876', password='5u7?Au?@', firstname='Rebecca', surname='Broughan')
jack = SiteUser(username='18382186', password='UwW7vg=a', firstname='Jack', surname='Butler')
katie = SiteUser(username='18342516', password='9P7C$Bj8', firstname='Katie', surname='Dolan')
niamh = SiteUser(username='18395363', password='p&79x7H#', firstname='Niamh', surname='Glackin')
helena = SiteUser(username='18330931', password='?3d2zeCu', firstname='Helena', surname='Harley', allowLogging=False)
funto = SiteUser(username='18475504', password='TBA?9Mvn', firstname='Funto', surname='Joye')
shane = SiteUser(username='16460276', password='x?nVU5%S', firstname='Shane', surname='Kavanagh')
owen = SiteUser(username='18372591', password='8!D&f?dy', firstname='Owen', surname='McGinley')
kayleigh = SiteUser(username='18417702', password='#y8GEfL?', firstname='Kayleigh', surname='McInulty')
martin = SiteUser(username='18753071', password='E%2XbLGy', firstname='Martin', surname='OConnor')
alicia = SiteUser(username='18433224', password='2YF%rHkj', firstname='Alicia', surname='Piccolo')
emma = SiteUser(username='18458696', password='W&2Wnknm', firstname='Emma', surname='Scully')
stephen = SiteUser(username='17428034', password='hV3n#%53', firstname='Stephen', surname='Sheehan Fleming')
eleanor = SiteUser(username='18326913', password='h!6YCa3g', firstname='Eleanor', surname='Thornton')
sarah = SiteUser(username='18453636', password='Z4@KqexK', firstname='Sarah', surname='Waldron McMorrow')
brian = SiteUser(username='bmckenzie', password='Fj3C!uE$', firstname='Brian', surname='McKenzie')


james._id = mdb.insert_user(james)
julia._id = mdb.insert_user(julia)
rebecca._id = mdb.insert_user(rebecca)
jack._id = mdb.insert_user(jack)
katie._id = mdb.insert_user(katie)
niamh._id = mdb.insert_user(niamh)
helena._id = mdb.insert_user(helena)
funto._id = mdb.insert_user(funto)
shane._id = mdb.insert_user(shane)
owen._id = mdb.insert_user(owen)
kayleigh._id = mdb.insert_user(kayleigh)
martin._id = mdb.insert_user(martin)
alicia._id = mdb.insert_user(alicia)
emma._id = mdb.insert_user(emma)
stephen._id = mdb.insert_user(stephen)
eleanor._id = mdb.insert_user(eleanor)
sarah._id = mdb.insert_user(sarah)
brian._id = mdb.insert_user(brian)

print(james.toJson())
print(julia.toJson())
print(rebecca.toJson())
print(jack.toJson())
print(katie.toJson())
print(niamh.toJson())
print(helena.toJson())
print(funto.toJson())
print(shane.toJson())
print(owen.toJson())
print(kayleigh.toJson())
print(martin.toJson())
print(alicia.toJson())
print(emma.toJson())
print(stephen.toJson())
print(eleanor.toJson())
print(sarah.toJson())
print(brian.toJson())

del mdb

