from models.alcalaText import AlcalaDescription
from models.alcalaAmount import AlcalaEntryAmount, AlcalaAmount
from models.alcalaBase import AlcalaBase

class AlcalaEntryBase(AlcalaBase):
    # description = xmlmap.NodeField('description', AlcalaDescription)
    # amount = xmlmap.NodeField('amount', AlcalaAmount)

    def __init__(self, xml):
        super().__init__(xml)
        self.description = self.get_custom_class('.//description', cls=AlcalaDescription)
        self.amount = self.get_custom_class('.//amount', cls=AlcalaAmount)

class AlcalaEntry(AlcalaEntryBase):
    ROOT_NAME = 'entry'
    #amount = xmlmap.NodeField('monetaryAmount', AlcalaEntryAmount)

    def __init__(self, xml):
        super().__init__(xml)
        self.amount = self.get_custom_class('.//monetaryAmount', cls=AlcalaEntryAmount)

class AlcalaSum(AlcalaEntryBase):
    ROOT_NAME = 'sum'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaAdjustment(AlcalaEntryBase):
    ROOT_NAME = 'adjustment'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaSubTotal(AlcalaEntryBase):
    ROOT_NAME = 'subTotal'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaOtherAdjustments(AlcalaEntryBase):
    ROOT_NAME = 'otherAdjustments'

    def __init__(self, xml):
        super().__init__(xml)

class AlcalaFinalBalance(AlcalaEntryBase):
    ROOT_NAME = 'finalBalance'

    def __init__(self, xml):
        super().__init__(xml)


