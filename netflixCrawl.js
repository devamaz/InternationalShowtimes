const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

const seenUrls = {};
const result = [];
const crawl = async (url) => {
  if (seenUrls[url]) return;
  console.log('crawling', url);
  seenUrls[url] = true;

  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);
  const links = $('a.nm-collections-link')
    .map((i, link) => link.attribs.href)
    .get();

  const maindata = {
    Title: $('.title-title').text(),
    Type: $('.item-genre').text(),
    Description: $('.title-info-synopsis').text(),
    Rating: $('.maturity-number').text(),
    url,
  };

  result.push(maindata);

  links.forEach((link) => {
    crawl(link);
  });

  fs.writeFile('netflixData.json', JSON.stringify(result), (err) => {
    if (err) throw err;
    console.log('complete');
  });
};

crawl('https://www.netflix.com/movies');
