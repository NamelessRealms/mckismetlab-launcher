const path = require("path");

const outputPath = path.resolve(__dirname, "dist/main");

module.exports = [
    {
        target: "electron-main",
        entry: "./src/main/main.ts",
        output: {
            path: outputPath,
            filename: "main.js",
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-typescript"
                            ]
                        }
                    }
                }
            ]
        },
        node: {
            __dirname: false,
            __filename: false
        }
    },
    {
        target: "electron-preload",
        entry: "./src/main/preload.ts",
        output: {
            path: outputPath,
            filename: "preload.js",
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        useBuiltIns: "usage",
                                        corejs: 3
                                    }
                                ],
                                "@babel/preset-typescript"
                            ]
                        }
                    }
                }
            ]
        },
        node: {
            __dirname: false,
            __filename: false
        }
    }
];
