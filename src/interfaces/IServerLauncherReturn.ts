import IModLoaders from "./IModLoaders";
import { IModuleHandlerReturn } from "./IModuleHandlerReturn";

export default interface IServerLauncherReturn {
  id: string;
  java: {
    version: string;
    download: {
      fileName: string;
      url: string;
    }
  };
  modLoaders: IModLoaders | undefined;
  modules: IModuleHandlerReturn | undefined;
  minecraftVersion: string;
  minecraftType: "minecraftModpack" | "minecraftModules" | "minecraftVanilla";
}
