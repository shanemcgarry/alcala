from flask import Flask, render_template, send_from_directory, request, jsonify
from existDB import ExistData
from mongoDB import MongoData
from flask_cors import CORS
import base64
from models.pageSearch import PageSearch
from models.analysisItem import AnalysisItem, AnalysisResultList, AnalysisSummary
from models.visSearch import VisSearchParams
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


@app.route("/pages/search/<query>")
def get_page_by_keyword(query):
    edb = ExistData()
    json = base64.b64decode(query).decode('utf-8')
    query_obj = Json.loads(json, object_hook=lambda d: namedtuple('X', d.keys())(*d.values()))
    query_result = edb.get_pages_by_keyword(query_obj.searchPhrase, pageIndex=query_obj.pageIndex,
                                            limit=query_obj.resultLimit)
    response = app.response_class(
        response=query_result.toJson(),
        status=200,
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
    # return jsonify(page.to_json()) //REMOVED BECAUSE IT ESCAPES ALL JSON
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


@app.route("/visualise/dashboard/<year>")
def get_dashboard_data(year):
    mdb = MongoData()
    if year == 'null' or year == 'undefined':
        year = None
    else:
        year = int(year)
    searchParams = VisSearchParams(year=year, filteredCategories=[])
    results = mdb.get_transactions(year=year)
    fdist = FreqDist([w.lower() for w in Utilities.build_word_list(results)])
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


@app.route("/visualise/search", methods=['POST'])
def do_vis_search():
    json_req = request.get_json()
    req_params = VisSearchParams(**json_req)
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

    if searchParams.groupBy == 'category':
        # do category search
        results = mdb.get_category_time_data(searchParams=searchParams)
    elif searchParams.groupBy == 'word':
        # do word search
        results = mdb.get_word_time_data(searchParams=searchParams)
    else:
        raise ApplicationError('Invalid groupBy setting')

    response = app.response_class(
        status=200,
        response=results.toJson(),
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
