const {
  DefaultContext,
  DefaultRequestMaker,
  BaseHtmlParser,
  DefaultLogger,
  ValueGrabber,
} = require('crawl-e');

let context = new DefaultContext();
let logger = new DefaultLogger();
let requestMaker = new DefaultRequestMaker();
requestMaker.logger = logger;

let url = 'https://www.amazon.de/gp/video/storefront';

class RedditResponseParser extends BaseHtmlParser {
  constructor() {
    super();

    this.links = new ValueGrabber((box, context) => {
      return `https://www.amazon.de/gp/video/storefront${box
        .find('a')
        .attr('href')}`;
    });

    this.titleGrabber =  new ValueGrabber('h1._2IIDsE');
    // this.description = new ValueGrabber('div._3qsVvm div');
  }


  parseMoviesList(response, context, callback) {
    let { container, parsingContext } = this.prepareHtmlParsing(
      response.text,
      context
    );
    this.parseList(
      container,
      parsingContext,
      'links',
      { box: 'div.lEY3hg' },
      (box, context, cb) => {
        cb(null, this.parseLinkBox(box, context));
      },
      callback
    );
  }

  parseLinkBox(box, context) {
    return this.links.grabFirst(box, context);
  }

  parseMainContainer(response, context, callback) {
    let { container, parsingContext } = this.prepareHtmlParsing(
      response.text,
      context
    );
    this.parseList(
      container,
      parsingContext,
      'data',
      { box: 'div.av-detail-section' },
      (box, context, cb) => {
        // cb(null, this.parseDataBox(box, context));
        cb(null, box);
      },
      callback
    );
  }

  parseDataBox(box, context) {
    return {
      title: this.titleGrabber.grabFirst(box, context),
    };
  }
}

let responseParser = new RedditResponseParser();
responseParser.logger = logger;

let crawl = (url, context) => {
  requestMaker.get(url, context, (err, res) => {
    if (err) console.error(`Oh noo, sth. wen't wrong: ${err}`);

    responseParser.parseMoviesList(res, context, (err, links) => {
      links.forEach((link) => {
        requestMaker.get(link, context, (err, res) => {
          if (err) console.error(`Oh noo, sth. wen't wrong: ${err}`);
          responseParser.parseMainContainer(res, context, (err, data) => {
            console.log(data);
          });
        });
      });
    });
  });
};
crawl(url, context);
