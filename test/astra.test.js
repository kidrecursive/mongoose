'use strict';

require('dotenv').config();
const mongoose = require('../lib');
// const assert = require('assert');

const BASE_URL = `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com`;

const cartSchema = new mongoose.Schema({
  name: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const Cart = mongoose.model('Cart', cartSchema);
const Product = mongoose.model('Product', productSchema);

describe('astra:', () => {
  it('should leverage astradb', async() => {
    await mongoose.connect(BASE_URL, {
      dbName: process.env.ASTRA_DB_KEYSPACE,
      astraApplicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });

    const product1 = new Product({ name: 'Product 1', price: 10 });
    await product1.save();

    const product2 = new Product({ name: 'Product 2', price: 10 });
    await product2.save();

    const cart = new Cart({
      name: 'My Cart',
      products: [product1._id, product2._id]
    });
    await cart.save();

    const res = await Cart.findOne({ name: 'My Cart' })
      .populate('products')
      .exec();

    console.log(res);

    // await mongoose.connection.db.dropCollection('carts');
    // await mongoose.connection.db.dropCollection('products');
  });
});
