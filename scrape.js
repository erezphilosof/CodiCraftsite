const scrape = require('website-scraper').default || require('website-scraper');

const options = {
  urls: ['https://brainit.es/'],
  directory: './website',
  recursive: true,
  maxDepth: 2, 
  urlFilter: function(url) {
    return url.indexOf('https://brainit.es') === 0;
  }
};

scrape(options).then((result) => {
    console.log("Scraping completed.");
}).catch((err) => {
    console.error("Error scraping:", err);
});
