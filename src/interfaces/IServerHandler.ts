import { IModLoaders } from "./IModLoaders";
import { IModuleHandlerReturn } from "./IModuleHandlerReturn";

export default interface IServerHandler {
  id: string;
  java: {
    version: string;
    runtimeJavaDirPath: string;
    download: {
      fileName: string;
      url: string;
    }
  };
  modLoaders: IModLoaders | undefined;
  modules: IModuleHandlerReturn | undefined;
  minecraftVersion: string;
  minecraftType: string;
}
