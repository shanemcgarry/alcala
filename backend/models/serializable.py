from eulxml import xmlmap
import jsonpickle
import re
import lxml
import inspect


class JsonSerializable(object):
    def __getstate__(self):
        temp = dict()
        for attr, value in inspect.getmembers(self):
            if (attr.find("_") == -1
                and attr.find("serialize") == -1
                and attr.find("context") == -1
                and attr.find("node") == -1
                and attr.find("schema") == -1
                and attr.find("fromJson") == -1
                and attr.find("toJson") == -1
                and attr.find("cleanString") == -1
                and attr.find("get_properties") == -1):
                if type(value) is xmlmap.fields.NodeList:
                    temp[attr] = list(value)
                elif (type(value) is xmlmap.fields.StringField
                        or type(value) is str
                        or type(value) is lxml.etree._ElementUnicodeResult):
                        temp[attr] = self.cleanString(value)
                elif (type(value) is xmlmap.fields.IntegerField
                    or type(value) is int
                    or type(value) is float):
                    temp[attr] = value
                elif value is None:
                    temp[attr] = value
                elif type(value) is list:
                    temp[attr] = value
                else:
                    temp[attr] = value
            elif attr.find("_id") != -1:
                temp[attr] = value
        return temp

    def get_properties(self):
        return self.__getstate__()

    def toJson(self):
        jsonpickle.set_preferred_backend('simplejson')
        return jsonpickle.encode(self, unpicklable=False)

    def cleanString(self, value):
        tempValue = str(value)
        #pattern = re.sub('^[\r\n]+|\.|[\r\n]+$', '', tempValue)
        tempValue = re.sub('^[\n]+|\.|[\n]+$', '', tempValue)
        return tempValue



