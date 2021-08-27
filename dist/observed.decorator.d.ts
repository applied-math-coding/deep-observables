import { Constructor, ObservableType } from './types';
export default function observed<T extends ObservableType>(Fn: Constructor<T>): ({ constructor }: {
    constructor: Function;
}, propName: string) => void;
//# sourceMappingURL=observed.decorator.d.ts.map