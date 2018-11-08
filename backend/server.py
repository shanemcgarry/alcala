from flask import Flask, render_template, send_from_directory, request, jsonify
from existDB import ExistData
from mongoDB import MongoData
from flask_cors import CORS
import base64
from models.analysisItem import AnalysisItem, AnalysisResultList, AnalysisSummary
from models.search import SearchParameters, SearchFeatures, PageSearch
from models.dashboard import CustomDashboardInfo, CustomStoryInfo, CustomInfoBox, CustomChartInfo
from analysis.frequency import FrequencyDistribution
from models.users import SiteUser
from models.flaskErrors import ApplicationError
import json as Json
from collections import namedtuple
from nltk import FreqDist
from analysis.utilities import Utilities
from tools import Tools
import json
import uuid
import random

#app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
app = Flask(__name__)
CORS(app)


@app.errorhandler(ApplicationError)
def handle_application_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)


@app.route("/home/sample_data/<size>")
def get_sample_data(size):
    edb = ExistData()
    size = int(size)
    all_pages = [p for p in edb.get_all_pages() if p.months]
    results = random.sample(all_pages, size)
    response = app.response_class(
        response=Tools.serialise_list(results),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/search/page", methods=['POST'])
def get_page_by_keyword():
    json_req = request.get_json()
    page_search = PageSearch(**json_req['info'])
    origParams = SearchParameters(**json_req['params'])
    logSearch = json_req['logSearch']
    searchParams = Utilities.process_search_params(SearchParameters(**json_req['params']))
    edb = ExistData()
    query_result = edb.get_pages_by_keyword(searchParams.keywords, year=searchParams.year, pageIndex=page_search.pageIndex,
                                            limit=page_search.resultLimit)

    if not Tools.check_for_empty_value(page_search.userID) and logSearch:
        mdb = MongoData()
        if 'searchID' not in json_req.keys() or Tools.check_for_empty_value(json_req['searchID']):
            query_result.searchID = mdb.log_search(page_search.userID, origParams, 'keyword', totalHits=query_result.totalHits)
        else:
            query_result.searchID = json_req['searchID']
        search_feature = SearchFeatures(pageLimit=page_search.resultLimit, pageIndex=page_search.pageIndex)
        mdb.log_features(query_result.searchID, search_feature)

    response = app.response_class(
        response=query_result.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/search/log/features", methods=['POST'])
def log_search_features():
    mdb = MongoData()
    json_req = request.get_json()
    search_features = SearchFeatures(**json_req['features'])
    search_features._id = uuid.uuid4().hex
    log_entry = mdb.log_features(json_req['searchID'], search_features)
    response = app.response_class(
        status=200,
        response=log_entry.toJson(),
        mimetype='application/json'
    )
    return response


@app.route("/search/logs", methods=['POST'])
def get_search_logs():
    mdb = MongoData()
    json_data = request.get_json()
    result = mdb.get_search_log(json_data['userID'], json_data['type'])
    response = app.response_class(
        response=Tools.serialise_list(result),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/search/visualise", methods=['POST'])
def do_vis_search():
    json_req = request.get_json()
    mdb = MongoData()
    searchParams = Utilities.process_search_params(SearchParameters(**json_req['params']))

    if searchParams.groupBy == 'category':
        # do category search
        results = mdb.get_category_time_data(searchParams=searchParams)
    elif searchParams.groupBy == 'word':
        # do word search
        results = mdb.get_word_time_data(searchParams=searchParams)
    else:
        raise ApplicationError('Invalid groupBy setting')

    if 'logSearch' in json_req.keys():
        logSearch = json_req['logSearch']
    else:
        logSearch = False

    if 'userID' in json_req.keys():
        if not Tools.check_for_empty_value(json_req['userID']) and logSearch:
            results.searchID = mdb.log_search(json_req['userID'], searchParams, 'visualisation')

    response = app.response_class(
        status=200,
        response=results.toJson(),
        mimetype='application/json'
    )
    return response


@app.route("/page/<page_id>")
def get_page(page_id):
    edb = ExistData()
    page = edb.get_page(page_id)
    response = app.response_class(
        response=page.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/visualise/transactions")
def get_visualisation_data():
    mdb = MongoData()
    transactions = mdb.get_transactions()
    result = AnalysisResultList(hits=len(transactions), items=transactions)
    response = app.response_class(
        response=result.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/<userID>")
def get_user_dashboard(userID):
    mdb = MongoData()
    result = mdb.get_custom_dashboard(userID)
    response = app.response_class(
        response = result.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/", methods=['POST'])
def save_user_dashboard():
    mdb = MongoData()
    json_data = request.get_json()
    dashboardObj = CustomDashboardInfo(**json_data)
    if Tools.check_for_empty_value(dashboardObj._id):
        dashboardObj._id = mdb.insert_custom_dashboard(dashboardObj)
    else:
        dashboardObj = mdb.update_custom_dashboard(dashboardObj)

    response = app.response_class(
        response=dashboardObj.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/story/<userID>")
def get_user_stories(userID):
    mdb = MongoData()
    results = mdb.get_custom_stories(userID=userID)
    response = app.response_class(
        response=Tools.serialise_list(results),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/story", methods=['POST'])
def save_user_story():
    mdb = MongoData()
    json_data = request.get_json()
    storyObj = CustomStoryInfo(**json_data)
    if Tools.check_for_empty_value(storyObj._id):
        storyObj._id = mdb.insert_custom_story(storyObj)
    else:
        storyObj = mdb.update_custom_story(storyObj)

    response = app.response_class(
        response=storyObj.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/story/delete", methods=['POST'])
def delete_user_story():
    mdb = MongoData()
    json_data = request.get_json()
    storyObj = CustomStoryInfo(**json_data)
    mdb.delete_custom_story(storyObj._id)
    response = app.response_class(
        response=json.dumps('{}'),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/infobox/<userID>")
def get_user_infoboxes(userID):
    mdb = MongoData()
    results = mdb.get_custom_infoboxes(userID=userID)
    response = app.response_class(
        response=Tools.serialise_list(results),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/infobox", methods=['POST'])
def save_user_infobox():
    mdb = MongoData()
    json_data = request.get_json()
    infoBox = CustomInfoBox(**json_data)
    if hasattr(infoBox, '_id') and not(Tools.check_for_empty_value(infoBox._id)):
        infoBox = mdb.update_custom_infobox(infoBox)
    else:
        infoBox._id = mdb.insert_custom_infobox(infoBox)

    response = app.response_class(
        response=infoBox.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/infobox/delete", methods=['POST'])
def delete_user_infobox():
    mdb = MongoData()
    json_data = request.get_json()
    infoBox = CustomInfoBox(**json_data)
    mdb.delete_custom_infobox(infoBox._id)
    response = app.response_class(
        response=json.dumps('{}'),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/chart/<userID>")
def get_user_charts(userID):
    mdb = MongoData()
    results = mdb.get_custom_charts(userID)
    for r in results:
        cleanParams = SearchParameters(groupBy=r.searchParams['groupBy'], year=r.searchParams['year'], topWords=r.searchParams['topWords'],
                                       bottomWords=r.searchParams['bottomWords'],keywords=r.searchParams['keywords'],
                                       filteredCategories=r.searchParams['filteredCategories'])
        cleanParams = Tools.check_search_params(cleanParams)
        if cleanParams.groupBy == 'category':
            # do category search
            r.data = mdb.get_category_time_data(searchParams=cleanParams)
        elif cleanParams.groupBy == 'word':
            # do word search
            r.data = mdb.get_word_time_data(searchParams=cleanParams)
        else:
            raise ApplicationError('Invalid groupBy setting')

    response = app.response_class(
        response=Tools.serialise_list(results),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/chart", methods=['POST'])
def save_user_chart():
    mdb = MongoData()
    json_data = request.get_json()
    chartObj = CustomChartInfo(**json_data)
    if hasattr(chartObj, '_id') and  not(Tools.check_for_empty_value(chartObj._id)):
        chartObj = mdb.update_custom_chart(chartObj)
    else:
        chartObj._id = mdb.insert_custom_chart(chartObj)

    response = app.response_class(
        response=chartObj.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/dashboard/chart/delete", methods=['POST'])
def delete_user_chart():
    mdb = MongoData()
    json_data = request.get_json()
    chartObj = CustomChartInfo(**json_data)
    mdb.delete_custom_chart(chartObj._id)
    response = app.response_class(
        response=json.dumps('{}'),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/visualise/dashboard/<year>")
def get_dashboard_data(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    searchParams = SearchParameters(year=year, filteredCategories=[])
    results = mdb.get_transactions(year=year)
    fdist = FreqDist([w.lower() for w in Tools.build_word_list(results)])
    categoryResults = mdb.get_category_summary(searchParams)
    monthResults = mdb.get_month_summary(searchParams)
    summaryResult = AnalysisSummary(category_grouping=categoryResults, month_grouping=monthResults, freq_dict=fdist, transaction_list=results)
    response = app.response_class(
        response=summaryResult.toJson(),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/colour_palette/<numColours>")
def get_colour_palette(numColours):
    result = Tools.calculate_color_list(int(numColours), [0, 18, 28], useRandom=False)
    response = app.response_class(
        response = json.dumps(result),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route("/login", methods=['GET', 'POST'])
def authenticate_user():
    json_req = request.get_json()
    temp_user = SiteUser(**json_req)
    mdb = MongoData()
    db_user = mdb.get_user(temp_user.username)
    if db_user is None:
        login_result = temp_user
        login_result.loginToken = None
    elif db_user.password != temp_user.password:
        login_result = db_user
        login_result.loginToken = None
    else:
        login_result = db_user
        login_result.loginToken = uuid.uuid4().hex

    login_result.password = None # clear out the password so we don't pass it back
    return login_result.toJson(), 200


@app.route("/user/update", methods=['POST'])
def update_user():
    json_req = request.get_json();
    mdb = MongoData()
    db_user = mdb.get_user_by_id(json_req['_id'])
    if db_user is None:
        raise ApplicationError('The user id supplied (%) is invalid.' % json_req['_id'], status_code=420)
    else:
        for k,v in json_req.items():
            db_user[k] = v
        mdb.update_user(db_user)
        return db_user.toJson(), 200


@app.route("/user/data/logs", methods=['POST'])
def get_user_search_logs():
    mdb = MongoData()
    json_data = request.get_json()




@app.route("/visualise/wordfreq/time_data/<year>")
def get_wordfreq_time_data(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    transactions = mdb.get_transactions(year=year)
    freq = FrequencyDistribution(transactions, year=year)
    results = freq.get_word_freq_graph_data()
    response = app.response_class(
        status=200,
        response=results.toJson(),
        mimetype='application/json'
    )
    return response


@app.route("/visualise/category_time_data/<year>")
def get_category_time_data(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    results = mdb.get_category_time_data(year)
    response = app.response_class(
        status=200,
        response=json.dumps(results),
        mimetype='application/json'
    )
    return response


@app.route("/visualise/get_raw_data/<year>")
def get_raw_data(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    results = mdb.get_transactions(use_training=False, year=year)
    results = sorted(results, key=lambda x: (x.year, x.month))
    response = app.response_class(
        status=200,
        response=Tools.serialise_list(results),
        mimetype='application/json'
    )
    return response


@app.route("/admin/training_data/update", methods=['GET', 'POST'])
def update_training_data():
    mdb = MongoData()
    json_req = request.get_json()
    result = mdb.update_training_data(json_req['_id'], json_req['categories'])
    response = app.response_class(
        status=200,
        response=result.toJson(),
        mimetype='application/json'
    )
    return response


@app.route("/admin/training_data/<user_id>")
def get_training_data(user_id):
    mdb = MongoData()
    results = mdb.get_training_data_by_user(user_id)
    response = app.response_class(
        status=200,
        response=Tools.serialise_list(results),
        mimetype='application/json'
    )
    return response


@app.route("/visualise/categories/<year>")
def get_categories(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    results = mdb.get_category_summary(year=year)
    results = sorted(results, key=lambda x: x.category)
    response = app.response_class(
        status=200,
        response=Tools.serialise_list(results),
        mimetype='application/json'
    )
    return response


@app.route("/visualise/category_data")
def get_category_data():
    results = Utilities.get_category_colours()
    response = app.response_class(
        status=200,
        response=Tools.serialise_list(results),
        mimetype='application/json'
    )
    return response


if __name__ == "__main__":
    app.run()
