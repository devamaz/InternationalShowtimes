const {
  DefaultContext,
  DefaultRequestMaker,
  BaseHtmlParser,
  DefaultLogger,
  ValueGrabber,
  JsonFileWriter,
} = require('crawl-e');

let context = new DefaultContext();
let logger = new DefaultLogger();
let requestMaker = new DefaultRequestMaker();
requestMaker.logger = logger;

let outputWriter = new JsonFileWriter();
outputWriter.logger = logger;

let url = 'https://www.amazon.de/gp/video/storefront';

class RedditResponseParser extends BaseHtmlParser {
  constructor() {
    super();

    this.links = new ValueGrabber((box, context) => {
      return `https://www.amazon.de${box.find('a').attr('href')}`;
    });

    this.title = new ValueGrabber('h1._2IIDsE');
    this.description = new ValueGrabber('div._3qsVvm div');
    this.rating = new ValueGrabber('span.EyZ6mf');
    this.type = new ValueGrabber(
      'div._266mZB:nth-child(1) > dl:nth-child(3) > dd:nth-child(2) > a:nth-child(1)'
    );
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
      { box: 'div._2hu-aV' },
      (box, context, cb) => {
        cb(null, this.parseDataBox(box, context));
        // cb(null, box);
      },
      callback
    );
  }

  parseDataBox(box, context) {
    return {
      Title: this.title.grabFirst(box, context),
      Type: this.type.grabFirst(box, context),
      Description: this.description.grabFirst(box, context),
      AgeRating: this.rating.grabFirst(box, context),
      // url,
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
            
            outputWriter.saveFile(data, context, (err) => { 
              if (err) {
                console.error(`Oh noo, sth. wen't wrong: ${err}`)
                return
              }
              console.log('All Done', '👏')
            })
          });
        });
      });
    });
  });
};
crawl(url, context);
