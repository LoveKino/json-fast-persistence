'use strict';

let store = require('./lib/store');

let {
    set, remove, arr
} = require('./lib/jsonOp');

module.exports = {
    store,
    set,
    remove,
    arr
};
