'use strict';

let {
    store
} = require('../..');

let path = require('path');
let assert = require('assert');

let del = require('del');

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

    it('default file', async() => {
        let filePath = path.resolve(fixturePath, '3/index.json');
        let scriptIndexPath = path.resolve(fixturePath, '3/__fast_script__index__/index.json');

        await del([filePath, scriptIndexPath], {
            force: true
        });

        let {
            get
        } = await store(filePath, null, {
            'd': 1
        });

        let ret = await get();

        assert.deepEqual(ret, {
            'd': 1
        });
    });

    it('repeat store', async() => {
        let filePath = path.resolve(fixturePath, '4/index.json');
        await store(filePath);
        try {
            await store(filePath);
        } catch (err) {
            assert.deepEqual(err.toString().indexOf('already build a store') !== -1, true);
        }
    });
});
