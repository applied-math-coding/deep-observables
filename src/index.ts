import entityChangeService from './entity-change.service';
import observed from './observed.decorator';
import { editedProps, observedProps, subscriptionHandler } from './symbols';
import { Constructor, EditCheckedType, ObservableType, ObservedObjectType, PropertyUpdateOptions } from './types';

export { observed };
export const changeEntity = <T extends ObservableType>(Fn: Constructor<T>, v: T) => {
  entityChangeService.changeEntity(Fn, v);
}

// As type-guard, since v eventually is not ObservableType.
function isInObservableProps<T extends ObservableType>(
  obProps: Map<keyof T, Constructor<ObservableType>>,
  k: keyof T,
  v: T[typeof k] | ObservedObjectType<T>): v is ObservedObjectType<T> {
  return obProps.has(k);
}

function isTerminalType(v: any): boolean {
  return ['string', 'boolean', 'number', 'bigint', 'symbol'].includes(typeof v);
}

// TODO must cope for array-types
function containsEditedFields<T>(o: EditCheckedType<T>): boolean {
  return o[editedProps]?.length > 0 ||
    Object.entries<T>(o)
      .filter(
        ([_, v]) => !isTerminalType(v) && v != null
      ).some(
        ([_, v]) => containsEditedFields(v as EditCheckedType<T>)
      );
}

// Intends to either update the object 'obj' or to create a new one.
// It pulls values from object 'raw' and recursively calls to update keys on the object.
// opts.override: true, indicates the consumer is applying values, otherwise change comes from elsewhere
// opts.isInit: true, indicates all new properties are added without being flagged as edited
function updateOrCreateObject<T extends object>(obj: EditCheckedType<T>, raw: T, opts: PropertyUpdateOptions): typeof obj | null {
  if (raw == null) {
    return !opts.override && obj != null && containsEditedFields(obj)
      ? obj
      : null;
  }
  if (obj == null) {
    const edProps = opts.override && !opts.isInit ?
      Object.entries(raw).filter(([_, v]) => isTerminalType(v) && v != null).map(([k, _]) => k) :
      [];
    obj = createEditCheckedInstance<T>(edProps);
  }
  const combinedKeys = new Set([...Object.keys(raw || {}), ...Object.keys(obj)]);
  combinedKeys.forEach(
    k => updateKeyValue(obj, k, raw[k as keyof T], opts)
  );
  return obj;
}

// Intends to set a given key to a given value on a given object.
// It directly set terminal values and recursively treats object-typed values.
function updateKeyValue<T>(
  obj: EditCheckedType<T>,
  k: string | number | symbol,
  v: T[keyof T],
  opts: { override: boolean }) {
  if (isTerminalType(v) && (isTerminalType(obj[k as keyof T]) || obj[k as keyof T] == null)) {
    checkedUpdateTerminalValue(obj, k, v, opts);
  } else {
    createOrUpdateProperty(obj, k, updateOrCreateObject<any>(obj[k as keyof T], v, opts));
  }
}

// Updates a terminal value in case it is allowed to do so.
function checkedUpdateTerminalValue<T>(
  obj: EditCheckedType<T>,
  k: string | number | symbol,
  v: T[keyof T],
  opts: PropertyUpdateOptions) {
  if ((opts.override || !obj[editedProps].includes(k as string))) {
    if (k in obj) {
      (obj as T)[k as keyof T] = v; // ensure to go through the setter in case key exists already and it is not init.
    } else {
      createOrUpdateProperty(obj, k as string, v);
    }
  }
}

// It is important to start with an empty instance here! Every new field from a raw object, first must be defined,
// and so the setter is not being called at init. This avoids to have 'edited' flag set on all fields.
function createEditCheckedInstance<T extends object>(edProps: string[] = []): EditCheckedType<T> {
  const instance = Object.create({
    [editedProps]: edProps
  });  // new empty(!) instance
  return new Proxy<EditCheckedType<T>>(instance, { // proxy intends to flag edited fields
    set(_, p: string, v: any): boolean {
      if (isTerminalType(v) && !instance[editedProps].includes(p) && instance[p as keyof T] !== v) {
        instance[editedProps].push(p);
      }
      instance[p as keyof T] = isTerminalType(v) ? v : updateOrCreateObject(instance[p as keyof T], v, { override: true });
      return true;
    },
    defineProperty(target: T, p: string | symbol, description: PropertyDescriptor): boolean {
      (target as any)[p] = description.value;
      return true;
    },
  });
}

// Adding values to proxies must be done this way.
function createOrUpdateProperty(obj: any, prop: string | symbol | number, value: any) {
  Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: true,
    value
  });
}

// This instance is subscribing to outside changes.
function createObservedObjectInstance<T extends ObservableType>(obj: EditCheckedType<T>, Fn: Constructor<T>): ObservedObjectType<T> {
  const instance = obj as unknown as ObservedObjectType<T>;
  createOrUpdateProperty(
    Object.getPrototypeOf(instance),
    subscriptionHandler,
    (raw: ObservableType) => handleNewRawObject(raw, Fn, instance, { override: false })
  );
  entityChangeService.subscribe(Fn, instance);
  return instance;
}

// Applying new raw values on instance. Distinguished between cases of observed and non-observed fields.
function handleNewRawObject<T extends ObservableType>(
  raw: T,
  Fn: Constructor<T>,
  instance: ObservedObjectType<T>,
  opts: PropertyUpdateOptions) {
  const obsProps: Map<keyof T, Constructor<ObservableType>> = (Fn as any)[observedProps] ?? new Map();
  const combinedKeys = new Set([...Object.keys(raw || {}), ...Object.keys(instance)]);
  combinedKeys.forEach(
    k => {
      const v = raw[k as keyof T];
      if (isInObservableProps<T>(obsProps, k as keyof T, v)) {
        const value = recFromJson<T[keyof T] & ObservableType>(
          v as unknown as T[keyof T] & ObservableType,
          obsProps.get(k as keyof T) as Constructor<T[keyof T] & ObservableType>,
          instance[k as keyof T] as unknown as ObservedObjectType<T[keyof T] & ObservableType>,
          opts
        );
        createOrUpdateProperty(instance, k, value);
      } else if (isTerminalType(v)) {
        checkedUpdateTerminalValue(instance, k, v, opts);
      } else {
        createOrUpdateProperty(
          instance,
          k,
          updateOrCreateObject<any>(instance[k as keyof T], v, opts)
        );
      }
    }
  );
}

function recFromJson<T extends ObservableType>(
  raw: T,
  Fn: Constructor<T>,
  current: ObservedObjectType<T> | null,
  opts: PropertyUpdateOptions): T {
  const instance = current ?? createObservedObjectInstance(createEditCheckedInstance(), Fn);
  handleNewRawObject(raw, Fn, instance, opts);
  return instance as unknown as T;
}

export function fromJson<T extends ObservableType>(raw: T, Fn: Constructor<T>): T {
  return recFromJson(raw, Fn, null, { override: true, isInit: true });
}
