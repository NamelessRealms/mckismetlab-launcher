interface IUser {
    username: string;
    id: string;
  }
  
  interface IPlayer {
    name: string;
    uuid: string;
  }
  
  export interface IProfileData {
    microsoftAuth: {
      accessToken: string;
      refreshToken: string;
      expiresAt: any;
    };
    authType: "microsoft" | "mojang";
    accessToken: string;
    clientToken: string;
    user: IUser;
    player: IPlayer;
    rememberStatus: boolean,
    date: string;
  }
  