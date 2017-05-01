"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_exception_1 = require("./http-exception");
require("n-ext");
class PropertyInfo {
    get name() { return this._name; }
    get descriptor() { return this._descriptor; }
    constructor(name, descriptor) {
        this._name = name;
        this._descriptor = descriptor;
    }
}
exports.PropertyInfo = PropertyInfo;
class Utils {
    static getPropertyInfos(val) {
        let propertyInfos = new Array();
        let prototype = Object.getPrototypeOf(val);
        if (prototype === undefined || prototype === null)
            return propertyInfos;
        let internal = ["ctx", "onCreate", "onDestroy", "executeOnCreate", "executeOnDestroy", "onEnter", "onLeave"];
        let propertyNames = Object.getOwnPropertyNames(val);
        for (let name of propertyNames) {
            name = name.trim();
            if (name === "constructor" || name.indexOf("_") === 0 || internal.some(t => t === name))
                continue;
            let descriptor = Object.getOwnPropertyDescriptor(val, name);
            propertyInfos.push(new PropertyInfo(name, descriptor));
        }
        propertyInfos.push(...Utils.getPropertyInfos(prototype));
        return propertyInfos;
    }
    static createRouteArgs(route, ctx) {
        let pathParams = ctx.params ? ctx.params : {};
        let queryParams = ctx.query ? ctx.query : {};
        let model = {};
        for (let param of route.params) {
            let lookupKey = param.paramKey.trim().toLowerCase();
            let value = null;
            if (param.isQuery) {
                for (let key in queryParams) {
                    if (key.trim().toLowerCase() === lookupKey) {
                        value = param.parseParam(queryParams[key]);
                        break;
                    }
                }
                if (value === undefined || value === null) {
                    if (!param.isOptional)
                        throw new http_exception_1.HttpException(404);
                    value = null;
                }
            }
            else {
                for (let key in pathParams) {
                    if (key.trim().toLowerCase() === lookupKey) {
                        value = param.parseParam(pathParams[key]);
                        break;
                    }
                }
                if (value === undefined || value === null)
                    throw new http_exception_1.HttpException(404);
            }
            model[param.paramKey] = value;
        }
        // for (let key in queryParams)
        // {
        //     let routeParam = route.findRouteParam(key);
        //     if (!routeParam)
        //         continue;
        //     model[routeParam.paramKey] = routeParam.parseParam(queryParams[key]);
        // }
        // for (let key in pathParams) // this wont work in multi level nesting
        // {
        //     let routeParam = route.findRouteParam(key);
        //     if (!routeParam)
        //         throw new HttpException(404);
        //     model[routeParam.paramKey] = routeParam.parseParam(pathParams[key]);
        // }
        let result = [];
        for (let param of route.params.orderBy(t => t.order)) {
            let value = model[param.paramKey];
            // if (value === undefined || value === null)
            // {
            //     if (!param.isOptional)
            //         throw new HttpException(404);
            //     value = null;
            // }
            result.push(value);
        }
        return result;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map