export default class Config {

    public static get discordRpcClientId(): string {
        return "932980068031012945";
    }
    public static get assetsDownloadLimit(): number {
        return 5;
    }

    public static get apiUrl(): string {
        return process.env.NODE_ENV !== "development" ? "https://mckismetlab.net/api" : `http://localhost:8030`;
    }
}