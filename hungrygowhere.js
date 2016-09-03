'use strict';

var fs = require('fs');

let districts = [
  'Raffles Place',
  'Cecil',
  'Marina',
  'People\'s Park',
  'Anson',
  'Tanjong Pagar',
  'Queenstown',
  'Tiong Bahru',
  'Telok Blangah',
  'Harbourfront',
  'Pasir Panjang',
  'Hong Leong Garden',
  'Clementi New Town',
  'High Street',
  'Beach Road (part)',
  'Middle Road',
  'Golden Mile',
  'Little India',
  'Orchard',
  'Cairnhill',
  'River Valley',
  'Ardmore',
  'Bukit Timah',
  'Holland Road',
  'Tanglin',
  'Watten Estate',
  'Novena',
  'Thomson',
  'Balestier',
  'Toa Payoh',
  'Serangoon',
  'Macpherson',
  'Braddell',
  'Geylang',
  'Eunos',
  'Katong',
  'Joo Chiat',
  'Amber Road',
  'Bedok',
  'Upper East Coast',
  'Eastwood',
  'Kew Drive',
  'Loyang',

  'Changi',
  'Tampines',
  'Pasir Ris',
  'Serangoon Garden',
  'Hougang',
  'Ponggol',
  'Bishan',
  'Ang Mo Kio',
  'Upper Bukit Timah',
  'Clementi Park',
  'Ulu Pandan',
  'Jurong',
  'Hillview',
  'Dairy Farm',
  'Bukit Panjang',
  'Choa Chu Kang',
  'Lim Chu Kang',
  'Tengah',
  'Kranji',
  'Woodgrove',
  'Upper Thomson',
  'Springleaf',
  'Yishun',
  'Sembawang',
  'Seletar'
];


function getItemCount() {
  return  document.querySelectorAll('article.story-item').length;
}

function getStallInfoInCSVRow() {
  let stalls = document.querySelectorAll('article.story-item');
  return Array.prototype.map.call(stalls, function(stall) {
    let title = stall.querySelector('.entry .title-wrap a') || {};
    let titleText = title.textContent || title.innerText || title.value || '';
    titleText = titleText.replace(/,/g, ' ');

    let address = stall.querySelector('.address') || {};
    let addressText = address.textContent || address.innerText || address.value || '';
    addressText = addressText.replace(/,/g, ' ').replace(/Address:/g, '');
    return titleText + ',' + addressText;
  });

}

function getStallInfoInJson() {
  let stalls = document.querySelectorAll('article.story-item');
  return Array.prototype.map.call(stalls, function(stall) {
    let title = stall.querySelector('.entry .title-wrap a') || {};
    let titleText = title.textContent || title.innerText || title.value || '';

    let address = stall.querySelector('.address') || {};
    let addressText = address.textContent || address.innerText || address.value || '';
    addressText = addressText.replace(/Address:/g, '');

    return {
      title: titleText,
      address: addressText
    }

  });
}

function getAllChildPageLinks() {
  let stalls = document.querySelectorAll('article.story-item .entry h3 a');
  return Array.prototype.map.call(stalls, function(stall) {
    return 'http://www.hungrygowhere.com' + stall.getAttribute('href');
  });
}

function getImageUrl() {
  var link = document.querySelector('article.item.hero img');
  return link? link.getAttribute('src'): '';
}

function hungrygowhere(casper) {
  let url = 'http://www.hungrygowhere.com/search-results/';
  let suffix = '/?search_location=&tab=1';

  casper.start().each(districts, function(self, district) {
    self.thenOpen(url + district + suffix, srollTillTheEnd);
  });

  function srollTillTheEnd() {
    this.echo(this.getCurrentUrl().replace(url, '').replace(suffix, ''));

    let oldCount = this.evaluate(getItemCount);
    this.scrollToBottom();

    this.wait(3000, function() {
      let newCount = this.evaluate(getItemCount);
      if(oldCount !== newCount) {
        casper.then(srollTillTheEnd)
      } else {
        let links = this.evaluate(getAllChildPageLinks);

        casper.each(links, function(self, link) {
          self.thenOpen(link, function() {
            this.echo('open:' + this.getCurrentUrl());

            let image = this.evaluate(getImageUrl);
        
            let name = this.fetchText('.entry h1')
              .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let address = this.fetchText('.address .text')
              .replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let phone = this.fetchText({
              type: 'xpath',
              path: '//*[@class="module-information"]//*[text()="Phone"]/following-sibling::div[1]'
            }).replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let cuisine = this.fetchText({
              type: 'xpath',
              path: '//*[@class="module-information"]//*[text()="Cuisine"]/following-sibling::div[1]'
            }).replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let averagePrice = this.fetchText({
              type: 'xpath',
              path: '//*[@class="module-information"]//*[text()="Average Price"]/following-sibling::div[1]'
            }).replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let openingHour = this.fetchText({
              type: 'xpath',
              path: '//*[@class="module-information"]//*[text()="Opening Hours"]/following-sibling::div[1]'
            }).replace(/\n/g, ' ').replace(/ +/g, ' ').trim();

            let newEntry = {
              image: image,
              name: name,
              address: address,
              phone: phone,
              cuisine: cuisine,
              averagePrice: averagePrice,
              openingHour: openingHour
            };

            let file = 'out/hungrygowhere.json';
            let stream = fs.exists(file) ? fs.read(file, 'r') : '';
            let jsonArray = stream? JSON.parse(stream) : [];

            this.echo('=============================');
            this.echo(JSON.stringify(newEntry));
            this.echo('=============================');

            jsonArray.push(newEntry);
            fs.write(file, JSON.stringify(jsonArray), 'w');
          });
        });
        
        // let newEntry = this.evaluate(getStallInfoInJson);
        // this.echo(JSON.stringify(newEntry));

        // let file = 'out/hungrygowhere.json';
        // let stream = fs.exists(file) ? fs.read(file, 'r') : '';
        // let jsonArray = stream? JSON.parse(stream) : [];

        // this.echo('=============================');
        // this.echo(JSON.stringify(newEntry));
        // this.echo('=============================');

        // jsonArray.push(newEntry);
        // fs.write(file, JSON.stringify(jsonArray), 'w');
      }
    });
  }
}


module.exports = hungrygowhere;