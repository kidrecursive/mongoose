/*!
 * Module exports.
 */

'use strict';

exports.Binary = require('../node-mongodb-native/binary');
exports.Decimal128 = require('../node-mongodb-native/decimal128');
exports.ObjectId = require('../node-mongodb-native/objectid');
exports.ReadPreference = require('../node-mongodb-native/ReadPreference');
exports.getConnection = () => require('./connection');
exports.Collection = require('../node-mongodb-native/collection');
