'use strict';

let store = require('./lib/store');

let {
    set, remove
} = require('./lib/jsonOp');

module.exports = {
    store,
    set,
    remove
};
