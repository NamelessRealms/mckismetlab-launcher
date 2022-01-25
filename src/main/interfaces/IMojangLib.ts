export interface IMojangNatives {
    linux: string;
    osx: string;
    windows: string;
    [system: string]: string;
  }
  
  export interface IMojangRules {
    action: string;
    os: {
      name: string
    }
  }
  
  export interface IClassifiers {
    "natives-linux": {
      path: string,
      sha1: string,
      size: number,
      url: string
    },
    "natives-osx": {
      path: string,
      sha1: string,
      size: number,
      url: string
    },
    "natives-windows": {
      path: string,
      sha1: string,
      size: number,
      url: string
    },
    [system: string]: {
      path: string,
      sha1: string,
      size: number,
      url: string
    }
  }
  
  export default interface IMojangLib {
    downloads: {
      artifact: {
        path: string,
        sha1: string,
        size: number,
        url: string
      },
      classifiers: IClassifiers
    },
    name: string;
    natives: IMojangNatives;
    rules: Array<IMojangRules>;
  }
  