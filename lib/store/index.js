'use strict';

let path = require('path');
let promisify = require('es6-promisify');

let waiter = require('./waiter');
let locker = require('./locker');
let data = require('./data');
let {
    existsFile, writeJson
} = require('../util');

let Source = require('./source');

let mkdirp = promisify(require('mkdirp'));

const FAST_SCRIPT_DIR_PREFIX = '__fast_script__';

const DEFAULT_SCRIPT_INDEX_JSON = {
    scripts: []
};

/**
 * prepare script directory and script index json
 */
let prepare = (jsonFilePath, scriptdir, defaultJson) => {
    let indexJson = path.join(scriptdir, './index.json');

    return Promise.all([
        mkdirp(scriptdir).then(() => {
            return existsFile(indexJson).then((has) => {
                if (!has) {
                    return writeJson(indexJson, DEFAULT_SCRIPT_INDEX_JSON);
                }
            });
        }),

        existsFile(jsonFilePath).then((has) => {
            if (!has) {
                return writeJson(jsonFilePath, defaultJson);
            }
        })
    ]);
};

let jsonFileMap = {};

/**
 * store json and fetch json
 */
module.exports = (jsonFilePath, scriptdir, defaultJson = {}) => {
    scriptdir = getScriptDir(jsonFilePath, scriptdir);

    let dataInterface = data();

    let {
        saveUpateScripts,
        arrangeSource
    } = Source(jsonFilePath, scriptdir, dataInterface);

    let synthesisData = locker(() => {
        return arrangeSource(jsonFilePath).then(() => {
            return dataInterface.getData();
        });
    });

    let applyChanges = locker((letaUpdateScripts) => {
        /**
         * if you write data while you are reading data, it may cause you read data which is half-writing
         */
        return synthesisData.waitUnlock().then(() => {
            return saveUpateScripts(letaUpdateScripts).then(() => {
                return dataInterface.getData();
            });
        });
    });

    let waitReadTask = waiter(synthesisData);

    let update = (letaUpdateScripts) => {
        return Promise.resolve(dataInterface.getData() || get()).then(() => applyChanges(letaUpdateScripts));
    };

    let get = () => {
        // wait unlock save op
        return applyChanges.waitUnlock().then(() => {
            if (dataInterface.getData()) return Promise.resolve(dataInterface.getData());
            // read json from file
            return waitReadTask();
        });
    };

    return prepare(jsonFilePath, scriptdir, defaultJson).then(() => {
        if (jsonFileMap[jsonFilePath]) {
            throw new Error(`already build a store for json ${jsonFilePath}`);
        }

        jsonFileMap[jsonFilePath] = true;

        return {
            update,
            get,

            synthesisData
        };
    });
};

let getScriptDir = (jsonFilePath, scriptdir) => {
    let jsondir = path.dirname(jsonFilePath),
        jsonName = path.basename(jsonFilePath, path.extname(jsonFilePath));
    scriptdir = scriptdir || path.resolve(jsondir, `${FAST_SCRIPT_DIR_PREFIX}${jsonName}__`);

    return scriptdir;
};
