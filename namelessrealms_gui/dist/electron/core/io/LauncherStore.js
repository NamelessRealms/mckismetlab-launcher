"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalPath_1 = require("./GlobalPath");
const path = require("path");
const fs = require("fs-extra");
const keytar = require("keytar");
class LauncherStore {
    constructor() {
        this.commonDirPath = path.join(GlobalPath_1.default.getCommonDirPath());
        this.profileDataPath = path.join(this.commonDirPath, "profileData.json");
        this.launcherSettingsPath = path.join(this.commonDirPath, "launcherSettings.json");
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
                language: "zh_TW",
                general: {
                    openGameKeepLauncherState: true,
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
    addJsonData() {
        // microsoft Auth
        if (!this.profileData.hasOwnProperty("microsoftAuth")) {
            this.profileData.microsoftAuth = {
                mcAccountToken: "",
                accessToken: "",
                refreshToken: "",
                expiresAt: ""
            };
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
            };
        }
        // global
        let globalState = true;
        this.launcherSettings.java.forEach((item) => {
            if (item.serverName === "global")
                globalState = false;
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
        // add general openGameKeepLauncherState
        if (!this.launcherSettings.general.hasOwnProperty("openGameKeepLauncherState")) {
            this.launcherSettings.general.openGameKeepLauncherState = true;
        }
    }
    save() {
        const date = new Date().toLocaleString();
        this.profileData.date = date;
        this.launcherSettings.date = date;
        fs.writeFileSync(this.profileDataPath, JSON.stringify(this.profileData, null, 2), "utf-8");
        fs.writeFileSync(this.launcherSettingsPath, JSON.stringify(this.launcherSettings, null, 2), "utf-8");
    }
    dataMapping(array, property) {
        let map = new Map();
        array.forEach((value) => {
            map.set(value.serverName, value[property]);
        });
        return map;
    }
    dataSetFor(serverName, property, data) {
        this.launcherSettings.java.forEach((value) => {
            if (value.serverName === serverName) {
                value[property] = data;
            }
        });
    }
    getOpenGameKeepLauncherState() {
        return this.launcherSettings.general.openGameKeepLauncherState;
    }
    setOpenGameKeepLauncherState(state) {
        this.launcherSettings.general.openGameKeepLauncherState = state;
    }
    getGameStartOpenMonitorLog() {
        return this.launcherSettings.general.gameStartOpenMonitorLog;
    }
    setGameStartOpenMonitorLog(state) {
        this.launcherSettings.general.gameStartOpenMonitorLog = state;
    }
    getRamChecked(serverName) {
        return this.dataMapping(this.launcherSettings.java, "ramChecked").get(serverName);
    }
    setRamChecked(serverName, checked) {
        this.dataSetFor(serverName, "ramChecked", checked);
    }
    getJavaPathChecked(serverName) {
        return this.dataMapping(this.launcherSettings.java, "javaPathChecked").get(serverName);
    }
    setJavaPathChecked(serverName, checked) {
        this.dataSetFor(serverName, "javaPathChecked", checked);
    }
    getJavaParameterChecked(serverName) {
        return this.dataMapping(this.launcherSettings.java, "javaParameterChecked").get(serverName);
    }
    setJavaParameterChecked(serverName, checked) {
        this.dataSetFor(serverName, "javaParameterChecked", checked);
    }
    getMinecraftAccessToken() {
        return this.profileData.minecraftAuth.accessToken;
    }
    setMinecraftAccessToken(accessToken) {
        this.profileData.minecraftAuth.accessToken = accessToken;
    }
    getMinecraftClientToken() {
        return this.profileData.minecraftAuth.clientToken;
    }
    setMinecraftClientToken(clientToken) {
        this.profileData.minecraftAuth.clientToken = clientToken;
    }
    getUserUsername() {
        return this.profileData.user.username;
    }
    setUserUsername(username) {
        this.profileData.user.username = username;
    }
    getUserId() {
        return this.profileData.user.id;
    }
    setUserId(id) {
        this.profileData.user.id = id;
    }
    getPlayerName() {
        return this.profileData.player.name;
    }
    setPlayerName(name) {
        this.profileData.player.name = name;
    }
    getPlayerUuid() {
        return this.profileData.player.uuid;
    }
    setPlayerUuid(uuid) {
        this.profileData.player.uuid = uuid;
    }
    getRememberStatus() {
        return this.profileData.rememberStatus;
    }
    setRememberStatus(status) {
        this.profileData.rememberStatus = status;
    }
    getLanguage() {
        return this.launcherSettings.language;
    }
    setLanguage(lang) {
        this.launcherSettings.language = lang;
    }
    getJavaPath(serverName) {
        return this.dataMapping(this.launcherSettings.java, "javaPath").get(serverName);
    }
    setJavaPath(serverName, path) {
        this.dataSetFor(serverName, "javaPath", path);
    }
    getRamSizeMax(serverName) {
        return this.dataMapping(this.launcherSettings.java, "ramSizeMax").get(serverName);
    }
    setRamSizeMax(serverName, size) {
        this.dataSetFor(serverName, "ramSizeMax", size);
    }
    getRamSizeMin(serverName) {
        return this.dataMapping(this.launcherSettings.java, "ramSizeMin").get(serverName);
    }
    setRamSizeMin(serverName, size) {
        this.dataSetFor(serverName, "ramSizeMin", size);
    }
    getJavaParameter(serverName) {
        return this.dataMapping(this.launcherSettings.java, "javaParameter").get(serverName);
    }
    setJavaParameter(serverName, parameter) {
        this.dataSetFor(serverName, "javaParameter", parameter);
    }
    getIsBuiltInJavaVM(serverName) {
        return this.dataMapping(this.launcherSettings.java, "isBuiltInJavaVM").get(serverName);
    }
    setIsBuiltInJavaVM(serverName, isBuiltInJavaVM) {
        this.dataSetFor(serverName, "isBuiltInJavaVM", isBuiltInJavaVM);
    }
    getDisplayPosition() {
        return this.launcherSettings.displayPosition;
    }
    setDisplayPosition(position) {
        this.launcherSettings.displayPosition = position;
    }
    getLauncherKeepOpen() {
        return this.launcherSettings.launcherKeepOpen;
    }
    setLauncherKeepOpen(status) {
        this.launcherSettings.launcherKeepOpen = status;
    }
    getSelectedServerStart() {
        return this.launcherSettings.selectedServerStart;
    }
    setSelectedServerStart(selected) {
        this.launcherSettings.selectedServerStart = selected;
    }
    getMicrosoftAccessToken(userId) {
        // return this.profileData.microsoftAuth.accessToken;
        return keytar.getPassword("net.mckismetlab.mkllauncher.accesstoken", "unique");
    }
    setMicrosoftAccessToken(accessToken, userId) {
        // this.profileData.microsoftAuth.accessToken = accessToken;
        if (accessToken.length <= 0) {
            keytar.deletePassword("net.mckismetlab.mkllauncher.accesstoken", "unique");
        }
        else {
            keytar.setPassword("net.mckismetlab.mkllauncher.accesstoken", "unique", accessToken);
        }
    }
    getMicrosoftRefreshToken(userId) {
        // return this.profileData.microsoftAuth.refreshToken;
        return keytar.getPassword("net.mckismetlab.mkllauncher.refreshtoken", "unique");
    }
    setMicrosoftRefreshToken(refreshToken, userId) {
        // this.profileData.microsoftAuth.refreshToken = refreshToken;
        if (refreshToken.length <= 0) {
            keytar.deletePassword("net.mckismetlab.mkllauncher.refreshtoken", "unique");
        }
        else {
            keytar.setPassword("net.mckismetlab.mkllauncher.refreshtoken", "unique", refreshToken);
        }
    }
    getMicrosoftExpiresAt() {
        return this.profileData.microsoftAuth.expiresAt;
    }
    setMicrosoftExpiresAt(expiresAt) {
        this.profileData.microsoftAuth.expiresAt = expiresAt;
    }
    getAuthType() {
        return this.profileData.authType;
    }
    setAuthType(authType) {
        this.profileData.authType = authType;
    }
    getMicrosoftMcAccountToken() {
        return this.profileData.microsoftAuth.mcAccountToken;
    }
    setMicrosoftMcAccountToken(mcAccountToken) {
        this.profileData.microsoftAuth.mcAccountToken = mcAccountToken;
    }
}
exports.default = LauncherStore;
//# sourceMappingURL=LauncherStore.js.map