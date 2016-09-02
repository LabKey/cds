/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyAssays', {
    xtype: 'app.module.studyassays',

    extend: 'Connector.view.module.DataAvailabilityModule',

    getDataAddedStore : function(data) {
        Ext.define("AssayAdded", {
            extend: "Ext.data.Model",
            fields: [
                {name: 'assay_identifier'},
                {name: 'assay_short_name'},
                {name: 'has_data'},
                {name: 'study_assay_id'},
                {name: 'assay_status'}
            ]
        });

        return Ext.create('Ext.data.Store', {
            model: 'AssayAdded',
            data: data.model.getData()['assays']
        })
    },

    getDataAddedTemplate : function() {
        return new Ext4.XTemplate(
                '<tpl if="assay_short_name">', //determines if we have a learn about page to back the assay
                    '<a href="#learn/learn/Assay/{[encodeURIComponent(values.assay_identifier)]}">{assay_short_name:htmlEncode}</a>',
                '<tpl else>',
                    '<p>{study_assay_id:htmlEncode}</p>',
                '</tpl>')
    }
});
