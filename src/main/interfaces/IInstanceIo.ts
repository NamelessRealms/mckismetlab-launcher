import IModule from "./IModule";

export default interface IInstanceIo {
  instanceId: string;
  minecraftVersion: string;
  modpack: {
    name: string;
    version: string;
    projectId: number;
    fileId: number;
    files: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>;
  },
  modLoader: {
    type: "Forge" | "Fabric",
    id: string,
    version: string
},
  module: {
    size: number;
    modules: Array<IModule>
  }
}
