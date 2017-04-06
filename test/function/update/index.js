'use strict';

let {
    store, set
} = require('../../../');

let fs = require('fs');
let promisify = require('es6-promisify');
let readFile = promisify(fs.readFile);

let path = require('path');
let assert = require('assert');

const fixturePath = path.resolve(__dirname, './fixture');

describe('index', () => {
    it('update', () => {
        let file = path.resolve(fixturePath, '0/index.json');

        let v = Math.random();
        let expect = {
            a: v
        };

        return store(file).then(({
            update,
            synthesisData
        }) => {
            return update(set('a', v)).then((curJson) => {
                assert.deepEqual(curJson, expect);

                return synthesisData();
            }).then(() => {
                return readFile(file, 'utf-8').then((str) => {
                    assert.deepEqual(JSON.parse(str), expect);
                });
            });
        });
    });

    it('dirty read', () => {
        let file = path.resolve(fixturePath, '1/index.json');
        return store(file).then(({
            update, get
        }) => {
            return update(set('a', 10)).then(() => {
                return Promise.all([
                    get().then(JSON.stringify).then(JSON.parse),
                    update(set('a', 20)).then(JSON.stringify).then(JSON.parse)
                ]).then((list) => {
                    assert.deepEqual(list, [{
                        a: 10
                    }, {
                        a: 20
                    }]);
                });
            });
        });
    });
});
