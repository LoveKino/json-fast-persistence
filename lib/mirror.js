'use strict';

let interpreter = require('./store/interpreter');
let Data = require('./store/data');
let locker = require('./util/locker');

/**
 * operate mirror and reflect changes to store
 *
 * handle this json in another client, but keep synchronization with store client
 *
 * deploy mirror in a mirror client
 */
module.exports = (remoteStore) => {
    let {
        getDataAndId, updateWithValidation
    } = remoteStore;

    // first sync data
    return getDataAndId().then((ret) => {
        let dataInterface = Data();
        // get data str from remote store
        dataInterface.setData(JSON.parse(ret.data));
        dataInterface.setId(ret.id);

        let {
            parse
        } = interpreter(dataInterface);

        let update = locker((updateScripts) => {
            return updateWithValidation(dataInterface.getId(), updateScripts).then((newId) => {
                parse(updateScripts);
                dataInterface.setId(newId);

                return dataInterface.getData();
            });
        });

        let get = () => {
            return update.waitUnlock().then(() => {
                return dataInterface.getData();
            });
        };

        return {
            update,
            get
        };
    });
};
