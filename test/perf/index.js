'use strict';

let path = require('path');
let promisify = require('es6-promisify');
let Simply = require('./simplyReadAndWrite');
let fs = require('fs');

let writeFile = promisify(fs.writeFile);

let {
    dsl
} = require('leta');

let {
    method
} = dsl;

let log = console.log; // eslint-disable-line

let simplyJsonPath = path.join(__dirname, './fixture/simply/index.json');

// let fastJsonPath = path.join(__dirname, './fixture/fast/index.json');

let set = method('set');

let test = (way, filePath) => {
    let t1 = new Date().getTime();
    let {
        get, update
    } = way(filePath);
    // read
    return get().then((jsonData) => {
        let t2 = new Date().getTime();
        log(`get: time span ${t2 - t1}`);
        let raw = JSON.stringify(jsonData);
        let t3 = new Date().getTime();
        log(`stringify: time span ${t3 - t2}`);
        // write
        return update(set('a', 10)).then(() => {
            let t4 = new Date().getTime();
            log(`update: time span ${t4 - t3}`);
            return writeFile(filePath, raw, 'utf-8').then(() => {
                let t5 = new Date().getTime();
                log(`write: time span ${t5 - t4}`);
                JSON.parse(raw);
                let t6 = new Date().getTime();
                log(`parse: time span ${t6 - t5}`);
            });
        });
    });
};

test(Simply, simplyJsonPath);
