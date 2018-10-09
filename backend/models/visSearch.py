from models.serializable import JsonSerializable


class VisSearchParams(JsonSerializable):
    def __init__(self, groupBy, year=None, topWords=None, bottomWords=None, keywords=None, filteredCategories=None, *args, **kwargs):
        self.groupBy = groupBy
        self.year = year if year != 'null' or year != 'undefined' else None
        self.topWords = topWords if topWords != 'null' or topWords != 'undefined' else None
        self.bottomWords = bottomWords if bottomWords != 'null' or bottomWords != 'undefined' else None
        self.keywords = keywords if keywords != 'null' or keywords != 'undefined' or keywords != '' else None
        self.filteredCategories = filteredCategories if len(filteredCategories > 0) else None
