/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayStudies', {
    xtype : 'app.module.assaystudies',

    extend: 'Connector.view.module.DataAvailabilityModule',

    getDataAddedStore : function(data) {
        return Ext.create('Ext.data.Store', {
            model: "StudyAdded",
            data: data.model.getData()['studies']
        });
    },

    getDataAddedTemplate : function() {
        return new Ext4.XTemplate(
                '<tpl if="label">', //determines if we have a learn about page to back the assay
                    '<a href="#learn/learn/Study/{[encodeURIComponent(values.id)]}">{label:htmlEncode}</a>',
                '<tpl else>',
                    '<span>{id:htmlEncode}</span>',
                '</tpl>')
    }
});

Ext.define("StudyAdded", {
    extend: "Ext.data.Model",
    fields: [
        {name: 'id'},
        {name: 'label'},
        {name: 'has_data'},
        {name: 'assay_status', convert: function(value) {
            return value ? value : "Status not available";
        }}
    ]
});