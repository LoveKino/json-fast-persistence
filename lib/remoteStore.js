'use strict';

let store = require('./store');

/**
 * deploy remote store through network
 */
module.exports = (...args) => {
    let {
        getDataAndId, updateWithValidation
    } = store(...args);

    return {
        getDataAndId: () => {
            return getDataAndId().then(({
                data, id
            }) => {
                return {
                    data: JSON.stringify(data), // send string to client
                    id
                };
            });
        },

        updateWithValidation
    };
};
