export enum ProgressTypeEnum {
    initJsonData = "初始化獲取索引...",
    getModLoaderData = "獲取ModLoader資料...",
    downloadParseModpackData = "下載並解析模組包...",
    getModpackModulesInfo = "獲取模組包模組資料...",
    processModulesData = "處理模組...",
    getMojangManifestData = "獲取Mojang遊戲資料(1/2)...",
    getMojangAssetsObjectData = "獲取Mojang遊戲資料(2/2)...",
    validateDownloadJava = "下載並驗證Java虛擬機...",
    validateDownloadGameClientJar = "下載並驗證遊戲客戶端Jar...",
    validateDownloadModules = "下載並驗證模組...",
    validateDownloadLibraries = "下載並驗證依賴庫...",
    validateDownloadMinecraftAssets = "下載並驗證資源索引...",
    validateDownloadInstallProfileModLoader = "下載並驗證ModLoader安裝器依賴庫...",
    validateInstallModLoader = "安裝並驗證ModLoader...",
    validateDownloadModLoader = "下載並驗證ModLoader依賴庫...",
    gameStart = "遊戲準備啟動..."
}