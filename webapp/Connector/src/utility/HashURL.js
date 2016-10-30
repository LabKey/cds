/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.utility.HashURL', {

    singleton: true,

    getUpdatedHashParamStr: function(name, value) {
        var paramsMap = this.getHashParams();
        paramsMap[name] = value;
        var newParamsStr = this.buildHashParamsStr(paramsMap);
        var parts = location.hash.split('?');
        return parts[0] + newParamsStr;
    },

    getBatchUpdatedHashParamStr: function(params) {
        var paramsMap = this.getHashParams();
        Ext.iterate(params, function(key, value){
            paramsMap[key] = value;
        });
        var newParamsStr = this.buildHashParamsStr(paramsMap);
        var parts = location.hash.split('?');
        return parts[0] + newParamsStr;
    },

    getHashParams: function() {
        var hashStr = location.hash;
        var paramsMap = {};
        if (hashStr.indexOf('?') != -1) {
            var parts = hashStr.split('?');
            var paramParts = parts[1].split('&');
            Ext.each(paramParts, function(pairStr){
                var pair = pairStr.split('=');
                paramsMap[pair[0]] = pair[1];
            });
        }
        return paramsMap;
    },

    buildHashParamsStr: function(paramsMap) {
        var paramsStr = '?', hasParam = false;
        Ext.iterate(paramsMap, function(key, value) {
            if (value) {
                paramsStr += hasParam ? '&' : '';
                paramsStr += key + '=' + value;
                hasParam = true;
            }
        });
        return hasParam ? paramsStr : '';
    },

    getHashParam: function(name) {
        var params = this.getHashParams();
        return params[name];
    },

    getHashParamValueArray: function(name) {
        var params = this.getHashParams();
        var valueStr = params[name];

        if (Ext4.isString(valueStr)) {
            return valueStr.split(';')
        }
        return [];
    },


    delimitValues : function(valueArray) {
        var value = '', sep = '';
        for (var s=0; s < valueArray.length; s++) {
            value += sep + valueArray[s];
            sep = ';';
        }
        return value;
    }

});