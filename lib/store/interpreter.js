'use strict';

let {
    interpreter, dsl
} = require('leta');

let {
    getJson
} = dsl;

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
        }
    });

    return (v) => interpret(getJson(v));
};
