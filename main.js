'use strict';

var casper = require('casper').create({
  // verbose: true,
  // logLevel: "debug"
});
var openrice = require('./openrice');

openrice(casper);

casper.run(function(){
  this.exit();
})