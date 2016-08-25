'use strict'

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

function openrice(casper) {
  casper.start('http://sg.openrice.com/en/singapore/restaurants')
    .then(scrapNextPage);

  function scrapNextPage() {
    let currentUrl = this.getCurrentUrl();
    let links = this.evaluate(getChildPageLinks);

    casper.each(links, function(self, link) {
      self.thenOpen(link, function() {
        let info = [];

        let name = this.fetchText('.restaurant-title-lang1')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(name);

        let address = this.fetchText('.address-info-section .text')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(address);

        let phone = this.fetchText('.sr2-overview-container.phone-section a')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(phone);

        let style = this.fetchText('.sr2-overview-container .text.comma-tags')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(style);

        let budget = this.fetchText('.sr2-overview-container .text[itemprop=priceRange]')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(budget);

        let openingHour = this.fetchText({
          type: 'xpath',
          path: '//*[@class="or-sprite condition_time_40x40"]/../..'
        }).replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(openingHour);

        let website = this.fetchText('.restaurant-url .text')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(website);

        this.echo('=================================');
        this.echo('name: ' + name);
        this.echo('address: ' + address);
        this.echo('phone: ' + phone);
        this.echo('style: ' + style);
        this.echo('budget: ' + budget);
        this.echo('openingHour: ' + openingHour);
        this.echo('website: ' + website);
        this.echo('=================================');

        fs.write('openrice.csv', info.join(','), 'a');
        fs.write('openrice.csv', '\n', 'a');
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