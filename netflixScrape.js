const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://www.netflix.com/de-en/browse/genre/839338';

(async () => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let siteData = $('script:first');
  let mainData = JSON.parse(siteData.html());

  let moviesInfo = [];
  let extractData = mainData.itemListElement.forEach((element) => {
    moviesInfo.push(element.item);
  });

  console.log(moviesInfo);
})();
