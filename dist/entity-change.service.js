"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityChangeService = void 0;
const symbols_1 = require("./symbols");
class EntityChangeService {
    constructor() {
        // WeakRef ensures, when target object is not referenced anywhere else, it can be garbage collected
        this.subscriptions = new Map();
    }
    subscribe(Fn, o) {
        this.getSubscriptionsForType(Fn).push(new WeakRef(o));
    }
    changeEntity(Fn, v) {
        const availableSubscriptions = this.getSubscriptionsForType(Fn).filter(e => !!(e === null || e === void 0 ? void 0 : e.deref()));
        this.subscriptions.set(Fn, availableSubscriptions);
        availableSubscriptions
            .map(e => e.deref())
            .filter(e => (e === null || e === void 0 ? void 0 : e.id) === v.id)
            .forEach(e => e === null || e === void 0 ? void 0 : e[symbols_1.subscriptionHandler](v));
    }
    getSubscriptionsForType(Fn) {
        if (!this.subscriptions.has(Fn)) {
            this.subscriptions.set(Fn, []);
        }
        return this.subscriptions.get(Fn);
    }
}
exports.EntityChangeService = EntityChangeService;
exports.default = new EntityChangeService();
//# sourceMappingURL=entity-change.service.js.map