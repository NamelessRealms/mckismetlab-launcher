import { IProfileData } from "../../interfaces/IProfileData";
import { IJava, ILauncherSettings } from "../../interfaces/ILauncherSettings";
import GlobalPath from "./GlobalPath";
import * as path from "path";
import * as fs from "fs-extra";
import * as keytar from "keytar";
export default class IoFile {

  private commonDirPath = path.join(GlobalPath.getCommonDirPath());
  private profileDataPath = path.join(this.commonDirPath, "profileData.json");
  private launcherSettingsPath = path.join(this.commonDirPath, "launcherSettings.json");

  private profileData: IProfileData;
  private launcherSettings: ILauncherSettings;

  public constructor() {

    if (!fs.existsSync(this.commonDirPath)) {
      fs.ensureDirSync(this.commonDirPath);
    }

    if (!fs.existsSync(this.profileDataPath)) {
      fs.writeFileSync(this.profileDataPath, JSON.stringify({
        microsoftAuth: {
          mcAccountToken: "",
          accessToken: "",
          refreshToken: "",
          expiresAt: "",
        },
        minecraftAuth: {
          accessToken: "",
          clientToken: "",
        },
        authType: "microsoft",
        user: {
          username: "",
          id: ""
        },
        player: {
          name: "",
          uuid: ""
        },
        rememberStatus: true,
        date: ""
      }, null, 2), "utf-8");
    }

    this.profileData = fs.readJSONSync(this.profileDataPath);

    if (!fs.existsSync(this.launcherSettingsPath)) {
      fs.writeFileSync(this.launcherSettingsPath, JSON.stringify({
        language: "zh_tw",
        general: {
          openGameKeepLauncherStarts: true,
          gameStartOpenMonitorLog: false
        },
        java: [
          {
            serverName: "global",
            javaPath: "",
            ramSizeMax: 1024,
            ramSizeMin: 1024,
            javaParameter: "",
            isBuiltInJavaVM: true
          },
          {
            serverName: "mckismetlab-main-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true,
            ramChecked: false,
            javaPathChecked: false,
            javaParameterChecked: false
          },
          {
            serverName: "mckismetlab-deputy-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true,
            ramChecked: false,
            javaPathChecked: false,
            javaParameterChecked: false
          },
          {
            serverName: "mckismetlab-test-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true,
            ramChecked: false,
            javaPathChecked: false,
            javaParameterChecked: false
          }
        ],
        displayPosition: 0,
        launcherKeepOpen: true,
        selectedServerStart: "mckismetlab-main-server",
        date: ""
      }, null, 2), "utf-8");
    }

    this.launcherSettings = fs.readJSONSync(this.launcherSettingsPath);

    this.addJsonData();

    if (this.profileData === undefined || this.launcherSettings === undefined) {
      throw new Error("profileData and launcherSettings null.");
    }
  }

  // version 0.4.0
  private addJsonData() {

    // microsoft Auth
    if (!this.profileData.hasOwnProperty("microsoftAuth")) {
      this.profileData.microsoftAuth = {
        mcAccountToken: "",
        accessToken: "",
        refreshToken: "",
        expiresAt: ""
      }
    }
    if (!this.profileData.hasOwnProperty("authType")) {
      this.profileData.authType = "microsoft";
    }
    if (!this.profileData.microsoftAuth.hasOwnProperty("mcAccountToken")) {
      this.profileData.microsoftAuth.mcAccountToken = "";
    }

    // microsoft Auth
    if (!this.profileData.hasOwnProperty("minecraftAuth")) {
      this.profileData.minecraftAuth = {
        accessToken: "",
        clientToken: "",
      }
    }

    // global
    let globalState = true;
    this.launcherSettings.java.forEach((item) => {
      if (item.serverName === "global") globalState = false;
    });
    if (globalState) {
      this.launcherSettings.java.push({
        serverName: "global",
        javaPath: "",
        ramSizeMax: 1024,
        ramSizeMin: 1024,
        javaParameter: "",
        isBuiltInJavaVM: true,
        ramChecked: false,
        javaPathChecked: false,
        javaParameterChecked: false
      });
    }

    // add java checked
    this.launcherSettings.java.forEach((item, index) => {
      if (!item.hasOwnProperty("ramChecked") && item.serverName !== "global") {
        this.launcherSettings.java[index].ramChecked = false;
        this.launcherSettings.java[index].javaPathChecked = false;
        this.launcherSettings.java[index].javaParameterChecked = false;
      }
    });

    // add general openGameKeepLauncherStarts and gameStartOpenMonitorLog
    if (!this.launcherSettings.hasOwnProperty("general")) {
      this.launcherSettings.general = {
        openGameKeepLauncherState: true,
        gameStartOpenMonitorLog: false
      };
    }
  }
  public save() {
    const date = new Date().toLocaleString();
    this.profileData.date = date;
    this.launcherSettings.date = date;
    fs.writeFileSync(this.profileDataPath, JSON.stringify(this.profileData, null, 2), "utf-8");
    fs.writeFileSync(this.launcherSettingsPath, JSON.stringify(this.launcherSettings, null, 2), "utf-8");
  }

  private dataMapping(array: Array<IJava>, property: string): Map<string, any> {
    let map = new Map();
    array.forEach((value) => {
      map.set(value.serverName, value[property]);
    });
    return map;
  }

  private dataSetFor(serverName: string, property: string, data: string | boolean | number): void {
    this.launcherSettings.java.forEach((value) => {
      if (value.serverName === serverName) {
        value[property] = data;
      }
    });
  }

  public getOpenGameKeepLauncherState(): boolean {
    return this.launcherSettings.general.openGameKeepLauncherState;
  }

  public setOpenGameKeepLauncherState(state: boolean): void {
    this.launcherSettings.general.openGameKeepLauncherState = state;
  }

  public getGameStartOpenMonitorLog(): boolean {
    return this.launcherSettings.general.gameStartOpenMonitorLog;
  }

  public setGameStartOpenMonitorLog(state: boolean): void {
    this.launcherSettings.general.gameStartOpenMonitorLog = state;
  }

  public getRamChecked(serverName: string): boolean {
    return this.dataMapping(this.launcherSettings.java, "ramChecked").get(serverName);
  }

  public setRamChecked(serverName: string, checked: boolean): void {
    this.dataSetFor(serverName, "ramChecked", checked);
  }

  public getJavaPathChecked(serverName: string): boolean {
    return this.dataMapping(this.launcherSettings.java, "javaPathChecked").get(serverName);
  }

  public setJavaPathChecked(serverName: string, checked: boolean): void {
    this.dataSetFor(serverName, "javaPathChecked", checked);
  }

  public getJavaParameterChecked(serverName: string): boolean {
    return this.dataMapping(this.launcherSettings.java, "javaParameterChecked").get(serverName);
  }

  public setJavaParameterChecked(serverName: string, checked: boolean): void {
    this.dataSetFor(serverName, "javaParameterChecked", checked);
  }

  public getMinecraftAccessToken() {
    return this.profileData.minecraftAuth.accessToken;
  }

  public setMinecraftAccessToken(accessToken: string) {
    this.profileData.minecraftAuth.accessToken = accessToken;
  }

  public getMinecraftClientToken() {
    return this.profileData.minecraftAuth.clientToken;
  }

  public setMinecraftClientToken(clientToken: string) {
    this.profileData.minecraftAuth.clientToken = clientToken;
  }

  public getUserUsername() {
    return this.profileData.user.username;
  }

  public setUserUsername(username: string) {
    this.profileData.user.username = username;
  }

  public getUserId() {
    return this.profileData.user.id;
  }

  public setUserId(id: string) {
    this.profileData.user.id = id;
  }

  public getPlayerName() {
    return this.profileData.player.name;
  }

  public setPlayerName(name: string) {
    this.profileData.player.name = name;
  }

  public getPlayerUuid() {
    return this.profileData.player.uuid;
  }

  public setPlayerUuid(uuid: string) {
    this.profileData.player.uuid = uuid;
  }

  public getRememberStatus() {
    return this.profileData.rememberStatus;
  }

  public setRememberStatus(status: boolean) {
    this.profileData.rememberStatus = status;
  }

  public getLanguage() {
    return this.launcherSettings.language;
  }

  public setLanguage(lang: string) {
    this.launcherSettings.language = lang;
  }

  public getJavaPath(serverName: string): string {
    return this.dataMapping(this.launcherSettings.java, "javaPath").get(serverName);
  }

  public setJavaPath(serverName: string, path: string) {
    this.dataSetFor(serverName, "javaPath", path);
  }

  public getRamSizeMax(serverName: string): number {
    return this.dataMapping(this.launcherSettings.java, "ramSizeMax").get(serverName);
  }

  public setRamSizeMax(serverName: string, size: number) {
    this.dataSetFor(serverName, "ramSizeMax", size);
  }

  public getRamSizeMin(serverName: string) {
    return this.dataMapping(this.launcherSettings.java, "ramSizeMin").get(serverName);
  }

  public setRamSizeMin(serverName: string, size: number) {
    this.dataSetFor(serverName, "ramSizeMin", size);
  }

  public getJavaParameter(serverName: string): string {
    return this.dataMapping(this.launcherSettings.java, "javaParameter").get(serverName);
  }

  public setJavaParameter(serverName: string, parameter: string) {
    this.dataSetFor(serverName, "javaParameter", parameter);
  }

  public getIsBuiltInJavaVM(serverName: string) {
    return this.dataMapping(this.launcherSettings.java, "isBuiltInJavaVM").get(serverName);
  }

  public setIsBuiltInJavaVM(serverName: string, isBuiltInJavaVM: boolean) {
    this.dataSetFor(serverName, "isBuiltInJavaVM", isBuiltInJavaVM);
  }

  public getDisplayPosition() {
    return this.launcherSettings.displayPosition;
  }

  public setDisplayPosition(position: number) {
    this.launcherSettings.displayPosition = position;
  }

  public getLauncherKeepOpen() {
    return this.launcherSettings.launcherKeepOpen
  }

  public setLauncherKeepOpen(status: boolean) {
    this.launcherSettings.launcherKeepOpen = status;
  }

  public getSelectedServerStart() {
    return this.launcherSettings.selectedServerStart;
  }

  public setSelectedServerStart(selected: string) {
    this.launcherSettings.selectedServerStart = selected;
  }

  public getMicrosoftAccessToken(userId?: string) {
    // return this.profileData.microsoftAuth.accessToken;
    return keytar.getPassword("net.mckismetlab.mkllauncher.accesstoken", "unique");
  }

  public setMicrosoftAccessToken(accessToken: string, userId?: string) {
    // this.profileData.microsoftAuth.accessToken = accessToken;
    if(accessToken.length <= 0) {
      keytar.deletePassword("net.mckismetlab.mkllauncher.accesstoken", "unique");
    } else {
      keytar.setPassword("net.mckismetlab.mkllauncher.accesstoken", "unique", accessToken);
    }
  }

  public getMicrosoftRefreshToken(userId?: string) {
    // return this.profileData.microsoftAuth.refreshToken;
    return keytar.getPassword("net.mckismetlab.mkllauncher.refreshtoken", "unique");
  }

  public setMicrosoftRefreshToken(refreshToken: string, userId?: string) {
    // this.profileData.microsoftAuth.refreshToken = refreshToken;
    if(refreshToken.length <= 0) {
      keytar.deletePassword("net.mckismetlab.mkllauncher.refreshtoken", "unique");
    } else {
      keytar.setPassword("net.mckismetlab.mkllauncher.refreshtoken", "unique", refreshToken);
    }
  }

  public getMicrosoftExpiresAt() {
    return this.profileData.microsoftAuth.expiresAt;
  }

  public setMicrosoftExpiresAt(expiresAt: any) {
    this.profileData.microsoftAuth.expiresAt = expiresAt;
  }

  public getAuthType() {
    return this.profileData.authType;
  }

  public setAuthType(authType: "microsoft" | "mojang") {
    this.profileData.authType = authType;
  }

  public getMicrosoftMcAccountToken(): string {
    return this.profileData.microsoftAuth.mcAccountToken;
  }

  public setMicrosoftMcAccountToken(mcAccountToken: string): void {
    this.profileData.microsoftAuth.mcAccountToken = mcAccountToken;
  }
}
