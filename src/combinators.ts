import type { Container, Factory } from './container';
import type { Join, MapTupleTo, TupleO, TupleToObject } from './util';

// I don't think this is needed because our container is immutable? We could feasibly make all factories singletons?
// ie. we could transparently cached all dependency resolutions as the tree is never going to change
export function singleton<TVal, TDependencies extends Record<string, unknown>>(
  factory: Factory<TVal, Container<TDependencies>>
): Factory<TVal, Container<TDependencies>> {
  let result: TVal | undefined;
  return (container) => {
    if (!result) {
      result = factory(container);
    }
    return result;
  };
}

export function func<
  TParams extends readonly unknown[],
  TReturn,
  TDependencies extends MapTupleTo<TParams, string>
>(
  fn: (...args: TParams) => TReturn,
  ...args: TDependencies
): Factory<
  () => TReturn,
  Container<
    TupleO<Extract<Join<TDependencies, TParams>, readonly [string, any][]>>
  >
> {
  return (container) => {
    return () =>
      fn(
        // @ts-expect-error
        ...args.map((arg) => container.resolve(arg))
      );
  };
}

export function value<TVal>(val: TVal): Factory<TVal, Container<{}>> {
  return () => val;
}

export function construct<
  TParams extends readonly unknown[],
  TClass,
  TDependencies extends MapTupleTo<TParams, string>
>(
  constructor: new (...args: TParams) => TClass,
  ...args: TDependencies
): Factory<
  TClass,
  Container<
    TupleO<Extract<Join<TDependencies, TParams>, readonly [string, any][]>>
  >
> {
  return (container) =>
    new constructor(
      // @ts-expect-error
      ...args.map((arg) => container.resolve(arg))
    );
}
