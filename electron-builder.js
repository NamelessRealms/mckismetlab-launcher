const builder = require("electron-builder");
const fs = require("fs-extra");
const path = require("path");
const Platform = builder.Platform;

// let platform = process.argv[3] === "mwl" ?  ["MAC", "WINDOWS"] : platform;
let platform = process.argv[3];
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

let buildObject = {
    publish: publish,
    config: {
        appId: "net.mckismetlab.mckismetlablauncher",
        productName: "MklLauncher",
        artifactName: '${productName}-setup-${version}.${ext}',
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
                "target": "dmg",
                "arch": [
                    "arm64",
                    "x64"
                ]
            },
            category: "public.app-category.games",
            artifactName: '${productName}-setup-${version}-${arch}.${ext}'
        },
        squirrelWindows: {
            iconUrl: "https://github.com/mckismetlab/mckismetlab-launcher/blob/react-launcher/public/logo.ico?raw=true",
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
}

if(platform !== "all") {
    buildObject = Object.assign(buildObject, {
        targets: Platform[platform].createTarget()
    });
}

builder.build(buildObject);
