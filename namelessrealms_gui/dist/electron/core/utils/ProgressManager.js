"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProgressTypeEnum_1 = require("../../enums/ProgressTypeEnum");
const ProcessStop_1 = require("./ProcessStop");
class ProgressManager {
    constructor(eventEmitter, serverId) {
        this._percentageData = null;
        this._eventEmitter = eventEmitter;
        this._serverId = serverId;
    }
    static getProgressManagerInstance(serverId, eventEmitter) {
        const instance = ProgressManager._map.get(serverId);
        if (instance === undefined) {
            const progressManager = new ProgressManager(eventEmitter, serverId);
            ProgressManager._map.set(serverId, progressManager);
            return progressManager;
        }
        else {
            return instance;
        }
    }
    static isProgressManager(serverId) {
        return ProgressManager._map.get(serverId) !== undefined;
    }
    event() {
        return this._eventEmitter;
    }
    static defaultProgressManager(serverId) {
        ProgressManager._map.delete(serverId);
    }
    set(type, min, max) {
        const bigPercentageData = ProgressManager.getBigPercentage(type);
        // const previousPercentage = bigPercentageData.previousPercentage;
        const bigPercentage = bigPercentageData.bigPercentage;
        const nextPercentage = bigPercentageData.nextPercentage;
        let bigValue = 0;
        let percentageValue = 0;
        if (max === undefined) {
            bigValue = Math.round(min * (nextPercentage - bigPercentage));
            percentageValue = Math.round(min * 100);
        }
        else {
            bigValue = type === ProgressTypeEnum_1.ProgressTypeEnum.gameStart ? 100 : Math.round((min / max) * (nextPercentage - bigPercentage));
            percentageValue = Math.round((min / max) * 100);
        }
        bigValue = bigValue + bigPercentage;
        // stop 
        // bigValue = 100
        // percentageValue = 100
        if (!ProcessStop_1.ProcessStop.getProcessStop(this._serverId)) {
            bigValue = 100;
            percentageValue = 100;
        }
        // console.log(type);
        // console.log(bigPercentage);
        // console.log(nextPercentage);
        // console.log(nextPercentage - bigPercentage);
        // console.log(min);
        // console.log(max);
        // console.log(`bigValue: ${bigValue}`);
        // console.log(`percentage: ${percentageValue}`);
        this._sendProgressBarEvent(bigValue, percentageValue, type);
    }
    getPercentageData() {
        return this._percentageData;
    }
    _sendProgressBarEvent(bigPercentage, percentage, progressBarText) {
        this._percentageData = { bigPercentage: bigPercentage, percentage: percentage, progressBarText: progressBarText };
        this._eventEmitter.emit("progressBarChange", { bigPercentage: bigPercentage, percentage: percentage, progressBarText: progressBarText });
    }
    static getBigPercentage(type) {
        let previousPercentage = 0;
        let bigPercentage = 0;
        let nextPercentage = 0;
        const bigPercentageArray = ProgressManager.getBigPercentageArray();
        for (let i = 0; i < bigPercentageArray.length; i++) {
            if (type === bigPercentageArray[i].typeEnum) {
                if (i > 0) {
                    previousPercentage = bigPercentageArray[i - 1].percentage;
                }
                if (i < bigPercentageArray.length - 1) {
                    nextPercentage = bigPercentageArray[i + 1].percentage;
                }
                bigPercentage = bigPercentageArray[i].percentage;
                break;
            }
        }
        return {
            previousPercentage: previousPercentage,
            bigPercentage: bigPercentage,
            nextPercentage: nextPercentage
        };
    }
    static getBigPercentageArray() {
        return [
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.initJsonData,
                percentage: 5
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.downloadParseModpackData,
                percentage: 10
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.processModulesData,
                percentage: 20
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.getModpackModulesInfo,
                percentage: 30
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.getModLoaderData,
                percentage: 40
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.getMojangManifestData,
                percentage: 45
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.getMojangAssetsObjectData,
                percentage: 47
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadJava,
                percentage: 49
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadGameClientJar,
                percentage: 52
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadMinecraftAssets,
                percentage: 54
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadLibraries,
                percentage: 70
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModpackFiles,
                percentage: 75
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModules,
                percentage: 80
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadInstallProfileModLoader,
                percentage: 85
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateInstallModLoader,
                percentage: 90
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.validateDownloadModLoader,
                percentage: 95
            },
            {
                typeEnum: ProgressTypeEnum_1.ProgressTypeEnum.gameStart,
                percentage: 100
            }
        ];
    }
}
exports.default = ProgressManager;
ProgressManager._map = new Map();
//# sourceMappingURL=ProgressManager.js.map