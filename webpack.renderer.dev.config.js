const { merge } = require("webpack-merge");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const baseConfig = require("./webpack.renderer.base.config");

module.exports = merge(baseConfig, {
    mode: "development",
    devServer: {
        historyApiFallback: true,
        compress: true,
        port: 4000,
        stats: "errors-only"
    },
    plugins: [
        // new BundleAnalyzerPlugin({
        //     analyzerMode: "server",
        //     analyzerHost: "127.0.0.1",
        //     analyzerPort: 8866,
        //     openAnalyzer: false,
        //     logLevel: "info"
        // })
    ]
});
