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
    entry: path.resolve(__dirname, './theme/theme.scss'),
    output: {
        // TODO: should probably output to resources/something/gen
        path: path.resolve(__dirname, './dist/'),
        // path: path.resolve(__dirname, '../resources/web.cds/gen/'),
        publicPath: './',
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
                            importLoaders: 1,
                            // TODO: We need to either enable this, and move the images to the right directory
                            //  or keep this disabled and make sure the images are in the correct directory at runtime.
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
        new MiniCssExtractPlugin({filename: 'Connector-all.css'}),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
}
