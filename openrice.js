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
  let pageLinks = [];
  casper.start('http://sg.openrice.com/en/singapore/restaurants')
    .then(scrapNextPage);

  function scrapNextPage() {
    let links = this.evaluate(getChildPageLinks);
    //pageLinks = pageLinks.concat(links);

    links.map(function(l) {
      fs.write('urls.txt', l, 'a');
      fs.write('urls.txt', '\n', 'a');
    }.bind(this));    

    let nextPageLink = this.evaluate(getNextPageLinks);
    if(nextPageLink.length > 0) {
      this.echo('opening ' + nextPageLink[0]);
      casper.open(nextPageLink[0]);
      casper.then(scrapNextPage)
    }
  }

  // casper.then(function() {
  //   // aggregate results for the 'phantomjs' search
  //   this.echo('outcome: ' + pageLinks.length + '\n' + pageLinks.join('\n'));
  // });
}


module.exports = openrice;