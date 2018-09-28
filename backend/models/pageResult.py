from lxml import etree
from xml.sax.saxutils import escape, unescape
from models.serializable import JsonSerializable
import jsonpickle
import datetime
import locale
import re
import math


class PageResultList(JsonSerializable):
    def __init__(self, total_hits, search_phrase, current_index, result_limit):
        self.pages = list()
        self.totalHits = total_hits
        self.resultLimit = result_limit;
        self.totalPageResults = int(math.ceil(total_hits / result_limit))
        self.searchPhrase = search_phrase
        self.currentIndex = current_index

    def add_page(self,page):
        self.pages.append(page)


class PageResult(JsonSerializable):
    def __init__(self, page):
        self.__page__ = page
        self.id = page.id
        self.title = self.get_title()
        self.__contents__ = dict()
        self.load_matches()
        self.matchesString = self.get_matches_text()
        self.matchesArray = self.get_matches_array()
        self.textSnippet = self.get_text_snippet().replace('---', '...')

    def get_title(self):
        year = self.__page__.year
        month = ""
        locale.setlocale(locale.LC_TIME, "en_GB.UTF-8");
        if len(self.__page__.months) > 1:
            month1 = self.__page__.months[0].month
            month2 = self.__page__.months[len(self.__page__.months) - 1].month

            month = self.get_month_name(month1) + " - " + self.get_month_name(month2)
        elif len(self.__page__.months) == 0:
            month = "??"
        else:
            month = self.get_month_name(self.__page__.months[0].month)

        return month + " " + str(year)

    def load_matches(self):
        for m in self.__page__.months:
            for xp in m.expenses:
                self.process_text_node(xp.title)
                self.process_text_node(xp.description)
                for e in xp.entries:
                    self.process_text_node(e.description)
                if xp.sum is not None:
                    self.process_text_node(xp.sum.description)
                if xp.adjustment is not None:
                    self.process_text_node(xp.adjustment.description)
            if m.subtotal is not None:
                self.process_text_node(m.subtotal.description)
            if m.otherAdjustments is not None:
                self.process_text_node(m.otherAdjustments.description)
            if m.finalBalance is not None:
                self.process_text_node(m.finalBalance.description)
            if m.signOff is not None:
                self.process_text_node(m.signOff.declaration)
                for s in m.signOff.signatories:
                    self.process_text_node(s.positionDescription)

    def get_text_snippet(self):
        snippet_list = list()
        for m in self.__page__.months:
            for xp in m.expenses:
                if xp.title is not None:
                    snippet_list.extend(self.process_text_snippet(text_node=xp.title))
                if xp.description is not None:
                    snippet_list.extend(self.process_text_snippet(text_node=xp.description))
                for e in xp.entries:
                    if e.description is not None:
                        snippet_list.extend(self.process_text_snippet(text_node=e.description))
                if xp.sum is not None and xp.sum.description is not None:
                    snippet_list.extend(self.process_text_snippet(text_node=xp.sum.description))
                if xp.adjustment is not None and xp.adjustment.description is not None:
                    snippet_list.extend(self.process_text_snippet(text_node=xp.adjustment.description))
            if m.subtotal is not None and m.subtotal.description is not None:
                snippet_list.extend(self.process_text_snippet(text_node=m.subtotal.description))
            if m.otherAdjustments is not None and m.otherAdjustments.description is not None:
                snippet_list.extend(self.process_text_snippet(text_node=m.otherAdjustments.description))
            if m.finalBalance is not None and m.finalBalance.description is not None:
                snippet_list.extend(self.process_text_snippet(text_node=m.finalBalance.description))
            if m.signOff is not None:
                if m.signOff.declaration is not None:
                    snippet_list.extend(self.process_text_snippet(text_node=m.signOff.declaration))
                for s in m.signOff.signatories:
                    if s.positionDescription is not None:
                        snippet_list.extend(self.process_text_snippet(text_node=s.positionDescription))
        return '---'.join(filter(None, snippet_list))

    def process_text_snippet(self, text_node):
        result = list()
        if text_node is not None:
            result.append(self.build_text_snippet(text_node.english))
            result.append(self.build_text_snippet(text_node.spanish))
        return result

    def build_text_snippet(self, text_string):
        match_str = '<exist:match xmlns:exist="http://exist.sourceforge.net/NS/exist">'
        match_end_str = '</exist:match>'
        if text_string is not None:
            if self.has_match(text_string):
                match_pos = text_string.find(match_str)
                match_end_pos = text_string.find(match_end_str)
                first_space = text_string.find(" ", match_pos - 30)
                temp_str = text_string[first_space + 1:match_pos]
                temp_str += " <strong>" + text_string[match_pos + len(match_str):match_end_pos] + "</strong>"
                last_space = text_string.find(" ", match_end_pos + len(match_end_str) + 30)
                if last_space == -1:
                    last_space = match_end_pos + len(match_end_str) + 30
                temp_str += text_string[match_end_pos + len(match_end_str):last_space] + ' . . .'
                return temp_str
            else:
                return ''
        else:
            return ''

    def has_match(self, text):
        xml = self.get_match_nodes(text)
        for x in xml:
            return True
        return False

    def get_match_nodes(self, text):
        if text is not None:
            text = self.clean_text(text)
            root = etree.XML("<root>" + text + "</root>")
            ns = "{http://exist.sourceforge.net/NS/exist}"
            xml = root.findall(ns + "match")
            return xml
        return None

    def check_for_matches(self, text):
        xml = self.get_match_nodes(text)
        for x in xml:
            if x.text.lower() in self.__contents__:
                self.__contents__[x.text.lower()] += 1
            else:
                self.__contents__[x.text.lower()] = 1

    def process_text_node(self, text_node):
        if text_node is not None:
            self.check_for_matches(text_node.english)
            self.check_for_matches(text_node.spanish)

    def get_matches_array(self):
        result = list()
        for k, v in self.__contents__.items():
            result.append(k + " (" + str(v) + ")")
        return result;

    def get_matches_text(self):
        result = self.get_matches_array()
        return " ".join(result)

    def clean_text(self, text):
        text = re.sub('[&][^a-zA-Z]*', '&amp;', text)
        return text

    def get_month_name(self, month):
        d = "28-%s-2018" % month
        return datetime.datetime.strptime(d, "%d-%m-%Y").strftime("%B")
