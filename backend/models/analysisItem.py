from models.serializable import JsonSerializable
import math

class AnalysisResultList(JsonSerializable):
    def __init__(self, hits, search_phrase=None, items=None, summary=None):
        self.hits = hits,
        self.search_phrase = search_phrase,
        self.items = items
        self.summary = summary


class CategoryData(JsonSerializable):
    def __init__(self, category=None, colour=None, *args, **kwargs):
        self.category = category
        self.colour = colour


class AnalysisSummary(JsonSerializable):
    def __init__(self, category_grouping=None, month_grouping=None, freq_dict=None, transaction_list=None):
        self.categoryBreakdown = category_grouping
        self.monthBreakdown = month_grouping
        self.wordFreq_dict = freq_dict
        self.transaction_list = transaction_list
        self.biggestExpense = self.get_biggest_expense()
        self.mostExpensiveMonth = self.get_most_expensive_month()
        self.leastExpensiveMonth = self.get_least_month()
        self.busiestMonth = self.get_busiest_month()
        #self.wordFreq = [{ 'key': x[0], 'value': x[1] } for x in sorted(self.wordFreq_dict.items(), key=lambda kv: kv[1])]
        self.wordFreq = self.build_word_freq_info()

    def build_word_freq_info(self):
        result = []
        for fd in sorted(self.wordFreq_dict.items(), key=lambda kv: kv[1]):
            result.append({ 'word': fd[0], 'frequency': fd[1], 'transactionSummary': self.find_and_sum_transactions(fd[0])})
        return result

    def find_and_sum_transactions(self, word):
        reales = 0
        maravedises = 0
        time_slice = []
        for t in self.transaction_list:
            if word in t.words:
                if t.year not in time_slice:
                    time_slice.append(t.year)
                if t.reales is not None and t.reales != "":
                    reales += float(t.reales)
                if t.maravedises is not None and t.maravedises != "":
                    maravedises += float(t.maravedises)
        return { 'reales': reales, 'maravedises': maravedises, 'timeData': time_slice, 'totalAmount': reales + math.floor(maravedises / 34) + ((maravedises % 34) * .01) }


    def get_biggest_expense(self):
        self.categoryBreakdown.sort(key=lambda x: x.totalAmount, reverse=True)
        return self.categoryBreakdown[0]

    def get_most_expensive_month(self):
        self.monthBreakdown.sort(key=lambda x: x.totalAmount, reverse=True)
        return self.monthBreakdown[0]

    def get_least_month(self):
        self.monthBreakdown.sort(key=lambda x: x.totalAmount, reverse=False)
        return self.monthBreakdown[0]

    def get_busiest_month(self):
        self.monthBreakdown.sort(key=lambda x: x.transactionCount, reverse=True)
        return self.monthBreakdown[0]

    def get_top10_words(self):
        sorted_fd = sorted(self.wordFreq_dict.items(), key=lambda kv: kv[1], reverse=True)
        return dict(sorted_fd[:10])

    def get_bottom10_words(self):
        sorted_fd = sorted(self.wordFreq_dict.items(), key=lambda kv: kv[1], reverse=False)
        return list(dict(sorted_fd[:10]).keys())


class AnalysisItem(JsonSerializable):
    def __init__(self, words, _id=None, categories=None, year=None, month=None, reales=None, maravedises=None, pageid=None, *args, **kwargs):
        self.words = words
        self.categories = categories
        self.pageid = pageid
        self.year = year
        self.month = month
        self.reales = reales
        self.maravedises = maravedises
        self._id = _id
        self.monthName = self.get_month_name()

        import uuid
        if self._id is None:
            self._id = uuid.uuid4().hex

    def get_month_name(self):
        import calendar
        return calendar.month_name[self.month]

class AnalysisUserItem(AnalysisItem):
    def __init__(self, words, _id=None, categories=None, year=None, month=None, reales=None, maravedises=None, pageid=None, userId=None, *args, **kwargs):
        super().__init__(words=words, _id=_id, categories=categories, year=year, month=month, reales=reales, maravedises=maravedises, pageid=pageid, *args, **kwargs)
        self.userId = userId
