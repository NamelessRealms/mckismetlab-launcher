interface IAvailableProfiles {
    id: string;
    name: string;
}

interface ISelectedProfile {
    id: string;
    name: string;
}

interface IUser {
    id: string;
    username: string;
}

interface IData {
    accessToken: string;
    availableProfiles: Array<IAvailableProfiles>
    clientToken: string;
    selectedProfile: ISelectedProfile;
    user: IUser;
}

export default interface IMojangAccountAuth {
    clientToken: string;
    data: IData;
}