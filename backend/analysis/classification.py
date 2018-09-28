from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
from sklearn import svm
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.multiclass import OneVsRestClassifier
import random


class DocumentClassifier:
    def __init__(self):
        self.label_bin = MultiLabelBinarizer()

    def classify(self, data_train, data, test_mode=False):
        train_labels = self.label_bin.fit_transform([i.categories for i in data_train])
        train_data = [' '.join(i.words) for i in data_train]

        if test_mode:
            data_classify = [' '.join(i.words) for i in random.sample(data, 100)]
        else:
            data_classify = [' '.join(i.words) for i in data]

        classifer = Pipeline([
            ('vectorizer', CountVectorizer()),
            ('tfidf', TfidfTransformer()),
            ('clf', OneVsRestClassifier(LinearSVC()))
        ])

        classifer.fit(train_data, train_labels)
        predicted = classifer.predict(data_classify)
        predicted_labels = self.label_bin.inverse_transform(predicted)

        if test_mode:
            null_labels = [x for x in predicted_labels if not x]
            return 1 - (len(null_labels)/100)
        else:
            return predicted_labels


