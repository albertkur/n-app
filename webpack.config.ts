const path = require("path");
const autoprefixer = require("autoprefixer");
const htmlWebpackPlugin = require("html-webpack-plugin");
const cleanWebpackPlugin = require("clean-webpack-plugin");
// const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
import { ConfigurationManager } from "@nivinjoseph/n-config";

const env = ConfigurationManager.getConfig<string>("env");
console.log("WEBPACK ENV", env);

const isDev = env === "dev";

module.exports = {
    mode: isDev ? "development" : "production",
    target: "web",
    entry: ["./test-app/client/app.js"],
    output: {
        filename: "client.bundle.js",
        path: path.resolve(__dirname, "test-app/client/dist"),
        publicPath: "/"
    },
    devtool: isDev ? "inline-source-map" : "source-map",
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
                uglifyOptions: {
                    keep_classnames: true
                }
            })
        ]
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "postcss-loader", // postcss
                options: {
                    plugins: () => [
                        require("postcss-flexbugs-fixes"),
                        autoprefixer({
                            browsers: [
                                ">1%",
                                "not ie < 9"
                            ],
                            flexbox: "no-2009"
                        })
                    ]
                }
            }, {
                loader: "sass-loader" // compiles Sass to CSS -> depends on node-sass
            }]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: ["file-loader"]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: ["file-loader"]
        },
        {
            test: /\.(html)$/,
            use: ["html-loader"]
        }]
    },
    plugins: [
        new cleanWebpackPlugin(["test-app/client/dist"]),
        new htmlWebpackPlugin({
            template: "test-app/controllers/index-view.html",
            hash: true,
            favicon: "test-app/client/images/favicon.png",
        })
    ]
};