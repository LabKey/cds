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
                    case 'dll':
                    case 'exe':
                    case 'html':
                    case 'iqy':
                    case 'prg':
                    case 'wiki':
                    case 'xml':
                        return 'fa fa-file-code-o';
                    case 'tsv':
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
                    case 'rtf':
                        return 'Word Document';
                }
            }
        }
        return '';
    }
});