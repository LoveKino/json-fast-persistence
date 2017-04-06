'use strict';

module.exports = ({
    waitMaxLength = 100000
} = {}) => {
    let queue = [];

    let lineUp = () => {
        if (queue.length >= waitMaxLength) {
            return Promise.reject(new Error('over max waiting length'));
        }

        return new Promise((resolve, reject) => {
            queue.push({
                resolve, reject
            });
        });
    };

    let notify = (data) => {
        for (let i = 0; i < queue.length; i++) {
            let {
                resolve
            } = queue[i];
            resolve(data);
        }

        clear();
    };

    let error = (err) => {
        for (let i = 0; i < queue.length; i++) {
            let {
                reject
            } = queue[i];
            reject(err);
        }

        clear();
    };

    let clear = () => {
        queue = [];
    };

    return {
        lineUp,
        notify,
        error
    };
};
