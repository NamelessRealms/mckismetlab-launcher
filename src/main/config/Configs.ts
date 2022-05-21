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

    public static get webhooksErrorUrl(): string {
        return "https://discord.com/api/webhooks/849646440280096828/hejcjdAiUzLf8f_UobeTZf0_PpSVfJPB3HrdqWc5akZwQ7aNgWYvmgSPXCAQB6uCt6pu";
    }
}