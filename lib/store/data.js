'use strict';

module.exports = () => {
    let curJson = null;

    let dataId = null;

    let setData = (data) => {
        curJson = data;
        return getData();
    };

    let setId = (id) => {
        dataId = id;
    };

    let getData = () => {
        return curJson;
    };

    let getId = () => {
        return dataId;
    };

    return {
        setData,
        getData,
        getId,
        setId
    };
};
