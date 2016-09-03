'use strict';

var fs = require('fs');

function getChildPageLinks() {
  var links = document.querySelectorAll('article a:first-child');
  return Array.prototype.map.call(links, function(e) {
    return 'http://sg.openrice.com' + e.getAttribute('href');
  });
}

function getNextPageLinks() {
  var links = document.querySelectorAll('a.js-next');
  return Array.prototype.map.call(links, function(e) {
    return 'http://sg.openrice.com' + e.getAttribute('href');
  });
}

function getImageUrl() {
  var link = document.querySelector('.restaurant-photo-wrapper meta');
  return link? link.getAttribute('content'): '';
}

function openrice(casper) {
  casper.start('http://sg.openrice.com/en/singapore/restaurants')
    .then(scrapNextPage);

  function scrapNextPage() {
    let currentUrl = this.getCurrentUrl();
    let links = this.evaluate(getChildPageLinks);

    casper.each(links, function(self, link) {
      self.thenOpen(link, function() {

        let image = this.evaluate(getImageUrl);
        
        let name = this.fetchText('.restaurant-title-lang1')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let address = this.fetchText('.address-info-section .text div:first')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let phone = this.fetchText('.sr2-overview-container.phone-section a')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let cuisine = this.fetchText('.sr2-overview-container .text.comma-tags')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let averagePrice = this.fetchText('.sr2-overview-container .text[itemprop=priceRange]')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let openingHour = this.fetchText({
          type: 'xpath',
          path: '//*[@class="or-sprite condition_time_40x40"]/../..'
        }).replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let website = this.fetchText('.restaurant-url .text')
          .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let file = 'out/openrice.json';
        let stream = fs.exists(file) ? fs.read(file, 'r') : "";

        let jsonArray = stream? JSON.parse(stream) : [];
        let newEntry = {
          name: name,
          image: image,
          address: address,
          phone: phone,
          cuisine: cuisine,
          averagePrice: averagePrice,
          openingHour: openingHour,
          website: website
        };
        this.echo('=============================');
        this.echo(JSON.stringify(newEntry));
        this.echo('=============================');

        jsonArray.push(newEntry);
        fs.write(file, JSON.stringify(jsonArray), 'w');
      });
    });

    casper.then(function() {
      this.echo('get back to url: ' + currentUrl);

      casper.open(currentUrl).then(function() {
        let nextPageLink = this.evaluate(getNextPageLinks);
        if(nextPageLink.length > 0) {
          this.echo('opening ' + nextPageLink[0]);
          casper.open(nextPageLink[0]);
          casper.then(scrapNextPage)
        }
      });
    });

    
  }
}


module.exports = openrice;