from eulxml import xmlmap
from models.alcalaCoordinates import AlcalaCoordinates
from models.alcalaBase import AlcalaBase


class AlcalaAmountBase(AlcalaBase):
    # reales = xmlmap.FloatField('currency[@currencyName="reales"]')
    # maravedises = xmlmap.FloatField('currency[@currencyName="maravedises"]')
    # coordinates = xmlmap.NodeField('coordinatesAndAnnotation', AlcalaCoordinates)

    def __init__(self, xml):
        super().__init__(xml)
        self.reales = self.get_float(self.get_element_value('.//currency[@currencyName="reales"]'))
        self.maravedises = self.get_float(self.get_element_value('.//currency[@currencyName="maravedises"]'))
        self.coordinates = self.get_custom_class(".//coordinatesAndAnnotation", AlcalaCoordinates)


class AlcalaAmount(AlcalaAmountBase):
    ROOT_NAME = 'amount'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaEntryAmount(AlcalaAmountBase):
    ROOT_NAME = 'monetaryAmount'

    def __init__(self, xml):
        super().__init__(xml)

