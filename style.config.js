const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname),
    mode: 'production',
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
            // results in a smaller file size than the default minifier (Terser)
            new CssMinimizerPlugin(),
        ],
    },
    entry: path.resolve(__dirname, './themes/connector/theme.scss'),
    output: {
        path: path.resolve(__dirname, './webapp/production/Connector/resources/'),
        publicPath: './',
        // Note: we have to output a JS file as well because this is Webpack. The build command deletes the file.
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            // Don't resolve URLs, the ext-01/02.css files reference a ton of images that we do not
                            // have.
                            url: false
                        }
                    },
                    'resolve-url-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                // More information here https://webpack.js.org/guides/asset-modules/
                type: "asset",
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'Connector-all.css',
        }),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
}
