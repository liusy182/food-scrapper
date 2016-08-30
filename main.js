'use strict';

var casper = require('casper').create({
  // verbose: true,
  // ogLevel: "debug",
  viewportSize: {width: 400, height: 600}
});

var openrice = require('./openrice');
var hungrygowhere = require('./hungrygowhere');
var ieatishootipost = require('./ieatishootipost');

//hungrygowhere(casper);

//openrice(casper);

ieatishootipost(casper);


casper.run(function(){
  this.exit();
});