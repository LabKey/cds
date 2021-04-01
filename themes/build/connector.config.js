const path = require('path');
const styleConfig = require('./shared');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../connector/theme.scss'),
    output: {
        path: path.resolve(__dirname, '../../webapp/production/Connector/resources/'),
        publicPath: './',
        // Note: we have to output a JS file as well because this is Webpack. The build command deletes the file.
        filename: '[name].js'
    },
    plugins: styleConfig.plugins('Connector-all.css'),
};
