'use strict';
const { createAstraClient } = require('@astrajs/client');
const _ = require('lodash');

const types = ['String', 'Number', 'Boolean', 'ObjectId'];

const formatQuery = (query) => {
  // console.log(query);
  const modified = _.mapValues(query, (value) => {
    // console.log(value, value.constructor.name);
    if (types.includes(value.constructor.name)) {
      return { $eq: value };
    }
    return value;
  });
  // console.log(modified);
  return modified;
};

class FindCursor {
  constructor(collection, query, options) {
    this.collection = collection;
    this.query = formatQuery(query);
    this.options = options;
    this.namespace = collection;
  }
  async toArray(cb) {
    const res = await this.collection.collectionClient.find(this.query);
    if (cb) {
      return cb(
        null,
        Object.keys(res.data).map((i) => res.data[i])
      );
    }
    return res.data;
  }
}

class Collection {
  constructor(namespaceClient, name) {
    this.namespaceClient = namespaceClient;
    this.collectionClient = namespaceClient.collection(name);
    this.name = name;
    this.collectionName = name;
  }

  async insertOne(mongooseDoc, options, cb) {
    let res = {};
    let err = null;
    try {
      res = await this.collectionClient.create(mongooseDoc._id, mongooseDoc);
    } catch (e) {
      err = e;
    }
    if (cb) {
      return cb(err, res);
    }
    return res;
  }

  async insertMany(mongooseDocs, options, cb) {
    let res = {};
    let err = null;
    try {
      res = await this.collectionClient.batch(mongooseDocs, '_id');
    } catch (e) {
      err = e;
    }
    if (cb) {
      return cb(err, res);
    }
    return res;
  }

  async updateOne(query, update, options, cb) {
    const doc = await this.collectionClient.findOne(formatQuery(query));
    if (doc) {
      const res = await this.collectionClient.update(doc._id, update);
      if (cb) {
        return cb(null, res);
      }
    }
    if (cb) {
      return cb(null, null);
    }
    return null;
  }

  find(query, options, cb) {
    const cursor = new FindCursor(this, query, options);
    if (cb) {
      return cb(null, cursor);
    }
    return cursor;
  }

  async distinct(key, filter, options, cb) {
    const res = await this.collectionClient.find(formatQuery(filter));
    let list = [];
    if (res.data) {
      Object.keys(res.data).forEach((resKey) => {
        list = list.concat(res.data[resKey][key]);
      });
    }
    list = _.uniq(list);
    if (cb) {
      return cb(null, list);
    }
    return list;
  }

  async countDocuments(query, options, cb) {
    let count = 0;
    try {
      const res = await this.collectionClient.find(formatQuery(query));
      count = res.count ? res.count : Object.keys(res.data).length;
    } catch (e) {}
    if (cb) {
      return cb(null, count);
    }
    return count;
  }

  async count(query, options, cb) {
    return this.countDocuments(query, options, cb);
  }

  async findOne(query, options, cb) {
    const res = await this.collectionClient.findOne(formatQuery(query));
    if (cb) {
      return cb(null, res);
    }
    return res;
  }

  async createIndex(index, options, cb) {
    if (cb) {
      return cb(index);
    }
    return index;
  }
}

class Db {
  constructor(astraClient, name) {
    this.astraClient = astraClient;
    this.namespaceClient = astraClient.collections.namespace(name);
    this.name = name;
  }

  collection(collectionName) {
    return new Collection(this.namespaceClient, collectionName);
  }

  async createCollection(collectionName, options, cb) {
    try {
      await this.namespaceClient.createCollection(collectionName);
    } catch (e) {
      // console.error(e);
    }
    if (cb) {
      return cb();
    }
  }

  async dropCollection(collectionName) {
    try {
      await this.namespaceClient.deleteCollection(collectionName);
    } catch (e) {}
    return {};
  }
}

class MongoClient {
  constructor(uri, options) {
    this.baseURL = uri;
    this.keyspace = options.dbName;
    this.astraApplicationToken = options.astraApplicationToken;
    this.astraClient = null;
  }

  setMaxListeners(maxListeners) {
    return maxListeners;
  }

  db(dbName) {
    return new Db(this.astraClient, dbName);
  }

  async connect(cb) {
    this.astraClient = await createAstraClient({
      baseUrl: this.baseURL,
      applicationToken: this.astraApplicationToken,
    });
    if (cb) {
      return cb();
    }
    return this;
  }
}

module.exports = {
  MongoClient,
  Collection,
  ReadPreference: 'primary'
};
