from models.serializable import JsonSerializable
import jsonpickle


class PageSearch(JsonSerializable):
    def __init__(self, userID=None, searchPhrase=None, pageIndex=1, resultLimit=50, *args, **kwargs):
        self.searchPhrase = searchPhrase
        self.pageIndex = pageIndex
        self.resultLimit = resultLimit
        self.userID = userID

    @staticmethod
    def from_json(json):
        jsonpickle.set_preferred_backend('simplejson')
        return jsonpickle.decode(json, classes=PageSearch)
