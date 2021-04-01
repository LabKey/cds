const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
    plugins: (filename) => ([
        new MiniCssExtractPlugin({ filename }),
    ]),
}
