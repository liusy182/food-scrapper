'use strict';

var fs = require('fs');

function getChildPageLinks() {
  var links = document.querySelectorAll('.food-list .item-summary .entry-title a');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}

function ieatishootipost(casper) {
  var index = 1;
  casper.start('http://ieatishootipost.sg/category/eat/page/' + index++)
    .then(scrapPage);

  function scrapPage() {
    let currentUrl = this.getCurrentUrl();
    this.echo('scrap: ' + currentUrl);

    let links = this.evaluate(getChildPageLinks);

    casper.each(links, function(self, link) {
      self.thenOpen(link, function() {
        this.echo('scrap child: ' + this.getCurrentUrl());
        // let info = [];

        // let name = this.fetchText('.restaurant-title-lang1')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(name);

        // let address = this.fetchText('.address-info-section .text')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(address);

        // let phone = this.fetchText('.sr2-overview-container.phone-section a')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(phone);

        // let style = this.fetchText('.sr2-overview-container .text.comma-tags')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(style);

        // let budget = this.fetchText('.sr2-overview-container .text[itemprop=priceRange]')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(budget);

        // let openingHour = this.fetchText({
        //   type: 'xpath',
        //   path: '//*[@class="or-sprite condition_time_40x40"]/../..'
        // }).replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(openingHour);

        // let website = this.fetchText('.restaurant-url .text')
        //   .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        // info.push(website);

        // this.echo('=================================');
        // this.echo('name: ' + name);
        // this.echo('address: ' + address);
        // this.echo('phone: ' + phone);
        // this.echo('style: ' + style);
        // this.echo('budget: ' + budget);
        // this.echo('openingHour: ' + openingHour);
        // this.echo('website: ' + website);
        // this.echo('=================================');

        // fs.write('out/ieatishootipost.csv', info.join(','), 'a');
        // fs.write('out/ieatishootipost.csv', '\n', 'a');
      });
    });

    casper.then(function() {
      casper.open('http://ieatishootipost.sg/category/eat/page/' + index++).then(function() {
        if(this.getTitle().indexOf('Page Not Found') !== -1) {
          this.echo('End!');
          return;
        }
        casper.then(scrapPage)
      });
    });

    
  }
}


module.exports = ieatishootipost;
