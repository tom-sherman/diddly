# ts-di - Pure functional dependency injection for TypeScript

**NOTE: This library is very experimental and at the point of writing only typechecks, it doesn't do anything at runtime apart from always throw an error 😳**

## Benefits

- 100% type safe
- Purely functional
- Immutable
- Circular dependencies are impossible

## Example

```ts
import { createContainer } from 'ts-di';

function printNameAndAge(name: string, age: number) {
  console.log(`${name} is aged ${age}`);
}
​
const container = createContainer()
  .register('someAge', value(5))
  .register('someName', value('Timmy'))
  .register('fn', func(printNameAndAge, 'someName', 'someAge'));
​
const print = container.resolve('fn');
print(); // Prints "Timmy is aged 5"
```
