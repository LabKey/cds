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
    output: {
        path: path.resolve(__dirname, '../../resources/web/cds/gen/'),
        publicPath: './',
        // Note: we have to output a JS file as well because this is Webpack. The build command deletes the file.
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                // CDS scss
                test: /.s?css$/,
                exclude: [/node_modules/],
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
                    // Don't use resolve-url-loader as it alters relative URLs
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        }
                    }
                ],
            },
            {
                // node_modules scss
                test: /.s?css$/,
                include: [/node_modules/],
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            // "sourceMap" must be set to true when resolve-url-loader is used downstream
                            sourceMap: true,
                        }
                    }
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                // More information here https://webpack.js.org/guides/asset-modules/
                type: 'asset',
            },
        ],
    },
    plugins: (filename) => ([
        new MiniCssExtractPlugin({ filename }),
    ]),
}
