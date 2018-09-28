from models.serializable import JsonSerializable
import re


class AlcalaBase(JsonSerializable):

    def __init__(self, xml):
        self.__xml = xml

    def get_int(self, value):
        try:
            return int(value)
        except ValueError:
            return value
        except TypeError:
            return None

    def get_float(self, value):
        try:
            return float(value)
        except ValueError:
            return value
        except TypeError:
            return None

    def get_element_value(self, xpath):
        node = self.get_node(xpath)
        if node is not None:
            text = self.stringify_children(node)
            return self.clean_string(text)
        else:
            return None

    def get_node_list(self, xpath):
        return self.__xml.findall(xpath)

    def get_attribute_value(self, node, attr):
        if node is not None:
            text = node.attrib[attr]
            return self.clean_string(text)
        else:
            return None

    def get_node(self, xpath):
        node = self.__xml.find(xpath)
        return node

    def get_custom_class(self, xpath, cls):
        node = self.get_node(xpath)
        if node is not None:
            return cls(node)
        else:
            return None

    def clean_string(self, text):
        #text = re.sub('^[\r\n]+|\.|[\r\n]+$', "", text)
        text = re.sub('[\r\n]', "", text)
        text = re.sub("\s+", " ", text)
        return text.strip()

    # code taken from stackoverflow answer: https://stackoverflow.com/a/28173933/1313890
    def stringify_children(self, node):
        from lxml.etree import tostring
        from itertools import chain
        parts = ([node.text] +
                 list(chain(*([c.text, tostring(c, encoding=str), c.tail] for c in node.getchildren()))) +
                 [node.tail])
        # filter removes possible Nones in texts and tails
        return ''.join(filter(None, parts))



