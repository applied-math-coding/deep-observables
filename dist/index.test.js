"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const entity_change_service_1 = __importDefault(require("./entity-change.service"));
const observed_decorator_1 = __importDefault(require("./observed.decorator"));
class C {
}
class B {
}
__decorate([
    observed_decorator_1.default(C),
    __metadata("design:type", C)
], B.prototype, "c", void 0);
class A {
}
__decorate([
    observed_decorator_1.default(B),
    __metadata("design:type", B)
], A.prototype, "b", void 0);
__decorate([
    observed_decorator_1.default(C),
    __metadata("design:type", C)
], A.prototype, "c", void 0);
test('changing values from inside and edited fields from outside', () => {
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1
        }
    }, A);
    const consumerChangedValue_p = 7;
    const outsideChangeValue_p = 9;
    const outsideChangeValue_q = 2;
    o.p = 'hello';
    o.b.p = consumerChangedValue_p;
    expect(o.b.q).toBe(1);
    entity_change_service_1.default.changeEntity(B, { id: 0, p: outsideChangeValue_p, q: outsideChangeValue_q });
    expect(o.b.p).toBe(consumerChangedValue_p);
    expect(o.b.q).toBe(2);
});
test('adding observed fields from outside', () => {
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1
        }
    }, A);
    const newObserved = { id: 1, d: true };
    expect(o.c).toBeFalsy();
    entity_change_service_1.default.changeEntity(C, newObserved);
    expect(o.c).toBeFalsy();
});
test('adding non-observed field from outside', () => {
    var _a, _b;
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1
        }
    }, A);
    const newObservered = {
        id: 0,
        p: 5,
        q: 1,
        r: {
            rr: 7
        }
    };
    expect(o.b.r).toBeFalsy();
    entity_change_service_1.default.changeEntity(B, newObservered);
    expect((_a = o.b.r) === null || _a === void 0 ? void 0 : _a.rr).toBe(7);
    o.b.r && (o.b.r.rr = 9);
    expect((_b = o.b.r) === null || _b === void 0 ? void 0 : _b.rr).toBe(9);
});
test('adding non-observed from consumer', () => {
    var _a, _b;
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1
        }
    }, A);
    const newObservered = {
        id: 0,
        p: 5,
        q: 1,
        r: {
            rr: 9
        }
    };
    expect(o.b.r).toBeFalsy();
    o.b.r = {
        rr: 7
    };
    expect((_a = o.b.r) === null || _a === void 0 ? void 0 : _a.rr).toBe(7);
    entity_change_service_1.default.changeEntity(B, newObservered);
    expect((_b = o.b.r) === null || _b === void 0 ? void 0 : _b.rr).toBe(7);
});
test('setting a non-edited field to null from outside', () => {
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1,
            r: {
                rr: 9
            }
        }
    }, A);
    const newObservered = {
        id: 0,
        p: 5,
        q: 1
    };
    expect(o.b.r).toBeTruthy();
    entity_change_service_1.default.changeEntity(B, newObservered);
    expect(o.b.r).toBeFalsy();
});
test('trying to set an edited field to null from outside', () => {
    var _a, _b;
    const o = _1.fromJson({
        id: 0,
        p: '',
        b: {
            id: 0,
            p: 5,
            q: 1,
            r: {
                rr: 9
            }
        }
    }, A);
    const newObservered = {
        id: 0,
        p: 5,
        q: 1
    };
    o.b.r = { rr: 7 };
    expect((_a = o.b.r) === null || _a === void 0 ? void 0 : _a.rr).toBe(7);
    entity_change_service_1.default.changeEntity(B, newObservered);
    expect((_b = o.b.r) === null || _b === void 0 ? void 0 : _b.rr).toBe(7);
});
//# sourceMappingURL=index.test.js.map