'use strict';

var fs = require('fs');

function getChildPageLinks() {
  var links = document.querySelectorAll('.food-list .item-summary .entry-title a');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}

function getFirstImg() {
  var img = document.querySelector('.article-content-wrapper img');
  return img? img.getAttribute('src') : '';
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

        let info = [];

        let name = this.fetchText('.restaurant-name')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(name);

        let address = this.fetchText('.address')
          .replace('Address', '').replace('View Map', '')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(address);

        let openingHour = this.fetchText('.opening-hours')
          .replace('Opening hours:', '')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(openingHour);

        let articleTitle = this.fetchText('.article-title')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(articleTitle);

        let articleDate = this.fetchText('.article-date')
          .replace(/\n/g, ' ').replace(/,/g, ' ').replace(/ +/g, ' ').trim();
        info.push(articleDate);

        let firstImg = this.evaluate(getFirstImg);
        info.push(firstImg);

        this.echo('=================================');
        this.echo('name: ' + name);
        this.echo('address: ' + address);
        this.echo('openingHour: ' + openingHour);
        this.echo('articleTitle: ' + articleTitle);
        this.echo('articleDate: ' + articleDate);
        this.echo('firstImg: ' + firstImg);
        this.echo('=================================');

        fs.write('out/ieatishootipost.csv', info.join(','), 'a');
        fs.write('out/ieatishootipost.csv', '\n', 'a');
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
