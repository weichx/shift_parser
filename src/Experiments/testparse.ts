import Parser = require('../Parser/Parser');
import Util = require('../Parser/Util');

var name0 = '#block';
var name1 = '::intermediateBlock';
var name2 = '/blockClose';
var name3 = '&injectedVariable';
var name4 = 'regularvariable';
var name5 = '  #block';
var name6 = ':: tricky';
var name7 = ' regular';

Util.extractMustacheName(name1);
Util.extractMustacheName(name2);
Util.extractMustacheName(name3);
Util.extractMustacheName(name4);
Util.extractMustacheName(name5);
Util.extractMustacheName(name6);
Util.extractMustacheName(name7);


