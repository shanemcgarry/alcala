from models.alcalaExpenditure import AlcalaExpenditure
from models.alcalaEntry import AlcalaSubTotal, AlcalaOtherAdjustments, AlcalaFinalBalance
from models.alcalaSignOff import AlcalaSignOff
from models.alcalaBase import AlcalaBase

class AlcalaMonth(AlcalaBase):
    ROOT_NAME = 'month'
    #month = xmlmap.IntegerField('@monthID')
    #expenses = xmlmap.NodeListField('expenditure', AlcalaExpenditure)
    #subtotal = xmlmap.NodeField('subTotal', AlcalaSubTotal)
    #otherAdjustments = xmlmap.NodeField('otherAdjustments', AlcalaOtherAdjustments)
    #finalBalance = xmlmap.NodeField('finalBalance', AlcalaFinalBalance)
    #signOff = xmlmap.NodeField('signOff', AlcalaSignOff)

    def __init__(self, xml):
        super().__init__(xml)
        self.expenses = list()
        self.month = self.get_int(self.get_attribute_value(xml, 'monthID'))

        self.load_expenses(xml)
        self.subtotal = self.get_custom_class(".//subTotal", AlcalaSubTotal)
        self.otherAdjustments = self.get_custom_class(".//otherAdjustments", AlcalaOtherAdjustments)
        self.finalBalance = self.get_custom_class(".//finalBalance", AlcalaFinalBalance)
        self.signOff = self.get_custom_class(".//signOff", AlcalaSignOff)

    def load_expenses(self, xml):
        for x in self.get_node_list(".//expenditure"):
            self.expenses.append(AlcalaExpenditure(x))





