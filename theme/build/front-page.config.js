const path = require('path');
const styleConfig = require('./shared');

module.exports = {
    ...styleConfig,
    entry: path.resolve(__dirname, '../front-page/application.scss'),
    plugins: styleConfig.plugins('application.css'),
};
