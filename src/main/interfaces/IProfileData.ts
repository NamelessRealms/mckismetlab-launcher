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
      mcAccountToken: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
    };
    minecraftAuth: {
      accessToken: string;
      clientToken: string;
    };
    authType: "microsoft" | "mojang";
    user: IUser;
    player: IPlayer;
    rememberStatus: boolean,
    date: string;
  }
  