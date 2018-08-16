/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.MabPane', {

    extend: 'Connector.model.InfoPane',

    fields: [
        {name: 'filterConfig'},
        {name: 'title', convert: function(title, record) {
            if (!title && record.raw.label) {
                return record.raw.label;
            }

            return title;
        }}
    ],

    statics: {
        FIELD_CACHE: {}
    },

    configure : function() {
        var all,
            active;

        var loader = function() {
            if (Ext.isArray(all) && Ext.isArray(active)) {
                var raw = [];
                var filterConfig = this.getFilterConfig();

                var fieldKey = filterConfig.fieldName;
                var fieldKeyParts = fieldKey.split('.');
                if (fieldKeyParts.length > 1) {
                    fieldKey = fieldKeyParts[fieldKeyParts.length - 1];
                }

                Ext.Array.forEach(all, function(row) {
                    var name = row[fieldKey];

                    if (name) {
                        raw.push({
                            count: this.isActive(name, fieldKey, active) ? 1 : 0,
                            name: name
                        });
                    }
                }, this);

                var store = this.get('memberStore');
                store.loadRawData(raw);
                store.group(store.groupField, 'DESC');

                this.setReady();
            }
        };

        this.fetchAll(function(rows) { all = rows; loader.call(this); }, this);
        this.fetchActive(function(rows) { active = rows; loader.call(this); }, this);
    },

    fetchAll : function(cb, scope) {
        var filterConfig = this.getFilterConfig();

        var all = Connector.model.MabPane.FIELD_CACHE[filterConfig.fieldName];
        if (Ext.isArray(all)) {
            cb.call(scope, all);
            return;
        }

        MabQueryUtils.getMabUniqueValues(Ext.apply(filterConfig, {
            useFilter: false,
            success: function(data) {
                Connector.model.MabPane.FIELD_CACHE[filterConfig.fieldName] = data.rows;
                cb.call(scope, data.rows);
            },
            scope: this
        }));
    },

    fetchActive : function(cb, scope) {
        var filterConfig = this.getFilterConfig();

        MabQueryUtils.getMabUniqueValues(Ext.apply(filterConfig, {
            useFilter: true,
            success: function(data) {
                cb.call(scope, data.rows);
            },
            scope: this
        }));
    },

    getFilterConfig : function() {
        return Ext.clone(this.get('filterConfig'));
    },

    isActive : function(name, fieldKey, active) {
        if (name) {
            var lname = name.toLowerCase();
            for (var i = 0; i < active.length; i++) {
                if (active[i][fieldKey] && active[i][fieldKey].toLowerCase() === lname) {
                    return true;
                }
            }
        }

        return false;
    }
});