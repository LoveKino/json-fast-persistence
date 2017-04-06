'use strict';

let {
    store, set, remove, arr
} = require('../../../');

let fs = require('fs');
let promisify = require('es6-promisify');
let readFile = promisify(fs.readFile);
let {
    readJson
} = require('../../../lib/util');

let path = require('path');
let assert = require('assert');

const fixturePath = path.resolve(__dirname, './fixture');

describe('update', () => {
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

    it('dirty read', async() => {
        let file = path.resolve(fixturePath, '1/index.json');
        let {
            update, get
        } = await store(file);

        let list = await Promise.all([
            // read
            get().then(JSON.stringify).then(JSON.parse),

            // write
            nextTick().then(() => {
                return update(set('a', 20)).then(JSON.stringify).then(JSON.parse);
            })
        ]);

        await update(set('a', 10));

        assert.deepEqual(list, [{
            a: 10
        }, {
            a: 20
        }]);
    });

    it('dirty read2', async() => {
        let file = path.resolve(fixturePath, '2/index.json');
        let {
            update, get
        } = await store(file);

        await update(set('a', 10));

        let list = await Promise.all([
            // write
            update(set('a', 20)).then(JSON.stringify).then(JSON.parse),

            // read
            nextTick().then(() => {
                return get().then(JSON.stringify).then(JSON.parse);
            })
        ]);

        await update(set('a', 10));

        assert.deepEqual(list, [{
            a: 20
        }, {
            a: 20
        }]);
    });

    it('remove', async() => {
        let file = path.resolve(fixturePath, '3/index.json');
        let {
            update, synthesisData
        } = await store(file);

        await update(set('a', {
            b: {
                c: 20
            },
            d: 3
        }));

        await update(remove('a.b'));

        await synthesisData();

        let data = await readJson(file);
        assert.deepEqual(data, {
            a: {
                d: 3
            }
        });
    });

    it('arr', async() => {
        let file = path.resolve(fixturePath, '4/index.json');

        let {
            update, get
        } = await store(file);

        await update(arr(
            set('a', {
                d: 3
            }),

            set('e', 100)
        ));

        let data = await get();

        assert.deepEqual(data, {
            a: {
                d: 3
            },
            e: 100
        });
    });
});

let nextTick = () => {
    return new Promise((resolve) => {
        process.nextTick(() => {
            resolve();
        });
    });
};
