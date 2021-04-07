const path = require('path');
const styleConfig = require('./shared');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../connector/theme.scss'),
    plugins: styleConfig.plugins('Connector-all.css'),
};
