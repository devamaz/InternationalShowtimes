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

let url = 'https://www.netflix.com/gb/browse/genre/34399';

class RedditResponseParser extends BaseHtmlParser {
  constructor() {
    super();
    // this.titleGrabber = new ValueGrabber('.nm-collections-title-name');
    this.links = new ValueGrabber({
      selector: '.nm-collections-title-img',
      attribute: 'data-title-id',
      mapper: parseInt,
    });

    this.postAuthorGrabber = new ValueGrabber((box, context) => {
      let authorTag = box.find('.nm-collections-title-img');
      this.parseCardBox(`https://www.netflix.com/gb/title/${authorTag.attr('data-title-id')}`, context)
      return {
        // name: authorTag.,
        // profileUrl: authorTag.attr('data-title-id'),
      };
    });
  }

  parsePostsList(response, context, callback) {
    let { container, parsingContext } = this.prepareHtmlParsing(
      response.text,
      context
    );
    this.parseList(
      container,
      parsingContext,
      'posts',
      { box: 'li.nm-content-horizontal-row-item' },
      (box, context, cb) => {
        cb(null, this.parsePostBox(box, context));
        // cb(null, '*');
      },
      callback
    );
  }

  parseCardBox(url, context) {
    requestMaker.get(url, context, (err, res) => {
      if (err) {
        console.error(` ${err}`);
      }
      
      let { container, parsingContext } = this.prepareHtmlParsing(
        response.text,
        context
      );

      // console.log(container);
      
    });
  }

  parsePostBox(box, context) {
    return {
      // title: this.titleGrabber.grabFirst(box, context),
      title: this.links.grabFirst(box, context),
      // title: this.postTitleGrabber.grabFirst(box, context),
      // imageUrl: this.postImageUrlGraber.grabFirst(box, context),
      // score: this.postScoreGrabber.grabFirst(box, context),
      author: this.postAuthorGrabber.grabFirst(box, context),
      // title  title-title
      // type
      // description title-info-synopsis
      // rating  maturity-number
      // url
    };
  }
}

let responseParser = new RedditResponseParser();
responseParser.logger = logger;

requestMaker.get(url, context, (err, res) => {
  if (err) {
    console.error(`Oh noo, sth. wen't wrong: ${err}`);
  }
  console.log('Happy', res.status, '🙂');

  responseParser.parsePostsList(res, context, (err, posts) => {
    console.log('POSTS:');
    console.log(posts);
  });
});


