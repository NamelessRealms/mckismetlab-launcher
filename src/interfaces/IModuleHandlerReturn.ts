import IModule from "./IModule";

export interface IModuleHandlerReturn {
  ADD: Array<IModule>;
  REMOVE: Array<IModule>;
  modules: Array<IModule>;
  size: number;
}
