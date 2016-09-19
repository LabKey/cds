Ext.define('Connector.utility.FileExtension', {

    singleton: true,

    fileDisplayType : function(fileName) {
        if (fileName) {
            var tokens = fileName.split(".");
            if (tokens.length > 1) {
                var extension = tokens.pop();
                switch (extension) {
                    case 'gz':
                    case 'jar':
                    case 'tar':
                    case 'tgz':
                    case 'xar':
                    case 'zip':
                        return 'Archive';
                    case 'tsv':
                        return 'TSV';
                    case 'xls':
                    case 'xlsb':
                    case 'xlsm':
                    case 'xlsx':
                    case 'xltm':
                    case 'xltx':
                        return 'Excel Document';
                    case 'pdf':
                        return 'PDF';
                    case 'potm':
                    case 'potx':
                    case 'ppsm':
                    case 'ppsx':
                    case 'ppt':
                    case 'pptm':
                    case 'pptx':
                        return 'Powerpoint Presentation';
                    case 'log':
                    case 'text':
                    case 'txt':
                        return 'Text File';
                    case 'doc':
                    case 'docm':
                    case 'docx':
                    case 'dotm':
                    case 'dotx':
                        return 'Word Document';
                    case 'rtf':
                        return 'Rich Text Document'
                }
            }
        }
        return '';
    }
});