'use strict';

let store = require('./lib/store');

let remoteStore = require('./lib/remoteStore');

let mirror = require('./lib/mirror');

let {
    set, remove, arr
} = require('./lib/jsonOp');

module.exports = {
    store,
    remoteStore,
    mirror,
    set,
    remove,
    arr
};
