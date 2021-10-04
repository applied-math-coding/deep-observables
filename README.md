# deep-observables

## Installation:
```
npm install @applied.math.coding/deep-observables
```

## Basic usage:
Assume you have three class declarations A, B and C.<br>
Moreover, assume they do referrence each other like below.<br>
If you want to have the values from such nested classes automatically updating on changes, you<br>
may use the annotation '@observed' and ensure to call the method 'changeEntity'<br>
with corresponding type and new value.<br>

```
import { changeEntity, fromJson, observed } from 'deep-observables';

class C {
  id: number;
  d: boolean;
}

class B {
  id: number;
  p: number;
  q: number;
  r?: {
    rr: number;
  }
  @observed(C)
  c?: C;  
}

class A {
  id: number;
  p: string;
  @observed(B)
  b: B;
  @observed(C)
  c?: C;
}

const o = fromJson<A>({
  id: 0,
  p: '',
  b: {
    id: 0,
    p: 5,
    q: 1
  }
}, A);

o.p = 'hello';
o.b.p = 9;
changeEntity(B, { id: 0, p: 7, q: 2 });
```
  
## Note
  Array types are not supported at the moment.<br>
  The library is of pure experimental nature!<br>
  Feel invited to extend or to propose changes.
