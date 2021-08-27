import { Constructor, ObservableType, ObservedObjectType } from './types';
export declare class EntityChangeService {
    private subscriptions;
    subscribe(Fn: Constructor<ObservableType>, o: ObservedObjectType): void;
    changeEntity<T extends ObservableType>(Fn: Constructor<T>, v: T): void;
    private getSubscriptionsForType;
}
declare const _default: EntityChangeService;
export default _default;
//# sourceMappingURL=entity-change.service.d.ts.map