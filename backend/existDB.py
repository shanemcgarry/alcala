from pyexistdb import db as edb
from pyexistdb.exceptions import ExistDBException
from models.alcalaPage import AlcalaPage
from models.alcalaEntry import AlcalaEntry, AlcalaAdjustment, AlcalaOtherAdjustments
from models.alcalaSignOff import AlcalaSignOff
from models.pageResult import PageResult, PageResultList
from models.alcalaBase import AlcalaBase
from lxml import etree
from lxml.etree import tostring
import config

class ExistData:
    EXCEPTIONS_PAGEID_TOOMANYRESULTS = """Querying for page {0} caused more than 1 page to return. This should not 
                                          happen. Please contact an administrator to inspect the data."""

    def __init__(self):
        self.db = edb.ExistDB(config.EXISTDB_CONFIG['host'], username=config.EXISTDB_CONFIG['username'], password=config.EXISTDB_CONFIG['password'])

    def get_all_pages(self, pageIndex=1, limit=500):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page return $x'
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.hits):
            page = AlcalaPage(etree.XML(tostring(qr.results[i])))
            results.append(page)

        return results

    def get_all_page_ids(self):
        xquery = 'for $x in distinct-values(doc("alcala/books/ledger.xml")//pages/page/pageID) order by $x return $x'
        qr = self.db.query(xquery, 1, 500)
        results = list()
        for i in range(0, qr.hits):
            temp_item = AlcalaBase(qr.results[i])
            results.append(temp_item.get_element_value("."))
        return results

    def get_all_signoffs(self, pageIndex=1, limit=2000):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page/*/*/signOff return $x'
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.hits):
            sign_off = AlcalaSignOff(etree.XML(tostring(qr.results[i])))
            results.append(sign_off)

        return results

    def get_all_entries(self, pageIndex=1, limit=2000):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page/*/*/expenditure/entry return $x'
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.hits):
            entry = AlcalaEntry(etree.XML(tostring(qr.results[i])))
            results.append(entry)

        return results

    def get_all_adjustments(self, pageIndex=1, limit=2000):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page/*/*/expenditure/adjustment return $x'
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.hits):
            entry = AlcalaAdjustment(etree.XML(tostring(qr.results[i])))
            results.append(entry)

        return results

    def get_all_otherAdjustments(self, pageIndex=1, limit=2000):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page/*/*/otherAdjustments return $x'
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.hits):
            entry = AlcalaOtherAdjustments(etree.XML(tostring(qr.results[i])))
            results.append(entry)

        return results

    def get_entry_count(self, pageIndex=1, limit=50):
        xquery = 'let $x := doc("alcala/books/ledger.xml") return count($x//pages/page/*/*/expenditure/entry )'
        qr = self.db.query(xquery, pageIndex, limit)
        return qr.results[0]

    def get_page(self, pageid, pageIndex=1, limit=50):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page where $x/pageID="%s" return $x' % pageid
        try:
            qr = self.db.query(xquery, pageIndex, limit)
            if qr.hits > 1:
                raise ExistDBException(Exception(str.format(self.EXCEPTIONS_PAGEID_TOOMANYRESULTS, pageid)))

            page = AlcalaPage(etree.XML(tostring(qr.results[0])))
            return page
        except ExistDBException as dberr:
            print(dberr.message())

    def get_pages_by_keyword(self, keyword, pageIndex=1, limit=50):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page where $x//textContent[ft:query(., "%s")] return util:expand($x)' % keyword
        qr = self.db.query(xquery, pageIndex, limit)
        result = PageResultList(total_hits=qr.hits, search_phrase=keyword, current_index=pageIndex, result_limit=limit)
        for i in range(0, qr.count - 1):
            xml = etree.XML(tostring(qr.results[i]))
            page = AlcalaPage(xml)
            result_page = PageResult(page)
            result.add_page(result_page)

        return result

    def get_by_year(self, year, pageIndex=1, limit=50):
        xquery = 'for $x in doc("alcala/books/ledger.xml")//pages/page where $x/content[@yearID="%s"] return $x' % year
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.count - 1):
            page = AlcalaPage(etree.XML(tostring(qr.results[i])))
            results.append(page)

        return results

    def get_by_year_and_month(self, year, month, pageIndex=1,  limit=50):
        xquery = str.format("""for $x in doc("alcala/ledger.xml")//pages/page
                                where $x/content[@yearID="{0}"] and $x/content/month[@monthID="{1}"] 
                                return <page>{
                                        $x/pageID
                                        !$x/content[@yearID="(0)"]
                                        !<content>{
                                            @*, month[@monthID={1}]
                                                !<month>{@*, node()}</month>
                                        }</content>
                                    }</page>""", year, month)
        qr = self.db.query(xquery, pageIndex, limit)
        results = list()
        for i in range(0, qr.count - 1):
            page = AlcalaPage(etree.XML(tostring(qr.results[i])))
            results.append(page)

        return results
