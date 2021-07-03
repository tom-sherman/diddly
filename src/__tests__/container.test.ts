import { construct, func, singleton, value } from '../combinators';
import { createContainer } from '../container';

test('can register a dependency', () => {
  const container = createContainer().register('foo', () => 5);

  expect(container.resolve('foo')).toBe(5);
});

test('re-registering the same dependency overwrites it', () => {
  const container = createContainer()
    .register('foo', () => 5)
    .register('foo', () => 6);

  expect(container.resolve('foo')).toBe(6);
});

describe('func', () => {
  test('function with no params', () => {
    const container = createContainer().register(
      'fn',
      func(() => 'result')
    );
    expect(container.resolve('fn')()).toBe('result');
  });

  test('function with one param', () => {
    const container = createContainer()
      .register('val', value('result'))
      .register(
        'fn',
        func((x: string) => x, 'val')
      );
    expect(container.resolve('fn')()).toBe('result');
  });

  test('resolves with new function each time', () => {
    const container = createContainer().register(
      'fn',
      func(() => 'result')
    );

    expect(container.resolve('fn')).not.toBe(container.resolve('fn'));
  });

  test('resolves new dependencies on each invocation of the returned function', () => {
    function counter() {
      let count = 1;
      return () => count++;
    }
    const container = createContainer()
      .register('id', counter())
      .register(
        'getId',
        func((n: number) => n, 'id')
      );

    const fn1 = container.resolve('getId');
    const fn2 = container.resolve('getId');

    expect(fn1()).toBe(1);
    expect(fn1()).toBe(2);
    expect(fn2()).toBe(3);
    expect(fn2()).toBe(4);
    expect(fn1()).toBe(5);
    expect(fn2()).toBe(6);
  });
});

describe('value', () => {
  test.each(['foo', 1, () => 5, class Foo {}, { some: 'object' }, [1, 2, 3]])(
    'returns %p',
    (val) => {
      const container = createContainer().register('val', value(val));

      expect(container.resolve('val')).toBe(val);
    }
  );
});

describe('construct', () => {
  test('constructs with 0 params', () => {
    class Foo {}
    const container = createContainer().register('foo', construct(Foo));
    expect(container.resolve('foo')).toBeInstanceOf(Foo);
  });

  test('constructs with one param', () => {
    class Foo {
      constructor(public value: string) {}
    }

    const container = createContainer()
      .register('val', value('result'))
      .register('foo', construct(Foo, 'val'));

    const foo = container.resolve('foo');
    expect(foo).toBeInstanceOf(Foo);
    expect(foo.value).toBe('result');
  });

  test('constructs with two params', () => {
    class Foo {
      constructor(public str: string, public num: number) {}
    }

    const container = createContainer()
      .register('str', value('result'))
      .register('num', value(4))
      .register('foo', construct(Foo, 'str', 'num'));

    const foo = container.resolve('foo');
    expect(foo).toBeInstanceOf(Foo);
    expect(foo.str).toBe('result');
    expect(foo.num).toBe(4);
  });
});

describe('singleton', () => {
  test('resolves with the same func each time', () => {
    const container = createContainer().register(
      'fn',
      singleton(func(() => 'result'))
    );

    expect(container.resolve('fn')).toBe(container.resolve('fn'));
  });

  test('factory is only called once', () => {
    function counter() {
      let count = 1;
      return () => count++;
    }
    const container = createContainer()
      .register('id', singleton(counter()))
      .register(
        'getId',
        func((n: number) => n, 'id')
      );

    const fn1 = container.resolve('getId');
    const fn2 = container.resolve('getId');

    expect(fn1()).toBe(1);
    expect(fn1()).toBe(1);
    expect(fn2()).toBe(1);
    expect(fn2()).toBe(1);
    expect(fn1()).toBe(1);
    expect(fn2()).toBe(1);
  });
});
