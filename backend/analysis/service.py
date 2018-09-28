from analysis.topicmodel.lda import LDA, LDAResult
import matplotlib.pyplot as plt

class AnalysisService(object):

    def run_full_analysis(self, method='lda'):
        if method == 'lda':
            analysis_result = LDA().do_full_analysis()
            data = analysis_result.data
            labels = analysis_result.labels

        self.plot_data(data, labels)

    def plot_data(self, data, labels):
        plt.scatter(data[:,0], data[:,1], c=labels)
        plt.show()
