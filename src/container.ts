export interface Container<
  TDependencies extends Record<string | symbol, unknown>
> {
  /**
   * Resolve a dependency from the container.
   *
   * @param name The name of the dependency.
   */
  readonly resolve: <TName extends keyof TDependencies>(
    name: TName
  ) => TDependencies[TName];

  /**
   * Register a new dependency.
   *
   * @param name The name of the dependency.
   * @param dependency A dependency factory.
   */
  readonly register: <TName extends string | symbol, TDependency>(
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
  TContainer extends Container<Record<string | symbol, unknown>>
> = (container: TContainer) => T;

/**
 * Creates an empty DI container.
 */
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
