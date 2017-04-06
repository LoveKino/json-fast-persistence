'use strict';

let path = require('path');
let promisify = require('es6-promisify');
let fs = require('fs');

let interpreter = require('./interpreter');

let waiter = require('./waiter');
let locker = require('./locker');
let data = require('./data');

let readFile = promisify(fs.readFile),
    writeFile = promisify(fs.writeFile);

let mkdirp = promisify(require('mkdirp'));

const FAST_SCRIPT_DIR_PREFIX = '__fast_script__';

/**
 * store json and fetch json
 */
module.exports = (jsonFilePath, scriptdir) => {
    scriptdir = getCacheDir(jsonFilePath, scriptdir);

    let {
        setData, getData
    } = data();

    let interpret = interpreter({
        getData
    });

    let readJsonTask = locker(() => {
        return readFile(jsonFilePath, 'utf-8').then((jsonStr) => {
            return JSON.parse(jsonStr);
        }).then((data) => {
            // cache data to variable
            setData(data);
            return getData();
        });
    });

    let saveChanges = locker((letaUpdateScripts) => {
        /**
         * if you write data while you are reading data, it may cause you read data which is half-writing
         */
        return readJsonTask.waitUnlock().then(() => {
            // modify json
            interpret(letaUpdateScripts);

            // save json file
            return writeFile(jsonFilePath, JSON.stringify(getData()), 'utf-8').then(() => {
                return getData();
            });
        });
    });

    let waitReadTask = waiter(readJsonTask);

    let update = (letaUpdateScripts) => {
        return Promise.resolve(getData() || get()).then(() => saveChanges(letaUpdateScripts));
    };

    let get = () => {
        // wait unlock save op
        return saveChanges.waitUnlock().then(() => {
            if (getData()) return Promise.resolve(getData());
            // read json from file
            return waitReadTask();
        });
    };

    return mkdirp(scriptdir).then(() => {
        return {
            update,
            get
        };
    });
};

let getCacheDir = (jsonFilePath, scriptdir) => {
    let jsondir = path.dirname(jsonFilePath),
        jsonName = path.basename(jsonFilePath, path.extname(jsonFilePath));
    scriptdir = scriptdir || path.resolve(jsondir, `${FAST_SCRIPT_DIR_PREFIX}${jsonName}__`);

    return scriptdir;
};
