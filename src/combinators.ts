import type { Container, Factory } from './container';
import type { Zip, MapTupleTo, TupleO } from './util';

/**
 * Takes a factory and ensures that once it is resolved once, subsequent resolutions do not invoke the factory but instead return the previously resolved value.
 *
 * This is useful for factories that may have side effects or are expensive to execute.
 */
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

/**
 * Define a function and it's dependencies. Dependecies must be total ie. does not (yet) support partial application of the function.
 */
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
    TupleO<Extract<Zip<TDependencies, TParams>, readonly [string, any][]>>
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

/**
 * Simply lifts the dependency into the container.
 */
export function value<TVal>(val: TVal): Factory<TVal, Container<{}>> {
  return () => val;
}

/**
 * Returns an instantiated `TClass` that has been constructed with the dependencies.
 *
 * Similar to func but for classes.
 */
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
    TupleO<Extract<Zip<TDependencies, TParams>, readonly [string, any][]>>
  >
> {
  return (container) =>
    new constructor(
      // @ts-expect-error
      ...args.map((arg) => container.resolve(arg))
    );
}
