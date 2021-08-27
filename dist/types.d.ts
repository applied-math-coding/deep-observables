import { editedProps, subscriptionHandler } from './symbols';
export declare type Constructor<T = any> = (new (...args: any[]) => T);
export declare type ObservableType = {
    id: number;
};
export declare type Subscription = {
    Fn: Constructor<ObservableType>;
    handler: (o: ObservableType) => void;
};
export declare type EditCheckedType<T> = {
    [editedProps]: string[];
} & T;
export declare type ObservedObjectType<T extends ObservableType = ObservableType> = {
    [subscriptionHandler]: Subscription['handler'];
} & EditCheckedType<T>;
export declare type PropertyUpdateOptions = {
    override: boolean;
    isInit?: boolean;
};
//# sourceMappingURL=types.d.ts.map