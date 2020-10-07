/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.TreatmentSchemaGroup', {

    xtype : 'app.module.treatmentschemagroup',

    plugins : ['documentvalidation'],

    extend: 'Ext.container.Container',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl if="groups || treatment_schema_link">',
                '<div class="module">',
                    '<h3 id="treatment_groups_title" class="listing_title">{group_title}</h3>',
                        '<tpl if="treatment_schema_link_valid">',
                            '<div class="schema-link">',
                                '<a id="groups_treatment_link" href= "{treatment_schema_link_1}" target="_blank">Click for treatment schema</a>',
                            '</div>',
                        '</tpl>',
                        '{groups}',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['group_title'] = "Groups";

        var treatmentSchemaLinkIsValid = function (schema_link, result) {
            data['treatment_schema_link_valid'] = result;
            data['treatment_schema_link_1'] = Ext.isEmpty(LABKEY.contextPath) ? data['treatment_schema_link'] : (LABKEY.contextPath + data['treatment_schema_link']);
            this.update(data);
        };

        this.on("afterrender", function () {
            this.validateSchemaAccessLink(data.treatment_schema_link, treatmentSchemaLinkIsValid);
        });
    }
});
