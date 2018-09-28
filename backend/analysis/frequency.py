from nltk import FreqDist
from mongoDB import MongoData
from analysis.utilities import Utilities
import math

class FrequencyDistribution:
    def calculate_frequency(self, transaction_list):
        mdb = MongoData()
        fdist = FreqDist([w.lower() for w in Utilities.build_word_list(transaction_list)])


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
