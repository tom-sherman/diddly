import type { Container, Factory } from './container';
import type { Zip, MapTupleTo, TupleO } from './util';

/**
 * Takes a factory and ensures that once it is resolved once, subsequent resolutions do not invoke the factory but instead return the previously resolved value.
 *
 * This is useful for factories that may have side effects or are expensive to execute.
 *
 * @param factory The factory to create a singleton from.
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
 * Declare a function and it's dependencies.
 *
 * @param fn The function to register.
 * @param args Dependency names that declare the arguments of `fn`. Must be total ie. does not (yet) support partial application of the function.
 *
 * @example
 *
 * ```ts
 * function logNameAndAge(name: string, age: number) {
 *   console.log(`${name} is ${age} years old`);
 * }
 *
 * container.register(
 *   func('logNameAndAge', logNameAndAge, 'someName, 'someAge')
 * );
 * ```
 */
export function func<
  TParams extends readonly unknown[],
  TReturn,
  TDependencies extends readonly string[]
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
    return (...curriedArgs) =>
      fn(
        // @ts-expect-error
        ...args.map((arg) => container.resolve(arg)),
        ...curriedArgs
      );
  };
}

/**
 * Simply lifts the dependency into the container.
 *
 * @example
 *
 * ```ts
 * container.register(
 *   value('someValue', 5)
 * );
 * ```
 */
export function value<TVal>(val: TVal): Factory<TVal, Container<{}>> {
  return () => val;
}

/**
 * Returns an instantiated `TClass` that has been constructed with the dependencies.
 *
 * Similar to func but for classes.
 *
 * @param constructor The class
 *
 * @example
 *
 * ```ts
 * class Logger {
 *   constructor(private prefix: string) {}
 *
 *   log(message: any) {
 *     console.log(`${this.prefix} - ${message}`);
 *   }
 * }
 *
 * container.register(
 *   construct('logger', Logger, 'somePrefix')
 * );
 * ```
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
