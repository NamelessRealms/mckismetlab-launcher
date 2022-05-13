const builder = require("electron-builder");
const fs = require("fs-extra");
const path = require("path");
const Platform = builder.Platform;

let platform = process.argv[3] === mwl ?  ["MAC", "WINDOWS"] : platform;
let publish = process.argv[5];

const files = [
    "**/*",
    "!**/*.ts",
    "!package.json",
    "!src/",
    "!tsconfig.json",
    "!build.js",
    "!electron-builder.js",
    "!README.md",
    "!.github",
    "!install-gif",
    "!.DS_Store",
    "!webpack.electron.config.js",
    "!webpack.renderer.base.config.js",
    "!webpack.renderer.dev.config.js",
    "!webpack.renderer.prod.config.js",
    "!yarn.lock",
    "!crowdin.yml",
    "!.gitignore",
    "!.vscode/",
    "!.git/"
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
        copyright: "Copyright © 2019 - 2022 mcKismetLab. 版權所有 All rights reserved",
        compression: "maximum",
        directories: {
            output: "release"
        },
        icon: "public/logo.png",
        win: {
            target: {
                target: "squirrel",
                arch: [
                    "x64"
                ]
            }
        },
        mac: {
            target: {
                "target": "dir",
                "arch": [
                    "arm64",
                    "x64"
                ]
            }
        },
        squirrelWindows: {
            iconUrl: "https://github.com/QuasiMkl/mckismetlab-launcher/blob/react-launcher/public/logo.ico?raw=true",
            loadingGif: "public/install-logo.gif"
        },
        files: files,
        publish: [
            {
                provider: "github",
                owner: "mcKismetLab",
                repo: "mckismetlab-launcher",
                releaseType: "draft",
                token: process.env.GITHUB_TOKEN
            }
        ]
    }
}).then(() => {
    console.log("建構完成！");
}).catch((error) => {
    console.log("建構期間出錯！", error);
});
