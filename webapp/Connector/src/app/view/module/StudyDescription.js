/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyDescription', {

    xtype : 'app.module.studydescription',

    extend : 'Connector.view.module.BaseModule',

    // there might be html code in each of the description section content, DO NOT htmlEncode
    tpl : new Ext.XTemplate(
            '<tpl if="description || objectives || rationale || groups || treatment_schema_link || methods || assay_schema_link || findings || conclusions || publications">',
            '<h3>{title_description:htmlEncode}</h3>',
            '<p>{description}</p>',

            '<tpl if="objectives">',
                '<h4>Objectives</h4>',
                '<p>{objectives}</p>',
            '</tpl>',

            '<tpl if="rationale">',
                '<h4>Rationale</h4>',
                '<p>{rationale}</p>',
            '</tpl>',

            '<tpl if="groups || treatment_schema_link">',
                '<h4>Groups</h4>',
                '<tpl if="treatment_schema_link">',
                    '<div class="schema-link"><a href="{treatment_schema_link}" target="_blank">Click for treatment schema</a></div>',
                '</tpl>',
                '<tpl if="groups">',
                    '<p>{groups}</p>',
                '</tpl>',
            '</tpl>',

            '<tpl if="methods || assay_schema_link">',
                '<h4>Methods</h4>',
                '<tpl if="assay_schema_link">',
                    '<div class="schema-link"><a href="{assay_schema_link}" target="_blank">Click for assay schema</a></div>',
                '</tpl>',
                '<tpl if="methods">',
                    '<p>{methods}</p>',
                '</tpl>',
            '</tpl>',

            '<tpl if="findings">',
                '<h4>Findings</h4>',
                '<p>{findings}</p>',
            '</tpl>',

            '<tpl if="conclusions">',
                '<h4>Conclusions</h4>',
                '<p>{conclusions}</p>',
            '</tpl>',

            '<tpl if="publications">',
                '<h4>Publications</h4>',
                '<p>{publications}</p>',
            '</tpl>',

            '</tpl>'
    ),
    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title_description'] = this.initialConfig.data.title;
        this.update(data);
    }
});
