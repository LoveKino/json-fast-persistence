'use strict';

// node --max_old_space_size=20000  test/perf/index.js
// avoid heap out of memory

let path = require('path');
let promisify = require('es6-promisify');
let Simply = require('./simplyReadAndWrite');
let {
    store
} = require('../..');
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

let fastJsonPath = path.join(__dirname, './fixture/fast/index.json');

let set = method('set');

let test = async(way, filePath) => {
    let {
        get, update
    } = await way(filePath);
    // read
    await timespan(get, 'get-first');
    // write
    await timespan(update, 'update-first', [set('a', 10)]);

    await timespan(get, 'get-second');
    await timespan(update, 'update-second', [set('a', 20)]);

    await timespan(get, 'get-third');
    await timespan(update, 'update-third', [set('a', 200)]);
};

let testBottomPerf = async(filePath) => {
    let raw = await timespan(readFile, 'readFile', [filePath, 'utf-8']);
    let jsonData = timespan(JSON.parse, 'parse', [raw]);

    timespan(JSON.stringify, 'stringify', [jsonData]);

    await timespan(writeFile, 'writeFile', [filePath, raw, 'utf-8']);
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
testBottomPerf(simplyJsonPath).then(() => {
    log('simply:----------------------');
    return test(Simply, simplyJsonPath).then(() => {
        log('fast:----------------------');
        return test(store, fastJsonPath).then(() => {
            log('----------------------');
            log('little json:');
            test(Simply, simplyLittleJsonPath);
        });
    });
});
