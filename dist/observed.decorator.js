"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function observed(Fn) {
    return function ({ constructor }, propName) {
        if (!(symbols_1.observedProps in constructor)) {
            constructor[symbols_1.observedProps] = new Map();
        }
        constructor[symbols_1.observedProps].set(propName, Fn);
    };
}
exports.default = observed;
//# sourceMappingURL=observed.decorator.js.map