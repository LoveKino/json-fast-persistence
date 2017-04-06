'use strict';

let {
    dsl
} = require('leta');

let del = require('del');

let uuidv4 = require('uuid/v4');

let path = require('path');

let {
    readJson, writeJson
} = require('../util');

let interpreter = require('./interpreter');

let {
    getJson
} = dsl;

module.exports = (jsonFilePath, scriptdir, dataInterface) => {
    let {
        parse
    } = interpreter(dataInterface);

    let scriptIndexJsonPath = path.join(scriptdir, './index.json');
    /**
     * scriptdir
     *      index.json: store the script queue information
     *      some file like [id].json: store updating scripts
     *
     * TODO fail situation and how to recovery from fail
     */
    let saveUpateScripts = (letaUpdateScripts) => {
        let scriptData = getJson(letaUpdateScripts);

        parse(scriptData);

        return readJson(scriptIndexJsonPath).then((indexJson) => {
            let scriptName = uuidv4() + '.json';
            let scriptPath = path.join(scriptdir, scriptName);

            indexJson.scripts.push(scriptPath);

            return Promise.all([
                writeJson(scriptIndexJsonPath, indexJson),
                writeJson(scriptPath, scriptData)
            ]);
        });
    };

    let arrangeSource = () => {
        return Promise.all([
            readJson(jsonFilePath),
            prepareUpdateScripts(scriptIndexJsonPath)
        ]).then(([json, {
            updateScripts, scriptIndexJson
        }]) => {
            dataInterface.setData(json);

            let scripts = scriptIndexJson.scripts;
            if (!scripts.length) return;

            for (let i = 0; i < updateScripts.length; i++) {
                let script = updateScripts[i];
                parse(script);
            }

            scriptIndexJson.scripts = [];

            return writeBackState(scriptIndexJson, scripts);
        });
    };

    // TODO retry and attack test
    let writeBackState = (scriptIndexJson, scripts) => {
        return Promise.all([
            writeJson(jsonFilePath, dataInterface.getData()),
            writeJson(scriptIndexJsonPath, scriptIndexJson),

            del(scripts, {
                force: true
            })
        ]);
    };

    return {
        saveUpateScripts,
        arrangeSource
    };
};

let prepareUpdateScripts = (scriptIndexJsonPath) => {
    return readJson(scriptIndexJsonPath).then((indexJson) => {
        let scripts = indexJson.scripts;

        return Promise.all(scripts.map((scriptPath) => {
            return readJson(scriptPath).catch(err => {
                throw new Error(`unexpected error happened. Fail to find script file, path is ${scriptPath}. Detail: ${err.toString()}`);
            });
        })).then((updateScripts) => {
            return {
                updateScripts,
                scriptIndexJson: indexJson
            };
        });
    });
};
