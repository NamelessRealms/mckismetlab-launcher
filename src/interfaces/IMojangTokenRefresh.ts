export default interface IMojangTokenRefresh {
    clientToken: string;
    accessToken: string;
    selectedProfile: ISelectedProfile;
}

interface ISelectedProfile {
    name: string;
    id: string;
}

