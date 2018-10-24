from models.serializable import BaseMongoObject, JsonSerializable


class SearchParameters(BaseMongoObject):
    def __init__(self, _id=None, groupBy=None, year=None, topWords=None, bottomWords=None, keywords=None, filteredCategories=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.groupBy = groupBy
        self.year = year if year != 'null' or year != 'undefined' else None
        self.topWords = topWords if topWords != 'null' and topWords != 'undefined' else None
        self.bottomWords = bottomWords if bottomWords != 'null' and bottomWords != 'undefined' else None
        self.keywords = keywords if keywords != 'null' and keywords != 'undefined' and keywords != '' else None
        self.filteredCategories = filteredCategories if filteredCategories is not None and len(filteredCategories) > 0 else None


class PageSearch(JsonSerializable):
    def __init__(self, userID=None, params=None, pageIndex=1, resultLimit=50, *args, **kwargs):
        self.params = params
        self.pageIndex = pageIndex
        self.resultLimit = resultLimit
        self.userID = userID


class SearchFeatures(BaseMongoObject):
    def __init__(self, _id=None, chartType=None, xField=None, yField=None, sizeField=None, groupField=None, pageLimit=None, pageIndex=None, dateCreated=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.chartType = chartType
        self.xField = xField
        self.yField = yField
        self.sizeField = sizeField
        self.groupField = groupField
        self.pageLimit = pageLimit
        self.pageIndex = pageIndex,
        self.dateCreated = dateCreated


class SearchLogEntry(BaseMongoObject):
    def __init__(self, _id=None, userID=None, type=None, totalHits=None, params=None, features=None, dateCreated=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.type = type
        self.totalHits = totalHits
        self.dateCreated = dateCreated
        self.params = params
        if features is None:
            self.features = []
        else:
            self.features = features
