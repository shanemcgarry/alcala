from models.alcalaText import AlcalaText
from models.alcalaEntry import AlcalaEntry, AlcalaSum, AlcalaAdjustment
from models.alcalaBase import AlcalaBase

class AlcalaExpenditure(AlcalaBase):
    ROOT_NAME = 'expenditure'
    #entryType = xmlmap.StringField('typeOfAbove')
    #title = xmlmap.NodeField('text[1]', AlcalaText)
    #description = xmlmap.NodeField('text[2]', AlcalaText)
    #entries = xmlmap.NodeListField('entry', AlcalaEntry)
    #sum = xmlmap.NodeField('sum', AlcalaSum)
    #adjustment = xmlmap.NodeField('adjustment', AlcalaAdjustment)

    def __init__(self, xml):
        super().__init__(xml)
        self.title = None
        self.description = None
        self.load_text_nodes()
        self.entryType = self.get_element_value('.//typeOfAbove')
        self.sum = self.get_custom_class('.//sum', AlcalaSum)
        self.adjustment = self.get_custom_class('.//adjustment', AlcalaAdjustment)

        self.entries = list()
        for e in self.get_node_list('.//entry'):
            self.entries.append(AlcalaEntry(e))

    def load_text_nodes(self):
        nodes = self.get_node_list('.//text')
        if nodes is not None and len(nodes) > 0:
            self.title = AlcalaText(nodes[0])
            if len(nodes) > 1:
                self.description = AlcalaText(nodes[1])


