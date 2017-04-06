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

            return getData();
        },

        remove: (name = '') => {
            set(getData(), name, undefined);

            return getData();
        }
    });

    let parse = (v) => interpret(v);

    return {
        parse
    };
};
