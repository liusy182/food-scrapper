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

        let name = this.fetchText('.restaurant-name')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let address = this.fetchText('.address')
          .replace('Address', '').replace('View Map', '')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let openingHour = this.fetchText('.opening-hours')
          .replace('Opening hours:', '')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let articleTitle = this.fetchText('.article-title')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let articleDate = this.fetchText('.article-date')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        let articleDescription = this.fetchText('.article-content p:first-of-type')
          .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

        if(!articleDescription) {
          articleDescription = this.fetchText('.article-content p:nth-of-type(2)')
            .replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ').trim();
        }

        let image = this.evaluate(getFirstImg);

        let file = 'out/ieatishootipost.json';
        let stream = fs.exists(file) ? fs.read(file, 'r') : '';
        let jsonArray = stream? JSON.parse(stream) : [];

        let newEntry = {
          title: articleTitle,
          description: articleDescription,
          date: articleDate,
          image: image,
          name: name,
          address: address,
          openingHour: openingHour
        }
        this.echo('=============================');
        this.echo(JSON.stringify(newEntry));
        this.echo('=============================');

        jsonArray.push(newEntry);
        fs.write(file, JSON.stringify(jsonArray), 'w');
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
