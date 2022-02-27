import LauncherStore from "./core/io/LauncherStore";

export default class CommonPreload {

    private _electron: any;
    private _launcherStore: LauncherStore;

    constructor(electron: any, launcherStore?: LauncherStore) {
        this._electron = electron;
        this._launcherStore = launcherStore !== undefined ? launcherStore : new LauncherStore();
    }

    public init() {
        this._electron.contextBridge.exposeInMainWorld("commonElectronApi", {
            io: {
                language: {
                        get: () => this._launcherStore.getLanguage(),
                }
            }
        });
    }
}