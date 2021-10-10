const builder = require("electron-builder");
const fs = require("fs-extra");
const path = require("path");
const Platform = builder.Platform;

let platform = process.argv[3];
let publish = process.argv[5];

const files = [
    "**/*",
    "!**/*.ts",
    "!LICENSE.md",
    "!package.json",
    "!src/",
    "!tsconfig.json",
    "!build.js",
    "!README.md",
    "!.github",
    "!install-gif"
]

if (fs.existsSync(path.join(__dirname, "release"))) {
    fs.removeSync(path.join(__dirname, "release"));
}

builder.build({
    targets: Platform[platform].createTarget(),
    publish: publish,
    config: {
        appId: "net.mckismetlab.mckismetlablauncher",
        productName: "MklLauncher",
        copyright: "Copyright © 2019 - 2021 無名伺服器 mcKismetLab. 版權所有 All rights reserved",
        compression: "maximum",
        directories: {
            output: "release"
        },
        win: {
            target: "squirrel",
            // icon: "dist/assets/icons/logo.ico"
        },
        mac: {
            target: {
                "target": "dir",
                "arch": "arm64"
            }
        },
        squirrelWindows: {
            iconUrl: "https://github.com/QuasiMkl/mckismetlab-launcher/blob/master/src/assets/icons/logo.ico?raw=true",
            // loadingGif: "install-gif/install-logo.gif"
        },
        files: files,
        publish: [
            {
                provider: "github",
                owner: "QuasiMkl",
                repo: "mckismetlab-launcher",
                releaseType: "draft",
                token: process.env.GITHUB_TOKEN
            }
        ]
    }
}).then(() => {

    console.log("exe建構完成！");

}).catch((error) => {

    console.log("exe建構期間出錯！", error);

});
