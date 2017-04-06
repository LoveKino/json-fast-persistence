'use strict';

module.exports = () => {
    let curJson = null;

    let setData = (data) => {
        curJson = data;

        return getData();
    };

    let getData = () => {
        return curJson;
    };

    return {
        setData,
        getData
    };
};
