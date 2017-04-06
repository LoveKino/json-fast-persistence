'use strict';

let {
    interpreter
} = require('leta');

let {
    set
} = require('jsenhance');

module.exports = ({
    getData
}) => {
    let interpret = interpreter({
        set: (name = '', value) => {
            set(getData(), name, value);
        },

        remove: (name = '') => {
            set(getData(), name, undefined);
        },

        arr: (...args) => {
            return args;
        }
    });

    let parse = (v) => interpret(v);

    return {
        parse
    };
};
