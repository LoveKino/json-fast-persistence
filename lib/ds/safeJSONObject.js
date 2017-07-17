'use strict';

let {
    isNumber, isString, isArray, isObject, isBool, isNull
} = require('basetype');

/**
 * build a save json object
 *
 * provide a json object which need auth to access data
 */

let toSafeJsonObject = (jsonObject) => {
    if (isNumber(jsonObject) ||
        isString(jsonObject) ||
        isBool(jsonObject) ||
        isNull(jsonObject)
    ) return jsonObject;

    if (isObject(jsonObject)) {
        let v = {};
        for (let name in jsonObject) {
            let child = jsonObject[name];
            defineProp(v, name, toSafeJsonObject(child));
        }

        return v;
    }

    if (isArray(jsonObject)) {
        let v = [];
        for (let i = 0; i < jsonObject.length; i++) {
            let child = jsonObject[i];
            defineProp(v, i, toSafeJsonObject(child));
        }

        return v;
    }

    throw new Error(`unexpected type to convert from json object ${jsonObject}`);
};

let defineProp = (obj, key, value) => {
    let v = value;
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set: function(value) {
            v = value;
        },
        get: function() {
            return v;
        }
    });
};

module.exports = {
    toSafeJsonObject
};
