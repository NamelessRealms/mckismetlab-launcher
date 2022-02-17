import { ProgressTypeEnum } from "../../enums/ProgressTypeEnum";
import * as event from "events";
import { ProcessStop } from "./ProcessStop";

export default class ProgressManager {

    private static _map = new Map<string, ProgressManager>();

    private _eventEmitter;
    private _percentageData: { bigPercentage: number; percentage: number; progressBarText: string; } | null = null;

    private _serverId: string;
    constructor(eventEmitter: event.EventEmitter, serverId: string) {
        this._eventEmitter = eventEmitter;
        this._serverId = serverId;
    }

    public static getProgressManagerInstance(serverId: string, eventEmitter: event.EventEmitter): ProgressManager {
        const instance = ProgressManager._map.get(serverId);
        if (instance === undefined) {
            const progressManager = new ProgressManager(eventEmitter, serverId);
            ProgressManager._map.set(serverId, progressManager);
            return progressManager;
        } else {
            return instance;
        }
    }

    public static isProgressManager(serverId: string): boolean {
        return ProgressManager._map.get(serverId) !== undefined;
    }

    public event(): event.EventEmitter {
        return this._eventEmitter;
    }

    public static defaultProgressManager(serverId: string): void {
        ProgressManager._map.delete(serverId);
    }

    public set(type: ProgressTypeEnum, min: number, max?: number): void {

        const bigPercentageData = ProgressManager.getBigPercentage(type);
        // const previousPercentage = bigPercentageData.previousPercentage;
        const bigPercentage = bigPercentageData.bigPercentage;
        const nextPercentage = bigPercentageData.nextPercentage;

        let bigValue = 0;
        let percentageValue = 0;

        if (max === undefined) {
            bigValue = Math.round(min * (nextPercentage - bigPercentage));
            percentageValue = Math.round(min * 100);
        } else {
            bigValue = type === ProgressTypeEnum.gameStart ? 100 : Math.round((min / max) * (nextPercentage - bigPercentage));
            percentageValue = Math.round((min / max) * 100);
        }

        bigValue = bigValue + bigPercentage;

        // stop 
        // bigValue = 100
        // percentageValue = 100
        if(!ProcessStop.getProcessStop(this._serverId)) {
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

    public getPercentageData(): { bigPercentage: number; percentage: number; progressBarText: string; } | null {
        return this._percentageData;
    }

    private _sendProgressBarEvent(bigPercentage: number, percentage: number, progressBarText: string): void {
        this._percentageData = { bigPercentage: bigPercentage, percentage: percentage, progressBarText: progressBarText };
        this._eventEmitter.emit("progressBarChange", { bigPercentage: bigPercentage, percentage: percentage, progressBarText: progressBarText });
    }

    public static getBigPercentage(type: ProgressTypeEnum): { previousPercentage: number, bigPercentage: number, nextPercentage: number } {

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

    private static getBigPercentageArray() {
        return [
            {
                typeEnum: ProgressTypeEnum.initJsonData,
                percentage: 5
            },
            {
                typeEnum: ProgressTypeEnum.downloadParseModpackData,
                percentage: 10
            },
            {
                typeEnum: ProgressTypeEnum.processModulesData,
                percentage: 20
            },
            {
                typeEnum: ProgressTypeEnum.getModpackModulesInfo,
                percentage: 30
            },
            {
                typeEnum: ProgressTypeEnum.getModLoaderData,
                percentage: 40
            },
            {
                typeEnum: ProgressTypeEnum.getMojangManifestData,
                percentage: 45
            },
            {
                typeEnum: ProgressTypeEnum.getMojangAssetsObjectData,
                percentage: 47
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadJava,
                percentage: 49
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadGameClientJar,
                percentage: 52
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadMinecraftAssets,
                percentage: 54
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadLibraries,
                percentage: 70
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadModpackFiles,
                percentage: 75
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadModules,
                percentage: 80
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadInstallProfileModLoader,
                percentage: 85
            },
            {
                typeEnum: ProgressTypeEnum.validateInstallModLoader,
                percentage: 90
            },
            {
                typeEnum: ProgressTypeEnum.validateDownloadModLoader,
                percentage: 95
            },
            {
                typeEnum: ProgressTypeEnum.gameStart,
                percentage: 100
            }
        ]
    }
}