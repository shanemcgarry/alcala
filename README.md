
# Alcalá Record Books

This project is the source code that I wrote as part of my doctoral dissertation: _Expanding the Frame: Realising Engagement Through an Interactive, Visualisation-Based Search in Digital Humanities Research Environments_. For more information on the project, its purpose, and the research used to support many of the design decisions, you can read my full dissertation hosted at [Maynooth University Research Archive Library (MURAL)](https://mural.maynoothuniversity.ie/13646/).

As this code is related to my doctoral research, it will remain locked and will not accept collaborations or improvements. Should you be interested in using any of this work, in whole or in part, please contact me directly.

_NOTE: This projects was created in 2018 and some parts may now be deprecated due to changes in libraries. For specific versions utilized, please see [requirements.txt](https://github.com/shanemcgarry/alcala/blob/master/backend/requirements.txt) for information related to backend libraries and [package.json](https://github.com/shanemcgarry/alcala/blob/master/frontend/package.json) for information related to frontend libraries._


## Authors

- [@shanemcgarry](https://www.github.com/shanemcgarry)
- [John Keating (Doctoral Supervisor)](https://www.maynoothuniversity.ie/faculty-science-engineering/our-people/john-keating)


## Prerequisites

_See [requirements.txt](https://github.com/shanemcgarry/alcala/blob/master/backend/requirements.txt) for a full list of third party libraries/components_.

Before you begin, you will need to install the following:
- [MongoDB](https://www.mongodb.com/)
- [eXist-db](http://exist-db.org/exist/apps/homepage/index.html)
- [Python](https://www.python.org/)
- [Angular](https://angular.io/)
- [NVD3](https://nvd3.org/)


## Documentation

This repository is broken into two sections: backend and frontend. The backend is a Python project utilizing Flask and acts as a webserver. All web requests are routed through [server.py](https://github.com/shanemcgarry/alcala/blob/master/backend/server.py), which then routes to the appropriate class or package. 

All data related to the _Alcalá Record Books_ themselves (such as images, transcriptions and translations, etc.) are stored in eXist-db, an XML-based document database. This data is stored onsite at Maynooth University and is not available for public distribution. If you wish to have access to this data, please contact me, and I will get in touch with the copyright holder.

All other data (user logins, saved searches, boundary objects, and compilations) are stored in MongoDB.

The frontend of the project was written in [Angular](https://angular.io) and follows the standard MVC (model-view-controller) pattern. Data visualizations are rendered through the [NVD3](https://nvd3.org/) library—a javascript library that builds off [d3.js](https://d3js.org/).


## Acknowledgements

 - I would like to acknowledge the [Irish Research Council](https://research.ie/) who provided the funding that allowed me to undertake this work.
 - I would like also like to thank my doctoral supervisor, [John Keating](https://www.maynoothuniversity.ie/faculty-science-engineering/our-people/john-keating), without whom I would never have completed my Ph.D. I will be forever grateful for the guidance and direction you provided!
 - Additionally, I'd like to thank the [Computer Science Department](https://www.maynoothuniversity.ie/computer-science) and the [Arts and Humanities Institute](https://www.maynoothuniversity.ie/arts-and-humanities-institute) at [Maynooth University](https://www.maynoothuniversity.ie) for their assistance during my studies.
 - I would also like to thank the creator(s) of [readme.so](https://readme.so) for providing an easy tool for generating ReadMe files.
 - Finally, a special thanks to my amazing husband, [Joshua D. Savage](https://twitter.com/JoshuaDSavage), who provided support and _a lot_ of edits. I wouldn't be where I am today without you!