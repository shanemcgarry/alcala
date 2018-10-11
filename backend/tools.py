import random
from models.visSearch import VisSearchParams

class Tools:
    @staticmethod
    def serialise_list(list_obj):
        str_result = '[' + ','.join(x.toJson() for x in list_obj) + ']'
        return str_result

    @staticmethod
    def check_search_params(searchParams: VisSearchParams):
        if searchParams is not None:
            if Tools.check_for_empty_value(searchParams.year):
                searchParams.year = None
            else:
                searchParams.year = int(searchParams.year)
            if Tools.check_for_empty_value(searchParams.topWords):
                searchParams.topWords = None
            else:
                searchParams.topWords = int(searchParams.topWords)
            if Tools.check_for_empty_value(searchParams.bottomWords):
                searchParams.bottomWords = None
            else:
                searchParams.bottomWords = int(searchParams.bottomWords)
            if Tools.check_for_empty_value(searchParams.keywords):
                searchParams.keywords = None
            if Tools.check_for_empty_value(searchParams.filteredCategories):
                searchParams.filteredCategories = None
            elif isinstance(searchParams.filteredCategories, list) and len(searchParams.filteredCategories) == 0:
                searchParams.filteredCategories = None

        return searchParams

    @staticmethod
    def check_for_empty_value(value):
        if value is None or value == 'null' or value == 'undefined' or value == '':
            return True
        else:
            return False

    @staticmethod
    def calculate_color_list(numItems, baseHSL, useRandom=True):
        diff = round(360 / numItems)
        new_hue = baseHSL[0]
        new_saturation = baseHSL[1]
        new_lightness = baseHSL[2]
        results = []
        results.append({ 'index': 0, 'hex': Tools.rgb2hex(Tools.hsl2rgb(new_hue, new_saturation, new_lightness)) })
        i = 1
        while i < numItems:
            # Calculate the new hue by adding an average distance. If the hue exceeds 359, it must be reset to 0 (Hue
            # is determined by its placement in a colour circle which means it runs from 0 to 359 degrees).
            new_hue += diff
            if new_hue > 359:
                new_hue = 0 + random.randint(0, 15)

            if(useRandom):
                # Calculate a new saturation. If the value is greater than 100, we need to start over at 0. In order to
                # ensure variety, a random number is added when the value is reset.
                new_saturation += baseHSL[1] + round(baseHSL[1] * (diff / 100))
                if new_saturation > 100:
                    new_saturation = 0 + random.randint(1, 25)

                # Calculate a new lightness. We have to be careful that the lightness isn't too dark (less than a value of
                # 10) or too light (more than a value of 90). To ensure variety, a random number is added when the value
                # is reset.
                new_lightness += baseHSL[2] + round(baseHSL[2] * (diff / 100))
                if new_lightness > 90:
                    new_lightness = 10 + random.randint(10, 40)

            print([new_hue, new_saturation, new_lightness])
            results.append({'index': i, 'hex': Tools.rgb2hex(Tools.hsl2rgb(new_hue, new_saturation, new_lightness))})
            i += 1

        return results


    # ======Begin Annotation ==========================================================================================
    # The following code is adapted from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
    # Date annotated: 11 September 2018

    @staticmethod
    def hue2rgb(p, q, t):
        if t < 0:
            t += 1
        if t > 1:
            t -= 1
        if t < 1 / 6:
            return p + (q - p) * 6 * t
        if t < 1 / 2:
            return q
        if t < 2 / 3:
            return p + (q - p) * (2 / 3 - t) * 6
        return p

    @staticmethod
    def hsl2rgb(h, s, l):
        h /= 360
        s /= 100
        l /= 100

        if l < 0.5:
            q = l * (1 + s)
        else:
            q = l + s - l * s
        p = 2 * l - q

        r = Tools.hue2rgb(p, q, h + 1/3)
        g = Tools.hue2rgb(p, q, h)
        b = Tools.hue2rgb(p, q, h - 1/3)

        return [r, g, b]

    @staticmethod
    def rgb2hex(rgb):
        return '#' + Tools.toHex(rgb[0]) + Tools.toHex(rgb[1]) + Tools.toHex(rgb[2])

    @staticmethod
    def toHex(x):
        hexVal = hex(round(x * 255))[2:]
        if len(hexVal) == 1:
            return '0' + hexVal
        else:
            return hexVal

    # ======End Annotation ==========================================================================================

