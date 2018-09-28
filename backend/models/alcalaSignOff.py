from models.alcalaText import AlcalaDeclaration
from models.alcalaPerson import AlcalaPerson
from models.alcalaBase import AlcalaBase


class AlcalaSignOff(AlcalaBase):
    ROOT_NAME = 'signOff'
    # declaration = xmlmap.NodeField('declaration', AlcalaDeclaration)
    # signatories = xmlmap.NodeListField('signatory', AlcalaPerson)

    def __init__(self, xml):
        super().__init__(xml)
        self.declaration = self.get_custom_class('.//declaration', AlcalaDeclaration)
        self.signatories = list()
        for s in self.get_node_list('.//signatory'):
            self.signatories.append(AlcalaPerson(s))
