'use strict';
const { createAstraClient } = require('@astrajs/client');

class Collection {
  constructor(namespaceClient, name) {
    this.namespaceClient = namespaceClient;
    this.collectionClient = namespaceClient.collection(name);
    this.name = name;
  }

  async insertOne(mongooseDoc, options, cb) {
    const res = await this.collectionClient.create(
      mongooseDoc._id,
      mongooseDoc
    );
    if (cb) {
      return cb(null, res);
    }
    return res;
  }

  async findOne(query, options, cb) {
    console.log(query);
    const res = await this.collectionClient.findOne(query);
    console.log(res);
    if (cb) {
      return cb(null, res);
    }
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
      console.error(e);
    }
    if (cb) {
      return cb();
    }
  }

  async dropCollection(collectionName) {
    return await this.namespaceClient.deleteCollection(collectionName);
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
      applicationToken: this.astraApplicationToken
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
