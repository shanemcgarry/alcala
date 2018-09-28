from models.alcalaCoordinates import AlcalaCoordinates
from models.alcalaBase import AlcalaBase


class AlcalaTextBase(AlcalaBase):
    # english = xmlmap.StringField('textContent[@language="en"]')
    # spanish = xmlmap.StringField('textContent[@language="es"]')
    # coordinates = xmlmap.NodeField('coordinatesAndAnnotation', AlcalaCoordinates)

    def __init__(self, xml):
        super().__init__(xml)
        self.english = self.get_element_value('.//textContent[@language="en"]')

        self.spanish = self.get_element_value('.//textContent[@language="es"]')
        self.coordinates = self.get_custom_class('.//coordinatesAndAnnotation', AlcalaCoordinates)

class AlcalaText(AlcalaTextBase):
    ROOT_NAME = 'text'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaDescription(AlcalaTextBase):
    ROOT_NAME = 'description'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaDeclaration(AlcalaTextBase):
    ROOT_NAME = 'declaration'

    def __init__(self, xml):
        super().__init__(xml)
