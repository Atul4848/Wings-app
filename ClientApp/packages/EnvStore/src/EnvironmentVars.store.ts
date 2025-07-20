import { ENVIRONMENT_VARS } from './EnvironmentVars.enum';

export class EnvironmentVarsStore {
  public static readonly storeKey: string = 'wingsEnvironment';

  public getVar(key: ENVIRONMENT_VARS): string {
    const storeKey: string = EnvironmentVarsStore.storeKey;
    //@ts-ignore
    return globalThis[storeKey] ? globalThis[storeKey][key] || '' : '';
  }

  public setVars(vars: Record<ENVIRONMENT_VARS, string>): void {
    Object.defineProperty(globalThis, EnvironmentVarsStore.storeKey, {
      value: Object.freeze(vars),
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
}
