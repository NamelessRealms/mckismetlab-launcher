export default class Utils {

    public static getOSType(): "osx" | "windows" | "linux" | "unknown" {
        switch (process.platform) {
            case "darwin":
                return "osx";
            case "win32":
                return "windows";
            case "linux":
                return "linux";
            default:
                return "unknown";
        }
    }
}