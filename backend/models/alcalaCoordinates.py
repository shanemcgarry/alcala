from models.alcalaBase import AlcalaBase

class AlcalaCoordinates(AlcalaBase):
    ROOT_NAME = 'coordinatesAndAnnotation'
    #__coordinates = xmlmap.StringField('coordinates')

    def __init__(self, xml):
        super().__init__(xml)
        self.__coordinates = self.get_element_value('.//coordinates')

    @property
    def coordinates(self):
        str_list = str(self.__coordinates).split(',')
        return str_list
