const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Note: We have to use CssMinimizerPlugin, and set "mode" to development because the minimization automatically done
// by Webpack in production mode is not compatible with the CSS files in the theme/base directory. It fails with a CSS
// syntax error about missing semicolons.
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname),
    mode: 'development', // See note above. Do not set to "production".
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
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
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            // Don't resolve URLs. The images are already in the right place (production/Connector/resources/images)
                            url: false
                        }
                    },
                    'sass-loader',
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
