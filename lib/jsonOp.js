'use strict';

let {
    dsl
} = require('leta');

let {
    method
} = dsl;

module.exports = {
    set: method('set'),
    remove: method('remove')
};
