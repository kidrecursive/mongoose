'use strict';
const mongodb = require('mongodb');

module.exports = new Proxy(new Object(), {
  get(target, name) {
    console.log(name, typeof mongodb[name]);
  }
});
