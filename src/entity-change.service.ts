import { subscriptionHandler } from './symbols';
import { Constructor, ObservableType, ObservedObjectType } from './types';

export class EntityChangeService {
  // WeakRef ensures, when target object is not referenced anywhere else, it can be garbage collected
  private subscriptions: Map<Constructor<ObservableType>, WeakRef<ObservedObjectType>[]> = new Map();

  subscribe(Fn: Constructor<ObservableType>, o: ObservedObjectType) {
    this.getSubscriptionsForType(Fn).push(new WeakRef(o));
  }

  changeEntity<T extends ObservableType>(Fn: Constructor<T>, v: T) {
    const availableSubscriptions = this.getSubscriptionsForType(Fn).filter(e => !!e?.deref());
    this.subscriptions.set(Fn, availableSubscriptions);
    availableSubscriptions
      .map(e => e.deref())
      .filter(e => e?.id === v.id)
      .forEach(e => e?.[subscriptionHandler](v));
  }

  private getSubscriptionsForType(Fn: Constructor<ObservableType>): WeakRef<ObservedObjectType>[] {
    if (!this.subscriptions.has(Fn)) {
      this.subscriptions.set(Fn, []);
    }
    return this.subscriptions.get(Fn) as WeakRef<ObservedObjectType>[];
  }
}

export default new EntityChangeService();