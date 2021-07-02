export interface Container<TDependencies extends Record<string, unknown>> {
  resolve: <TName extends keyof TDependencies>(
    name: TName
  ) => TDependencies[TName];
  register: <TName extends string, TDependency>(
    name: TName,
    dependency: Factory<TDependency, Container<TDependencies>>
  ) => Container<
    {
      [TK in keyof TDependencies | TName]: TK extends keyof TDependencies
        ? TName extends TK
          ? TDependency
          : TDependencies[TK]
        : TDependency;
    }
  >;
}

export type Factory<
  T,
  TContainer extends Container<Record<string, unknown>>
> = (container: TContainer) => T;

export function createContainer(): Container<{}> {
  throw new Error('Not implemented yet');
}
