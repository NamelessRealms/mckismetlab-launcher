import { IProfileData } from "../../interfaces/IProfileData";
import { IJava, ILauncherSettings } from "../../interfaces/ILauncherSettings";
import GlobalPath from "./GlobalPath";
import * as path from "path";
import * as fs from "fs-extra";
export default class IoFile {

  private commonDirPath = path.join(GlobalPath.getCommonDirPath());
  private profileDataPath = path.join(this.commonDirPath, "profileData.json");
  private launcherSettingsPath = path.join(this.commonDirPath, "launcherSettings.json");

  private profileData: IProfileData;
  private launcherSettings: ILauncherSettings;;

  public constructor() {

    if (!fs.existsSync(this.commonDirPath)) {
      fs.ensureDirSync(this.commonDirPath);
    }

    if (!fs.existsSync(this.profileDataPath)) {
      fs.writeFileSync(this.profileDataPath, JSON.stringify({
        microsoftAuth: {
          accessToken: "",
          refreshToken: "",
          expiresAt: "",
        },
        authType: "microsoft",
        accessToken: "",
        clientToken: "",
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

    if (!this.profileData.hasOwnProperty("microsoftAuth")) {
      this.profileData.microsoftAuth = {
        accessToken: "",
        refreshToken: "",
        expiresAt: ""
      }
    }

    if (this.profileData.hasOwnProperty("authType")) {
      this.profileData.authType = "microsoft";
    }

    if (!fs.existsSync(this.launcherSettingsPath)) {
      fs.writeFileSync(this.launcherSettingsPath, JSON.stringify({
        language: "zh_tw",
        java: [
          {
            serverName: "mckismetlab-main-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true
          },
          {
            serverName: "mckismetlab-deputy-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true
          },
          {
            serverName: "mckismetlab-test-server",
            javaPath: "",
            ramSizeMax: 2048,
            ramSizeMin: 2048,
            javaParameter: "",
            isBuiltInJavaVM: true
          }
        ],
        displayPosition: 0,
        launcherKeepOpen: true,
        selectedServerStart: "mckismetlab-main-server",
        date: ""
      }, null, 2), "utf-8");
    }

    this.launcherSettings = fs.readJSONSync(this.launcherSettingsPath);

    if(this.profileData === undefined || this.launcherSettings === undefined) {
      throw new Error("profileData and launcherSettings null.");
    }
  }

  public save() {
    const date = new Date().toLocaleString();
    this.profileData.date = date;
    this.launcherSettings.date = date;
    fs.writeFileSync(this.profileDataPath, JSON.stringify(this.profileData, null, 2), "utf-8");
    fs.writeFileSync(this.launcherSettingsPath, JSON.stringify(this.launcherSettings, null, 2), "utf-8");
  }

  private dataMapping(array: Array<IJava>, property: string) {
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

  public getAccessToken() {
    return this.profileData.accessToken;
  }

  public setAccessToken(accessToken: string) {
    this.profileData.accessToken = accessToken;
  }

  public getClientToken() {
    return this.profileData.clientToken;
  }

  public setClientToken(clientToken: string) {
    this.profileData.clientToken = clientToken;
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

  public getJavaPath() {
    return this.dataMapping(this.launcherSettings.java, "javaPath");
  }

  public setJavaPath(serverName: string, path: string) {
    this.dataSetFor(serverName, "javaPath", path);
  }

  public getRamSizeMax() {
    return this.dataMapping(this.launcherSettings.java, "ramSizeMax");
  }

  public setRamSizeMax(serverName: string, size: number) {
    this.dataSetFor(serverName, "ramSizeMax", size);
  }

  public getRamSizeMin() {
    return this.dataMapping(this.launcherSettings.java, "ramSizeMin");
  }

  public setRamSizeMin(serverName: string, size: number) {
    this.dataSetFor(serverName, "ramSizeMin", size);
  }

  public getJavaParameter() {
    return this.dataMapping(this.launcherSettings.java, "javaParameter");
  }

  public setJavaParameter(serverName: string, parameter: string) {
    this.dataSetFor(serverName, "javaParameter", parameter);
  }

  public getIsBuiltInJavaVM() {
    return this.dataMapping(this.launcherSettings.java, "isBuiltInJavaVM");
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

  public getMicrosoftAccessToken() {
    return this.profileData.microsoftAuth.accessToken;
  }

  public setMicrosoftAccessToken(accessToken: string) {
    this.profileData.microsoftAuth.accessToken = accessToken;
  }

  public getMicrosoftRefreshToken() {
    return this.profileData.microsoftAuth.refreshToken;
  }

  public setMicrosoftRefreshToken(refreshToken: string) {
    this.profileData.microsoftAuth.refreshToken = refreshToken;
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
}
