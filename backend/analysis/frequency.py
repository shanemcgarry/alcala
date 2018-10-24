from nltk import FreqDist
from models.analysisItem import TimeSummary, TimeSeriesData, KeyTimePivotData, SummaryInfo, DataPackage
from models.pivotData import WordFreqMonthPivotItem, WordFreqPivotItem, WordFreqYearPivotItem
from mongoDB import MongoData
from tools import Tools
import math


class FrequencyDistribution:
    """Used to calculate the frequency of words in the transactions within the corpus."""
    def __init__(self, transaction_list, year=None):
        self.transaction_list = transaction_list
        self.freq_dist = FreqDist(w.lower() for w in Tools.build_word_list(self.transaction_list))
        self.year = year

    def get_word_freq_graph_data(self):
        """Creates a DataPackage object used to display timeseries data for word frequency"""
        mdb = MongoData()
        #word_freq_data = self.build_word_freq_info()
        temp_data = mdb.get_word_by_year_summary() if self.year is None else mdb.get_word_by_month_summary(self.year)
        time_series_data = mdb.get_time_series_data('word', temp_data, 'y' if self.year is None else 'm')

        # The time series data is meant to only have a key plus the time series. We also want to add frequency.
        for t in time_series_data:
            word_info = next(filter(lambda fd: fd[0] == t.key, self.freq_dist.items()))
            t.frequency = word_info[1]

        if self.year is not None:
            time_summary = mdb.get_month_summary(self.year)
            timeKey = 'month'
            timeType = 'm'
        else:
            time_summary = mdb.get_year_summary()
            timeKey = 'year'
            timeType = 'y'

        summary_info = mdb.get_total_spent(self.year)
        grand_total = summary_info['reales'] + math.floor(summary_info['maravedises'] / 34) + (
                (summary_info['maravedises'] % 34) / 100)

        time_results = list()
        for t in time_summary:
            time_results.append(TimeSummary(timeValue=t[timeKey], timeType=timeType, reales=t.reales,
                                            maravedises=t.maravedises, totalAmount=t.totalAmount,
                                            transactionCount=t.transactionCount))

        return DataPackage(reales=summary_info['reales'], maravedises=summary_info['maravedises'],
                           grandTotal=grand_total,
                           totalTransactions=summary_info['transaction_count'], timeSummary=time_results, data=time_series_data)




    def build_word_freq_info(self):
        result = []
        for fd in sorted(self.freq_dist.items(), key=lambda kv: kv[1]):
            time_aggregatation = self.aggregate_transactions(fd[0])
            for t in time_aggregatation:
                if self.year is None:
                    result.append(WordFreqYearPivotItem(reales=t['reales'], maravedises=t['maravedises'],
                                                        transaction_count=t['transactionCount'], word=fd[0], frequency=fd[1],
                                                        year=t['timeSlice']))
                else:
                    result.append(WordFreqMonthPivotItem(reales=t['reales'], maravedises=t['maravedises'],
                                                         transaction_count=t['transactionCount'], word=fd[0],
                                                         frequency=fd[1], month=t['timeSlice']))
        return result

    def aggregate_transactions(self, word):
        results = []
        if self.year is None:
            currTime = self.transaction_list[0].year
            timeAttr = 'year'
        else:
            currTime = self.transaction_list[0].monthNum
            timeAttr = 'monthNum'
        reales = float(0)
        maravedises = float(0)
        transactionCount = 0
        for t in self.transaction_list:
            if word in t.words:
                if currTime != t[timeAttr]:
                    results.append({'reales': float(reales), 'maravedises': float(maravedises),
                                    'transactionCount': int(transactionCount), 'timeSlice': currTime})
                    reales = t.reales if t.reales else 0
                    maravedises = t.maravedises if t.maravedises else 0
                    transactionCount = 1
                    currTime = t[timeAttr]
                else:
                    reales += t.reales if t.reales else 0
                    maravedises += t.maravedises if t.maravedises else 0
                    transactionCount += 1

        # Since we are doing manual aggregation, we need to make sure the last summed item made it into the list
        listCheck = next((x for x in results if x['timeSlice'] == currTime), None)
        if listCheck is None:
            results.append({'reales': float(reales), 'maravedises': float(maravedises),
                            'transactionCount': int(transactionCount), 'timeSlice': currTime})

        return results
