import IModule from "./IModule";

export default interface IInstanceIo {
  instanceId: string;
  modLoadersType: "forge";
  modLoadersVersion: string;
  minecraftVersion: string;
  modpack: {
    name: string;
    version: string;
    projectId: number;
    fileId: number;
  },
  module: {
    size: number;
    modules: Array<IModule>
  }
}
