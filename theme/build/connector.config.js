const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const styleConfig = require('./shared');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../connector/theme.scss'),
    plugins: [
        ...styleConfig.plugins('Connector-all.css'),
        new CopyPlugin({
            patterns: [
                {
                    from: "images/**/*",
                    context: path.resolve(__dirname, '../../webapp/production/Connector/resources/'),
                }
            ]
        }),
    ],
};
