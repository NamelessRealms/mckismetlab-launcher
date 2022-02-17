import IModLoader from "./IModLoader";
import { IModuleHandlerReturn } from "./IModuleHandlerReturn";

export default interface IServerLauncherReturn {
  id: string;
  javaVM: {
    version: string;
    download: {
      fileName: string;
      url: string;
    }
  };
  modLoader: IModLoader | null;
  modpack: {
    type: "Revise" | "CurseForge" | "FTB";
    files?: Array<{ fileName: string, filePath: string, sha1: string, size: number, download: { url: string } }>;
  } | null;
  module: IModuleHandlerReturn | null;
  minecraftVersion: string;
  minecraftType: "minecraftModpack" | "minecraftModules" | "minecraftVanilla";
}
