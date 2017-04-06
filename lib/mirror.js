'use strict';

/**
 * handle this json in another client, but keep synchronization with store client
 *
 * 1. synchronization data from store client
 * 2. commit changes to store client
 * 3. accept changes from store client
 *
 * key process
 *
 * 1. build connection
 *
 * 2. sync data
 *    (1) validate data
 *    (2) sync
 */

module.exports = (remoteStore) => {
    let {
        get, update
    } = remoteStore;
};
