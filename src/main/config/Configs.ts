export default class Config {

    public static get assetsDownloadLimit(): number {
        return 5;
    }
    public static get updateServerUrl(): string {
        return "http://mckismetlab.net:56100";
    }

    public static get apiUrl(): string {
        // return "http://220.134.105.30:8030";
        return "http://220.134.105.30:8030";
    }

    public static get launcherAssetsUrl(): string {
        return "http://220.134.105.30:8030/launcher/assets";
    }

    public static get serverPageUrl(): string {
        return "http://220.134.105.30:8030/launcher/page";
    }

}