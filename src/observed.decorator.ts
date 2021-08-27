import { observedProps } from './symbols';
import { Constructor, ObservableType } from './types';

export default function observed<T extends ObservableType>(Fn: Constructor<T>) {
  return function ({ constructor }: { constructor: Function }, propName: string) {
    if (!(observedProps in constructor)) {
      (constructor as any)[observedProps] = new Map<keyof T, Constructor<T>>();
    }
    (constructor as any)[observedProps].set(propName, Fn);
  }
}