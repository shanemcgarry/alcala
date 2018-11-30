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


class CustomPosterSection(JsonSerializable):
    def __init__(self, title=None, description=None, boundaryObjects=None, *args, **kwargs):
        self.title = title
        self.description = description
        self.boundaryObjects = boundaryObjects


class CustomPosterInfo(BaseMongoObject):
    def __init__(self, _id=None, userID=None, title=None, description=None, sections=None, dateCreated=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.title = title
        self.description = description
        self.sections = sections
        self.dateCreated = dateCreated


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
    def __init__(self, _id=None, userID=None, type=None, title=None, description=None, totalItems=None, params=None, features=None, pageID=None, dateCreated=None, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.userID = userID
        self.type = type
        self.title = title
        self.description = description
        self.totalItems = totalItems
        self.params = params
        self.features = features
        self.pageID = pageID
        self.dateCreated = dateCreated

