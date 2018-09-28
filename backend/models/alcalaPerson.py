from models.alcalaCoordinates import AlcalaCoordinates
from models.alcalaBase import AlcalaBase

class AlcalaPositionDescription(AlcalaBase):
    ROOT_NAME = 'position'
    # english = xmlmap.StringField('positionDescription[@language="en"]')
    # spanish = xmlmap.StringField('positionDescription[@language="es"]')
    # coordinates = xmlmap.NodeField('coordinatesAndAnnotation', AlcalaCoordinates)

    def __init__(self, xml):
        super().__init__(xml)
        self.english = self.get_element_value('.//positionDescription[@language="en"]')
        self.spanish = self.get_element_value('.//positionDescription[@language="es"]')
        self.coordinates = self.get_custom_class('.//coordinatesAndAnnotation', AlcalaCoordinates)


class AlcalaName(AlcalaBase):
    ROOT_NAME = 'name'
    # forename = xmlmap.StringField('forename')
    # surname = xmlmap.StringField('surname')

    def __init__(self, xml):
        super().__init__(xml)
        self.forename = self.get_element_value('.//forename')
        self.surname = self.get_element_value('.//surname')



class AlcalaPerson(AlcalaBase):
    ROOT_NAME = 'signatory'
    # id = xmlmap.StringField('@id')
    # fullName = xmlmap.StringField('signatoryName')
    # name = xmlmap.NodeField('name', AlcalaName)
    # positionDescription = xmlmap.NodeField('position', AlcalaPositionDescription)

    def __init__(self, xml):
        super().__init__(xml)
        self.id = self.get_attribute_value(xml, 'id')
        self.fullName = self.get_element_value('.//signatoryName')
        self.name = self.get_custom_class('.//name', AlcalaName)
        self.positionDescription = self.get_custom_class('.//position', AlcalaPositionDescription)

