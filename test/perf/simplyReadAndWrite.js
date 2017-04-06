'use strict';

let promisify = require('es6-promisify');
let fs = require('fs');

let {
    interpreter, dsl
} = require('leta');

let {
    getJson
} = dsl;

let {
    set
} = require('jsenhance');

let readFile = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

module.exports = (jsonFilePath) => {
    let curJson = null;

    let interprete = interpreter({
        set: (name = '', value) => {
            set(curJson, name, value);

            return curJson;
        }
    });

    let update = (letaUpdateScripts) => {
        return Promise.resolve(curJson || get()).then(() => {
            interprete(getJson(letaUpdateScripts));

            // save json file
            return writeFile(jsonFilePath, JSON.stringify(curJson), 'utf-8');
        });
    };

    let get = () => {
        // read json from file
        return readFile(jsonFilePath, 'utf-8').then((jsonStr) => {
            return JSON.parse(jsonStr);
        }).then(updateCurJson);
    };

    let updateCurJson = (data) => {
        curJson = data;
        return curJson;
    };

    return {
        update,
        get
    };
};
