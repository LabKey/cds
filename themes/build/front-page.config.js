const path = require('path');
const styleConfig = require('./shared');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../front-page/application.scss'),
    output: {
        path: path.resolve(__dirname, '../../webapp/frontPage/css/'),
        publicPath: './',
        // Note: we have to output a JS file as well because this is Webpack. The build command deletes the file.
        filename: '[name].js'
    },
    plugins: styleConfig.plugins('application.css'),
};
