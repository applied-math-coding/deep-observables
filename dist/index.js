"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromJson = exports.changeEntity = exports.observed = void 0;
const entity_change_service_1 = __importDefault(require("./entity-change.service"));
const observed_decorator_1 = __importDefault(require("./observed.decorator"));
exports.observed = observed_decorator_1.default;
const symbols_1 = require("./symbols");
const changeEntity = (Fn, v) => {
    entity_change_service_1.default.changeEntity(Fn, v);
};
exports.changeEntity = changeEntity;
// As type-guard, since v eventually is not ObservableType.
function isInObservableProps(obProps, k, v) {
    return obProps.has(k);
}
function isTerminalType(v) {
    return ['string', 'boolean', 'number', 'bigint', 'symbol'].includes(typeof v);
}
// TODO must cope for array-types
function containsEditedFields(o) {
    var _a;
    return ((_a = o[symbols_1.editedProps]) === null || _a === void 0 ? void 0 : _a.length) > 0 ||
        Object.entries(o)
            .filter(([_, v]) => !isTerminalType(v) && v != null).some(([_, v]) => containsEditedFields(v));
}
// Intends to either update the object 'obj' or to create a new one.
// It pulls values from object 'raw' and recursively calls to update keys on the object.
// opts.override: true, indicates the consumer is applying values, otherwise change comes from elsewhere
// opts.isInit: true, indicates all new properties are added without being flagged as edited
function updateOrCreateObject(obj, raw, opts) {
    if (raw == null) {
        return !opts.override && obj != null && containsEditedFields(obj)
            ? obj
            : null;
    }
    if (obj == null) {
        const edProps = opts.override && !opts.isInit ?
            Object.entries(raw).filter(([_, v]) => isTerminalType(v) && v != null).map(([k, _]) => k) :
            [];
        obj = createEditCheckedInstance(edProps);
    }
    const combinedKeys = new Set([...Object.keys(raw || {}), ...Object.keys(obj)]);
    combinedKeys.forEach(k => updateKeyValue(obj, k, raw[k], opts));
    return obj;
}
// Intends to set a given key to a given value on a given object.
// It directly set terminal values and recursively treats object-typed values.
function updateKeyValue(obj, k, v, opts) {
    if (isTerminalType(v) && (isTerminalType(obj[k]) || obj[k] == null)) {
        checkedUpdateTerminalValue(obj, k, v, opts);
    }
    else {
        createOrUpdateProperty(obj, k, updateOrCreateObject(obj[k], v, opts));
    }
}
// Updates a terminal value in case it is allowed to do so.
function checkedUpdateTerminalValue(obj, k, v, opts) {
    if ((opts.override || !obj[symbols_1.editedProps].includes(k))) {
        if (k in obj) {
            obj[k] = v; // ensure to go through the setter in case key exists already and it is not init.
        }
        else {
            createOrUpdateProperty(obj, k, v);
        }
    }
}
// It is important to start with an empty instance here! Every new field from a raw object, first must be defined,
// and so the setter is not being called at init. This avoids to have 'edited' flag set on all fields.
function createEditCheckedInstance(edProps = []) {
    const instance = Object.create({
        [symbols_1.editedProps]: edProps
    }); // new empty(!) instance
    return new Proxy(instance, {
        set(_, p, v) {
            if (isTerminalType(v) && !instance[symbols_1.editedProps].includes(p) && instance[p] !== v) {
                instance[symbols_1.editedProps].push(p);
            }
            instance[p] = isTerminalType(v) ? v : updateOrCreateObject(instance[p], v, { override: true });
            return true;
        },
        defineProperty(target, p, description) {
            target[p] = description.value;
            return true;
        },
    });
}
// Adding values to proxies must be done this way.
function createOrUpdateProperty(obj, prop, value) {
    Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        value
    });
}
// This instance is subscribing to outside changes.
function createObservedObjectInstance(obj, Fn) {
    const instance = obj;
    createOrUpdateProperty(Object.getPrototypeOf(instance), symbols_1.subscriptionHandler, (raw) => handleNewRawObject(raw, Fn, instance, { override: false }));
    entity_change_service_1.default.subscribe(Fn, instance);
    return instance;
}
// Applying new raw values on instance. Distinguished between cases of observed and non-observed fields.
function handleNewRawObject(raw, Fn, instance, opts) {
    var _a;
    const obsProps = (_a = Fn[symbols_1.observedProps]) !== null && _a !== void 0 ? _a : new Map();
    const combinedKeys = new Set([...Object.keys(raw || {}), ...Object.keys(instance)]);
    combinedKeys.forEach(k => {
        const v = raw[k];
        if (isInObservableProps(obsProps, k, v)) {
            const value = recFromJson(v, obsProps.get(k), instance[k], opts);
            createOrUpdateProperty(instance, k, value);
        }
        else if (isTerminalType(v)) {
            checkedUpdateTerminalValue(instance, k, v, opts);
        }
        else {
            createOrUpdateProperty(instance, k, updateOrCreateObject(instance[k], v, opts));
        }
    });
}
function recFromJson(raw, Fn, current, opts) {
    const instance = current !== null && current !== void 0 ? current : createObservedObjectInstance(createEditCheckedInstance(), Fn);
    handleNewRawObject(raw, Fn, instance, opts);
    return instance;
}
function fromJson(raw, Fn) {
    return recFromJson(raw, Fn, null, { override: true, isInit: true });
}
exports.fromJson = fromJson;
//# sourceMappingURL=index.js.map