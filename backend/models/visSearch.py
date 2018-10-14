from models.serializable import JsonSerializable


class VisSearchParams(JsonSerializable):
    def __init__(self, groupBy=None, userID=None, year=None, topWords=None, bottomWords=None, keywords=None, filteredCategories=None, *args, **kwargs):
        self.groupBy = groupBy
        self.userID = userID
        self.year = year if year != 'null' or year != 'undefined' else None
        self.topWords = topWords if topWords != 'null' or topWords != 'undefined' else None
        self.bottomWords = bottomWords if bottomWords != 'null' or bottomWords != 'undefined' else None
        self.keywords = keywords if keywords != 'null' or keywords != 'undefined' or keywords != '' else None
        self.filteredCategories = filteredCategories if len(filteredCategories) > 0 else None


class VisSearchFeatures(JsonSerializable):
    def __init__(self, graphType=None, searchID=None, xField=None, yField=None, sizeField=None, groupField=None, *args, **kwargs):
        self.graphType = graphType
        self.searchID = searchID
        self.xField = xField
        self.yField = yField
        self.sizeField = sizeField
        self.groupField = groupField