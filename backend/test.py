from existDB import ExistData
from mongoDB import MongoData
from tools import Tools
from analysis.classification import DocumentClassifier
from analysis.frequency import FrequencyDistribution
from analysis.utilities import Utilities
from models.analysisItem import AnalysisItem, AnalysisSummary
from models.search import SearchParameters, SearchFeatures, PageSearch
from models.dashboard import CustomChartInfo, CustomPosterInfo, CustomDashboardInfo, CustomInfoBox
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

json_doc = json.loads('{"pageIndex": 1, "params": {"filteredCategories": []}, "resultLimit": 5, "userID": "5bf57a06b3cad4466ccce7e0"}')
page_search = PageSearch(**json_doc)
results = edb.get_pages_by_keyword("wine", year=None, pageIndex=5, limit=25)
print(len(results.pages))
#
# query="""
# import module namespace kwic="http://exist-db.org/xquery/kwic";
#                 let $hits :=
#                     for $hit in doc("alcala/books/ledger.xml")//pages/page
#                     where $hit//textContent[ft:query(.,"wine")]
#                     order by ft:score($hit) descending
#                     return
#                         $hit
#                 let $total-hits := count($hits)
#                 let $results-to-show := subsequence($hits, 6, 10)
#                 for $hit in $results-to-show
#                 return
#                     <result>
#                         {$hit}
#                         <matches>
#                             {kwic:summarize($hit, <config width="40"/>)}
#                         </matches>
#                     </result>
# """

# query = """
# xquery version "3.1";
# import module namespace kwic="http://exist-db.org/xquery/kwic";
# let $hits : =
#     for $x in doc("shakespeare/plays/hamlet.xml")//PLAY/ACT/SCENE
#     where $x//SPEECH[ft:query(.,"speak")]
#     order by ft:score($x) descending
#     return $x
# let $results := subsequence($hits, 6, 20)
# for $hit in $results
# return
#     <page>
#     <data>{$hit}</data>
#     <match>
#     {kwic:summarize($hit, <config width="40"/>)}
#     </match>
#     </page>
# """
#
# fields = {
#     '_query': query,
#     '_start': 2,
#     '_howmany': 10
# }
# url = "http://localhost:8080/exist/rest/db/"
#
#
# import requests
# session = requests.Session()
# session.auth = ("admin", "")
# session.headers.update({
#             'Content-Type': 'application/xml'
#         })
# response = session.get(url, params=fields, verify=False)
#
# from lxml import etree
# from io import StringIO
#
# xml = etree.parse(StringIO(response.text))
# count = sum(1 for _ in xml.findall(".//page"))
# print(count)

