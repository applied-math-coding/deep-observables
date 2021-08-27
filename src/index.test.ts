import { fromJson } from '.';
import entityChangeService from './entity-change.service';
import observed from './observed.decorator';

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
  // @observed(C)
  // c: C[];  TODO treat this case!
}

class A {
  id: number;
  p: string;
  @observed(B)
  b: B;
  @observed(C)
  c?: C;
}

test('changing values from inside and edited fields from outside', () => {
  const o = fromJson<A>({
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
  entityChangeService.changeEntity(B, { id: 0, p: outsideChangeValue_p, q: outsideChangeValue_q });
  expect(o.b.p).toBe(consumerChangedValue_p);
  expect(o.b.q).toBe(2);
});

test('adding observed fields from outside', () => {
  const o = fromJson<A>({
    id: 0,
    p: '',
    b: {
      id: 0,
      p: 5,
      q: 1
    }
  }, A);
  const newObserved: C = { id: 1, d: true };
  expect(o.c).toBeFalsy();
  entityChangeService.changeEntity(C, newObserved);
  expect(o.c).toBeFalsy();
});

test('adding non-observed field from outside', () => {
  const o = fromJson<A>({
    id: 0,
    p: '',
    b: {
      id: 0,
      p: 5,
      q: 1
    }
  }, A);
  const newObservered: B = {
    id: 0,
    p: 5,
    q: 1,
    r: {
      rr: 7
    }
  };
  expect(o.b.r).toBeFalsy();
  entityChangeService.changeEntity(B, newObservered);
  expect(o.b.r?.rr).toBe(7);
  o.b.r && (o.b.r.rr = 9);
  expect(o.b.r?.rr).toBe(9);
});

test('adding non-observed from consumer', () => {
  const o = fromJson<A>({
    id: 0,
    p: '',
    b: {
      id: 0,
      p: 5,
      q: 1
    }
  }, A);
  const newObservered: B = {
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
  expect(o.b.r?.rr).toBe(7);
  entityChangeService.changeEntity(B, newObservered);
  expect(o.b.r?.rr).toBe(7);
});

test('setting a non-edited field to null from outside', () => {
  const o = fromJson<A>({
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
  const newObservered: B = {
    id: 0,
    p: 5,
    q: 1
  };
  expect(o.b.r).toBeTruthy();
  entityChangeService.changeEntity(B, newObservered);
  expect(o.b.r).toBeFalsy();
});

test('trying to set an edited field to null from outside', () => {
  const o = fromJson<A>({
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
  const newObservered: B = {
    id: 0,
    p: 5,
    q: 1
  };
  o.b.r = { rr: 7 };
  expect(o.b.r?.rr).toBe(7);
  entityChangeService.changeEntity(B, newObservered);
  expect(o.b.r?.rr).toBe(7);
});
