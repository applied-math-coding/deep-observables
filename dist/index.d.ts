import observed from './observed.decorator';
import { Constructor, ObservableType } from './types';
export { observed };
export declare const changeEntity: <T extends ObservableType>(Fn: Constructor<T>, v: T) => void;
export declare function fromJson<T extends ObservableType>(raw: T, Fn: Constructor<T>): T;
//# sourceMappingURL=index.d.ts.map