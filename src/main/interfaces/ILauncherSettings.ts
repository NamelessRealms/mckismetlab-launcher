export interface IJava {
    [inName: string]: string | boolean | number;
    serverName: string;
    javaPath: string;
    ramSizeMax: number;
    ramSizeMin: number;
    javaParameter: string;
    isBuiltInJavaVM: boolean;
    ramChecked: boolean;
    javaPathChecked: boolean;
    javaParameterChecked: boolean;
  }
  
  export interface ILauncherSettings {
    language: string;
    java: IJava[];
    displayPosition: number;
    launcherKeepOpen: boolean;
    selectedServerStart: string;
    general: {
      openGameKeepLauncherState: boolean;
      gameStartOpenMonitorLog: boolean;
    }
    date: string;
  }
  