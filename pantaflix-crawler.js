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
  const links = $('a.Card__container___3MH6O')
    .map((i, link) => `https://www.pantaflix.com${link.attribs.href}`)
    .get();

  const maindata = {
    Title: $('.DetailHeader__headerDetailContainer___2F31-  h1').text(),
    Type: $(
      '.ContentDetailsDescriptionListWrapper__hideComma___2vK24 > div:nth-child(1) > dd:nth-child(2) > a:nth-child(1)'
    ).text(),
    Description: $(
      '.DetailHeader__headerDescription___11vya > dl:nth-child(1) > div:nth-child(1) > dd:nth-child(1)'
    ).text(),
    AgeRating: $(
      '.DetailPage__info___3aXtq > div:nth-child(4) > dl:nth-child(1) > div:nth-child(1) > dd:nth-child(2)'
    ).text(),
    URL: url,
  };

  result.push(maindata);

  links.forEach((link) => {
    crawl(link);
  });
  fs.writeFile('pantaflixData.json', JSON.stringify(result), (err) => {
    if (err) throw err;
    console.log('complete');
  });
};

crawl('https://www.pantaflix.com/');
