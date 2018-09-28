from models.serializable import JsonSerializable
import jsonpickle


class PageSearch(JsonSerializable):
    def __init__(self, search_phrase="", page_index=1, result_limit=50):
        self.searchPhrase = search_phrase
        self.pageIndex = page_index
        self.resultLimit = result_limit

    @staticmethod
    def from_json(json):
        jsonpickle.set_preferred_backend('simplejson')
        return jsonpickle.decode(json, classes=PageSearch)
