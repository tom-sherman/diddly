import { construct, func, value } from './combinators';
import { createContainer } from './container';

function printNameAndAge(name: string, age: number) {
  console.log(`${name} is aged ${age}`);
  return {
    a: age,
  };
}

class Logger {
  constructor(private prefix: string, private suffix: number) {}

  log(message: string) {
    console.log(this.prefix + message + String(this.suffix));
  }
}

const container = createContainer()
  .register('age', value(5))
  .register('foo', value(5))
  .register('name', value('Timmy'))

  // @ts-expect-error Name is not assignable to age
  .register('fnBad1', func(printNameAndAge, 'name', 'name'))

  // @ts-expect-error age is not assignable to name
  .register('fnBad2', func(printNameAndAge, 'age', 'age'))

  // @ts-expect-error Not enough params
  .register('fnBad3', func(printNameAndAge, 'name'))

  // @ts-expect-error Too many params
  .register('fnBad4', func(printNameAndAge, 'name', 'age', 'age'))

  // @ts-expect-error No Params
  .register('fnBad5', func(printNameAndAge))

  .register('fnGood', func(printNameAndAge, 'name', 'age'))

  // @ts-expect-error No Params
  .register('classBad1', construct(Logger))
  // @ts-expect-error Too many params
  .register('classBad2', construct(Logger, 'name', 'name', 'name'))
  // @ts-expect-error age is not assignable to prefix, name is not assignable to suffix
  .register('classBad3', construct(Logger, 'age', 'name'))
  // @ts-expect-error age is not assignable to prefix
  .register('classBad4', construct(Logger, 'age', 'age'))
  // @ts-expect-error name is not assignable to suffix
  .register('classBad4', construct(Logger, 'name', 'name'))
  .register('classGood', construct(Logger, 'name', 'age'));
