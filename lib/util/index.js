'use strict';

let fs = require('fs');
let promisify = require('es6-promisify');

let stat = promisify(fs.stat);
let readFile = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

let existsFile = (filePath) => {
    return new Promise((resolve) => {
        stat(filePath).then((statObj) => {
            resolve(statObj.isFile());
        }).catch(() => {
            resolve(false);
        });
    });
};

let readJson = (jsonFilePath) => {
    return readFile(jsonFilePath, 'utf-8').then((jsonStr) => {
        return JSON.parse(jsonStr);
    });
};

let writeJson = (jsonFilePath, data) => {
    return writeFile(jsonFilePath, JSON.stringify(data), 'utf-8');
};

module.exports = {
    existsFile,
    readJson,
    writeJson
};
