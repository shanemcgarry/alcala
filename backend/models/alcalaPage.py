from models.alcalaMonth import AlcalaMonth
from models.alcalaBase import AlcalaBase

class AlcalaPage(AlcalaBase):
    ROOT_NAME = "page"
    #id = xmlmap.StringField('pageID')
    #year = xmlmap.IntegerField('content/@yearID')
    #months = xmlmap.NodeListField('content/month', AlcalaMonth)

    def __init__(self, xml):
        super().__init__(xml)
        self.id = self.get_element_value(".//pageID")
        self.year = self.get_int(self.get_attribute_value(self.get_node(".//content"), "yearID"))
        self.months = list()
        for m in self.get_node_list(".//content/month"):
            self.months.append(AlcalaMonth(m))




