"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const route_info_1 = require("./route-info");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
// public
class Utils // static class
 {
    static generateUrl(route, params, baseUrl) {
        (0, n_defensive_1.given)(route, "route").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        if (params)
            (0, n_defensive_1.given)(params, "params").ensureIsObject();
        if (baseUrl)
            (0, n_defensive_1.given)(baseUrl, "baseUrl").ensureIsString();
        route = route.trim().replaceAll(" ", "");
        if (baseUrl !== undefined && baseUrl != null && !baseUrl.isEmptyOrWhiteSpace()) {
            baseUrl = baseUrl.trim().replaceAll(" ", "");
            if (baseUrl.endsWith("/"))
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            if (!route.startsWith("/"))
                route = "/" + route;
            route = baseUrl + route;
        }
        return params ? new route_info_1.RouteInfo(route, true).generateUrl(params) : route;
    }
    static getTypeName(value) {
        var _a;
        (0, n_defensive_1.given)(value, "value").ensureHasValue().ensureIsFunction();
        return (_a = value.___$typeName) !== null && _a !== void 0 ? _a : (" " + value.getTypeName().trim()).substr(1); // Shrey: Safari de-optimization
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map