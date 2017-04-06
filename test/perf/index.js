'use strict';

let path = require('path');
let promisify = require('es6-promisify');
let Simply = require('./simplyReadAndWrite');
let fs = require('fs');

let writeFile = promisify(fs.writeFile);
let readFile = promisify(fs.readFile);

let {
    dsl
} = require('leta');

let {
    method
} = dsl;

let log = console.log; // eslint-disable-line

let simplyJsonPath = path.join(__dirname, './fixture/simply/index.json');
let simplyLittleJsonPath = path.join(__dirname, './fixture/simply/little.json');

// let fastJsonPath = path.join(__dirname, './fixture/fast/index.json');

let set = method('set');

let test = (way, filePath) => {
    let {
        get, update
    } = way(filePath);

    timespan(readFile, 'readFile', [filePath, 'utf-8']);

    // read
    return timespan(get, 'get').then((jsonData) => {
        let raw = timespan(JSON.stringify, 'stringify', [jsonData]);
        // write
        return timespan(update, 'update', [set('a', 10)]).then(() => {
            return timespan(writeFile, 'writeFile', [filePath, raw, 'utf-8']).then(() => {
                timespan(JSON.parse, 'parse', [raw]);
            });
        });
    });
};

let timespan = (f, prefix, args = []) => {
    let t1 = new Date().getTime();

    let ret = f(...args);

    Promise.resolve(ret).then(() => {
        let t2 = new Date().getTime();
        log(`${prefix}: time span ${t2 - t1}`);
    });

    return ret;
};

log('180M json:');
test(Simply, simplyJsonPath).then(() => {
    log('----------------------');
    log('little json:');
    test(Simply, simplyLittleJsonPath);
});
