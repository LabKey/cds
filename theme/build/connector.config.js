const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const styleConfig = require('./shared');

const imagesDir = path.resolve(__dirname, '../../webapp/production/Connector/resources/images/');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../connector/theme.scss'),
    plugins: [
        ...styleConfig.plugins('Connector-all.css'),
        new CopyPlugin({
            patterns: [
                {
                    from: "../../webapp/production/Connector/resources/images/**/*",
                    to({ context, absoluteFilename }) {
                        const imageDir = absoluteFilename.replace(imagesDir, '');
                        return `images${imageDir}`;
                    },
                }
            ]
        }),
    ],
};
