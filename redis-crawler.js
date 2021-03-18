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


let url = 'https://old.reddit.com/top/';


class RedditResponseParser extends BaseHtmlParser {
  constructor() {
    super();
    this.postTitleGrabber = new ValueGrabber('a.title'); 
    this.postImageUrlGraber = new ValueGrabber('a.thumbnail img @src'); 
    this.postScoreGrabber = new ValueGrabber({
      selector: 'div.score.unvoted',
      attribute: 'title',
      mapper: parseInt,
    });

    this.postAuthorGrabber = new ValueGrabber((box, context) => {
      let authorTag = box.find('a.author');
      return {
        name: authorTag.text(),
        profileUrl: authorTag.attr('href'),
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
      { box: 'div.thing' },
      (box, context, cb) => {
        cb(null, this.parsePostBox(box, context));
      },
      callback
    );
  }

  parsePostBox(box, context) {
    return {
      title: this.postTitleGrabber.grabFirst(box, context),
      imageUrl: this.postImageUrlGraber.grabFirst(box, context),
      score: this.postScoreGrabber.grabFirst(box, context),
      author: this.postAuthorGrabber.grabFirst(box, context),
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
    if (err) {
      console.error(`Oh noo, sth. wen't wrong: ${err}`);
    }

    console.log('POSTS:');
    console.log(posts);
  });
});
