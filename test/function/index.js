'use strict';

let {
    store
} = require('../..');

let path = require('path');
let assert = require('assert');

const fixturePath = path.resolve(__dirname, '../fixture');

describe('index', () => {
    it('get json: first', () => {
        return store(path.resolve(fixturePath, '0/index.json')).then(({
            get
        }) => {
            return get().then((data) => {
                assert.deepEqual(data, {
                    a: 1
                });
            });
        });
    });

    it('get json: mul', () => {
        return store(path.resolve(fixturePath, '1/index.json')).then(({
            get
        }) => {
            return get().then((data) => {
                assert.deepEqual(data, {
                    a: 1
                });
            }).then(() => {
                return get().then((data) => {
                    assert.deepEqual(data, {
                        a: 1
                    });
                });
            });
        });
    });

    it('get json: concurrent get', () => {
        return store(path.resolve(fixturePath, '2/index.json')).then(({
            get
        }) => {
            return Promise.all([get(), get(), get()]).then((ret) => {
                assert.deepEqual(ret, [{
                    a: 1
                }, {
                    a: 1
                }, {
                    a: 1
                }]);
            });
        });
    });
});
