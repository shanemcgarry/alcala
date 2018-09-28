import nltk


class Environment(object):
    def setup(self):
        self.setup_nltk()

    def setup_nltk(self):
        nltk.download('wordnet')