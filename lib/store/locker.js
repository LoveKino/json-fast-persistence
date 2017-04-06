'use strict';

let queue = require('./queue');

/**
 * provide locker for function process
 */

module.exports = (fn, options) => {
    let lock = false;

    let {
        lineUp, notify, error
    } = queue(options);

    let lockup = () => {
        lock = true;
    };

    let unlock = () => {
        lock = false;
    };

    let newFun = (...args) => {
        return newFun.waitUnlock().then(() => {
            lockup();

            let ret = fn(...args);

            Promise.resolve(ret).then((data) => {
                unlock();
                notify(data);
            }).catch((err) => {
                error(err);
                throw err;
            });

            return ret;
        });
    };

    newFun.waitUnlock = () => {
        if (lock === false) return Promise.resolve();
        return lineUp();
    };

    return newFun;
};
