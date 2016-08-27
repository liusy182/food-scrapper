'use strict';

var casper = require('casper').create({
  // verbose: true,
  // logLevel: "debug"
  viewportSize: {width: 400, height: 600}
});
var openrice = require('./openrice');
var hungrygowhere = require('./hungrygowhere');

hungrygowhere(casper);
//openrice(casper);

casper.run(function(){
  this.exit();
})