import { editedProps, subscriptionHandler } from './symbols';

export type Constructor<T = any> = (new (...args: any[]) => T);
export type ObservableType = { id: number };
export type Subscription = { Fn: Constructor<ObservableType>, handler: (o: ObservableType) => void };
export type EditCheckedType<T> = {
  [editedProps]: string[]
} & T;
export type ObservedObjectType<T extends ObservableType = ObservableType> = {
  [subscriptionHandler]: Subscription['handler']
} & EditCheckedType<T>;
export type PropertyUpdateOptions = { override: boolean, isInit?: boolean };