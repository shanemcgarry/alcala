from models.serializable import JsonSerializable, BaseMongoObject


class CustomChartInfo(BaseMongoObject):
    def __init__(self, _id=None, userID=None, title=None, description=None, searchParams=None, features=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.title = title
        self.description = description
        self.searchParams = searchParams
        self.features = features
        self.data = None


class CustomStoryInfo(BaseMongoObject):
    def __init__(self, _id=None, userID=None, title=None, description=None, charts=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.title = title
        self.description = description
        self.charts = charts


class CustomDashboardInfo(BaseMongoObject):
    def __init__(self, _id=None, userID=None, infoBoxes=None, charts=None, stories=None, boundaryObjects=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.infoBoxes = infoBoxes
        self.charts = charts
        self.stories = stories
        self.boundaryObjects = boundaryObjects


class CustomInfoBox(BaseMongoObject):
    def __init__(self, _id=None, userID=None, type=None, icon=None, label=None, colour=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.type = type
        self.icon = icon
        self.label = label
        self.colour = colour

class BoundaryObject(BaseMongoObject):
    def __init__(self, _id=None, userID=None, type=None, title=None, description=None, params=None, features=None, pageID=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.type = type
        self.title = title
        self.description = description
        self.params = params
        self.features = features
        self.pageID = pageID

