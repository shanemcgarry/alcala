from models.serializable import JsonSerializable
import math


class BasePivotItem(JsonSerializable):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, *args, **kwargs):
        self.reales = reales
        self.maravedises = maravedises
        self.transactionCount = transaction_count
        self.totalAmount = self.calculate_total()

    def calculate_total(self):
        r = math.floor(self.maravedises / 34)
        m = self.maravedises % 34
        return (self.reales + r) + (m * .01)


class WordFreqPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, word=None, frequency=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.word = word
        self.frequency = frequency


class WordFreqMonthPivotItem(WordFreqPivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, word=None, frequency=None, month=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, word=word, frequency=frequency, *args, **kwargs)
        self.monthNum = month


class WordFreqYearPivotItem(WordFreqPivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, word=None, frequency=None, year=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, word=word, frequency=frequency, *args, **kwargs)
        self.year = year


class CategoryPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, category=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.category = category


class CategoryMonthPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, category=None, month=None, month_name=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.month = month_name
        self.category = category
        self.monthNum = month


class CategoryYearPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, category=None, year=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.year = year
        self.category = category


class MonthYearPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, year=None, month=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.month = month
        self.year = year

class YearPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, year=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.year = year


class AllPointsPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, year=None, month=None, category=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.month = month
        self.year = year
        self.category = category


class WordFreqPivotItem(BasePivotItem):
    def __init__(self, reales=None, maravedises=None, transaction_count=None, word=None, frequency=None, *args, **kwargs):
        super().__init__(reales=reales, maravedises=maravedises, transaction_count=transaction_count, *args, **kwargs)
        self.word = word
        self.frequency = frequency
