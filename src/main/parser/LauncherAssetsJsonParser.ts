import Utils from "../utils/Utils";

export class LauncherAssetsJsonParser {

    private _serverJsonData: any;
    private _serverId;
  
    constructor(serverId: string, serverJsonData: any) {
      this._serverId = serverId;
      this._serverJsonData = serverJsonData;
    }
  
    private get _serverList(): any {
      return this._serverJsonData.serverList;
    }
  
    public get javaVersion(): string {
      return this._serverList[this._serverId].java[Utils.getOSType()].version;
    }
  
    public get javaFileName(): string {
      return this._serverList[this._serverId].java[Utils.getOSType()].download.fileName;
    }
  
    public get javaDownloadUrl(): string {
      return this._serverList[this._serverId].java[Utils.getOSType()].download.url;
    }
  
    public get id(): string {
      return this._serverList[this._serverId].id;
    }
  
    private get _contentPageBlock(): { title: string, url: string } {
      return this._serverList[this._serverId].contentPageBlock;
    }
  
    public get pageBlockTitle(): string {
      return this._contentPageBlock.title;
    }
  
    public get pageBlockUrl(): string {
      return this._contentPageBlock.url;
    }
  
    public get minecraftVersion(): string {
      return this._serverList[this._serverId].minecraftVersion;
    }
  
    public get minecraftType(): string {
      return this._serverList[this._serverId].minecraftType;
    }
  
    private get _modpack(): { type: "Revise" | "CurseForge" | "FTB", name: string, projectId: number, fileId: number, version: string, url: string } {
      return this._serverList[this._serverId].modpack;
    }
  
    public get modpackType(): "Revise" | "CurseForge" | "FTB" {
      return this._modpack.type;
    }
  
    public get modpackName(): string {
      return this._modpack.name;
    }
  
    public get modpackProjectId(): number {
      return this._modpack.projectId;
    }
  
    public get modpackFileId(): number {
      return this._modpack.fileId;
    }
  
    public get modpackVersion(): string {
      return this._modpack.version;
    }
  
    public get modpackUrl(): string {
      return this._modpack.url;
    }
  
    private get _modLoaders(): { type: string, id: string, version: string, necessaryFilePath: Array<string>, download: { url: string } } {
      return this._serverList[this._serverId].modLoaders;
    }
  
    public get modLoadersType(): string {
      return this._modLoaders.type;
    }
  
    public get modLoadersId(): string {
      return this._modLoaders.id;
    }
    public get modLoadersVersion(): string {
      return this._modLoaders.version;
    }
  
    public get modLoadersNecessaryFilePaths(): Array<string> {
      return this._modLoaders.necessaryFilePath;
    }
  
    public get modLoadersUrl(): string {
      return this._modLoaders.download.url;
    }
  
    public get modules(): Array<{ name: string, version: string, type: string, action: string, projectId: number, fileId: number }> {
      return this._serverList[this._serverId].modules;
    }
  
    public get serverPageBlockUrl(): string {
      return this._serverList[this._serverId].contentPageBlock.serverPageUrl;
    }
  }
  