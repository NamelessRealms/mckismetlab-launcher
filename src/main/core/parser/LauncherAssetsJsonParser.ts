import Utils from "../utils/Utils";

interface ILauncherAssetsObjectsJson {
  updated: number;
  version: string;
  servers: Array<IServerObject>;
}

interface IServerObject {
  id: string;
  java: {
    [system: string]: {
      version: string;
      download: {
        url: string;
        fileName: string;
      }
    };
    windows: {
      version: string;
      download: {
        url: string;
        fileName: string;
      }
    },
    osx: {
      version: string;
      download: {
        url: string;
        fileName: string;
      }
    }
  },
  modpack: {
    name: string;
    type: "Revise" | "CurseForge" | "FTB";
    fileId: number;
    version: string;
    projectId: number;
    downloadUrl: string;
  } | null,
  modules: Array<{
    name: string;
    type: "CurseForge";
    action: "ADD" | "Remove";
    fileId: number;
    version: string;
    projectId: number;
    downloadUrl: string;
  }>,
  modLoader: {
    id: string;
    type: "Forge" | "Fabric";
    version: string;
    download: {
      url: string;
    }
  } | null,
  minecraftType: "minecraftModpack" | "minecraftModules" | "minecraftVanilla",
  minecraftVersion: string;
}

export class LauncherAssetsJsonParser {

  private _launcherAssetsJsonObjects: ILauncherAssetsObjectsJson;
  private _serverAssetsJsonObjects: IServerObject;

  constructor(serverId: string, launcherAssetsObjectsJson: any) {

    this._launcherAssetsJsonObjects = launcherAssetsObjectsJson;

    const serverAssetsObjectsJson = (launcherAssetsObjectsJson.servers as Array<IServerObject>).find(server => server.id === serverId);
    if (serverAssetsObjectsJson === undefined) throw new Error("serverAssetsObjectsJson not null.");
    this._serverAssetsJsonObjects = serverAssetsObjectsJson;
  }

  public getServers(): Array<IServerObject> {
    return this._launcherAssetsJsonObjects.servers;
  }

  public getJavaVMVersion(): string {
    return this._serverAssetsJsonObjects.java[Utils.getOSType()].version;
  }

  public getJavaVMFileName(): string {
    return this._serverAssetsJsonObjects.java[Utils.getOSType()].download.fileName;
  }

  public getJavaVMDownloadUrl(): string {
    return this._serverAssetsJsonObjects.java[Utils.getOSType()].download.url;
  }

  public getId(): string {
    return this._serverAssetsJsonObjects.id;
  }

  public getMinecraftVersion(): string {
    return this._serverAssetsJsonObjects.minecraftVersion;
  }

  public getMinecraftType(): "minecraftModpack" | "minecraftModules" | "minecraftVanilla" {
    return this._serverAssetsJsonObjects.minecraftType;
  }

  public getModpackData(): { type: "Revise" | "CurseForge" | "FTB", name: string, projectId: number, fileId: number, version: string, downloadUrl: string } {
    if(this._serverAssetsJsonObjects.modpack !== null) {
      return this._serverAssetsJsonObjects.modpack;
    } else {
      throw new Error("serverAssetsObjectsJson 'modpack' not null.");
    }
  }

  public getModpackType(): "Revise" | "CurseForge" | "FTB" {
    return this.getModpackData().type;
  }

  public getModpackName(): string {
    return this.getModpackData().name;
  }

  public getModpackProjectId(): number {
    return this.getModpackData().projectId;
  }

  public getModpackFileId(): number {
    return this.getModpackData().fileId;
  }

  public getModpackVersion(): string {
    return this.getModpackData().version;
  }

  public getModpackDownloadUrl(): string {
    return this.getModpackData().downloadUrl;
  }

  public getModLoaderData(): { id: string, type: "Forge" | "Fabric", version: string, download: { url: string } } {
    if(this._serverAssetsJsonObjects.modLoader !== null) {
      return this._serverAssetsJsonObjects.modLoader;
    } else {
      throw new Error("serverAssetsObjectsJson 'modLoader' not null.")
    }
  }

  public getModLoadersType(): string {
    return this.getModLoaderData().type;
  }

  public getModLoadersId(): string {
    return this.getModLoaderData().id;
  }
  public getModLoadersVersion(): string {
    return this.getModLoaderData().version;
  }

  public getModLoadersUrl(): string {
    return this.getModLoaderData().download.url;
  }

  public getModules(): Array<{ name: string, version: string, type: "CurseForge", action: "ADD" | "Remove", projectId: number, fileId: number, downloadUrl: string }> {
    return this._serverAssetsJsonObjects.modules;
  }
}
