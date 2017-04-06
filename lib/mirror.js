'use strict';

/**
 * handle this json in another client, but keep synchronization with store client
 *
 * 1. synchronization data from store client
 * 2. commit changes to store client
 * 3. accept changes from store client
 */

module.exports = (remoteStore) => {
    let {get, update} = remoteStore;
};
