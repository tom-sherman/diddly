export interface Container<TDependencies extends Record<string, unknown>> {
  readonly resolve: <TName extends keyof TDependencies>(
    name: TName
  ) => TDependencies[TName];
  readonly register: <TName extends string, TDependency>(
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
  return _createContainer({});
}

function _createContainer(deps: any): Container<any> {
  return {
    register(n, dep) {
      return _createContainer({
        ...deps,
        [n]: dep,
      });
    },
    resolve(name) {
      return deps[name](this);
    },
  };
}
