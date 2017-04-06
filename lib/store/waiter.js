'use strict';

let queue = require('./queue');

module.exports = (taskFun, options) => {
    let currentTask = null;

    let {
        lineUp, error, notify
    } = queue(options);

    let wait = () => {
        let result = lineUp(); // line up first

        if (!currentTask) { // first one to wait task
            currentTask = taskFun();
        }

        currentTask.then(notify).catch(error);

        return result;
    };

    return wait;
};
