"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const n_defensive_1 = require("n-defensive");
require("n-ext");
exports.bindSymbol = Symbol("bind");
// public
function bind(...bindings) {
    n_defensive_1.given(bindings, "bindings")
        .ensureHasValue()
        .ensure(t => t.length > 0, "cannot be empty");
    return (target) => Reflect.defineMetadata(exports.bindSymbol, bindings, target);
}
exports.bind = bind;
//# sourceMappingURL=bind.js.map