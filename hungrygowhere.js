'use strict'

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

function hungrygowhere(casper) {
  let url = 'http://www.hungrygowhere.com/search-results/';
  let suffix = '/?search_location=&tab=1';

  casper.start().each(districts, function(self, district) {
    self.thenOpen(url + district + suffix, srollTillTheEnd);
  });

  function srollTillTheEnd() {
    let oldCount = this.evaluate(getItemCount);
    this.scrollToBottom();
    this.wait(3000, function() {
      let newCount = this.evaluate(getItemCount);
      if(oldCount !== newCount) {
        this.echo('scroll');
        casper.then(srollTillTheEnd)
      } else {
        let info = this.evaluate(getStallInfoInCSVRow);
        this.echo('info: \n' + info.join('\n'));
        fs.write('hungrygowhere.csv', info.join('\n'), 'a');
        fs.write('hungrygowhere.csv', '\n', 'a');
      }
    });
  }
}


module.exports = hungrygowhere;