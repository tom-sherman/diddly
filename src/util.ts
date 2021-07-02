export type Zip<A extends readonly unknown[], B extends readonly unknown[]> = {
  [K in keyof A]: K extends keyof B ? [A[K], B[K]] : never;
};

export type MapTupleTo<T extends readonly unknown[], U> = { [K in keyof T]: U };

// type Merge<A extends {}, B extends {}> = {
//   [K in keyof A | keyof B]: K extends keyof B
//     ? B[K]
//     : K extends keyof A
//     ? A[K]
//     : never;
// };

/**
 * Analogous to {...A, ...B} except if a key exists in both A & B the value gets set to `never`
 */
export type MergeNoDuplicates<A extends {}, B extends {}> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? K extends keyof A
      ? never
      : B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

type Head<T extends readonly unknown[]> = T[0];
type Tail<T extends readonly unknown[]> = T extends readonly [any, ...infer U]
  ? U
  : [];

export type TupleO<T extends readonly [string, any][]> = _TupleO<
  Head<T>,
  Tail<T>,
  {}
>;

type _TupleO<
  T extends [string, any],
  TRest extends readonly [string, any][],
  I extends {}
> = [] extends TRest
  ? MergeNoDuplicates<
      I,
      {
        [k in T[0]]: Extract<T, [string, any]>[1];
      }
    >
  : _TupleO<
      Head<TRest>,
      Tail<TRest>,
      MergeNoDuplicates<
        I,
        {
          [k in T[0]]: Extract<T, [string, any]>[1];
        }
      >
    >;
