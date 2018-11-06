from eulxml import xmlmap
import jsonpickle
import re
import lxml
import inspect
from tools import Tools


class JsonSerializable(object):
    def __getitem__(self, item):
        result = None
        for attr, value in inspect.getmembers(self):
            if attr == item:
                result = value

        if result is None:
            raise Exception('{item} not found')
        else:
            return result

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
                    if len(value) > 0:
                        if 'JsonSerializable' in value.__class__.__bases__:
                            temp[attr] = Tools.serialise_list(value)
                        else:
                            temp[attr] = value
                    else:
                        temp[attr] = value
                elif 'JsonSerializable' in value.__class__.__bases__:
                    temp[attr] = value.get_properties()
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


class BaseMongoObject(JsonSerializable):
    def __init__(self, _id, *args, **kwargs):
        if _id is not None and _id != 'null' and _id != 'undefined' and _id != '':
            self._id = str(_id)



