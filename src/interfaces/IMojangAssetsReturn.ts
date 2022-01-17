import IAssetsObjectsReturn from "./IAssetsObjectsReturn";
import IGameLibraries from "./IGameLibraries";
import IMojangClientReturn from "./IMojangClientReturn";
import IParsingArgumentReturn from "./IParsingArgumentReturn";

export default interface IMojangAssetsReturn {
    assetsObjects: IAssetsObjectsReturn,
    libraries: Array<IGameLibraries>;
    client: IMojangClientReturn;
    mainClass: string;
    arguments: IParsingArgumentReturn;
    versionType: string;
}