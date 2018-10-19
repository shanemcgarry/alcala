from models.serializable import BaseMongoObject


class VisSearchParams(BaseMongoObject):
    def __init__(self, _id=None, groupBy=None, userID=None, year=None, topWords=None, bottomWords=None, keywords=None, filteredCategories=None, *args, **kwargs):
        super.__init__(_id, *args, **kwargs)
        self.groupBy = groupBy
        self.userID = userID
        self.year = year if year != 'null' or year != 'undefined' else None
        self.topWords = topWords if topWords != 'null' and topWords != 'undefined' else None
        self.bottomWords = bottomWords if bottomWords != 'null' and bottomWords != 'undefined' else None
        self.keywords = keywords if keywords != 'null' and keywords != 'undefined' and keywords != '' else None
        self.filteredCategories = filteredCategories if len(filteredCategories) > 0 else None


class VisSearchFeatures(BaseMongoObject):
    def __init__(self, _id=None, graphType=None, searchID=None, xField=None, yField=None, sizeField=None, groupField=None, *args, **kwargs):
        super.__init__(_id, *args, **kwargs)
        self.graphType = graphType
        self.searchID = searchID
        self.xField = xField
        self.yField = yField
        self.sizeField = sizeField
        self.groupField = groupField