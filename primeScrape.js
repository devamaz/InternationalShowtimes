const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://www.amazon.de/gp/video/api/storefront';

(async () => {
  const { data } = await axios.get(url);

  let movieCol = data.collections;

  const movieDetails = {};
  movieCol.forEach((element) => {
    let movies = element.items;
    movies.map((movie, i) => {
      movieDetails[i] = {
        title: movie.title,
        description: movie.synopsis,
        rate: movie.customerReviews,
        url: movie.link,
      };
    });
  });

  console.log(movieDetails);
})();
