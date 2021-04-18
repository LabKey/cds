/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.TreatmentSchemaGroup', {

    xtype : 'app.module.treatmentschemagroup',

    plugins : ['documentvalidation'],

    extend: 'Connector.view.module.ShowList',

    showAll: false,

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl if="groups_data || treatment_schema_link">',
                '<div class="module">',
                    '<h3 id="treatment_groups_title" class="listing_title">{group_title}</h3>',
                        '<tpl if="treatment_schema_link_valid">',
                            '<div class="schema-link">',
                                '<a id="groups_treatment_link" href= "{treatment_schema_link_1}" target="_blank">Click for treatment schema</a>',
                            '</div>',
                        '</tpl>',
                        '{groups_header}',
                        '<ul class="learn-study-info"><tbody>',
                            '<tpl for="groups_data">',
                                '<tpl if="xindex &lt; 11">',
                                    '<tpl if="label">',
                                        '<li class="item-value" style="padding-right: 1em;">{label:htmlEncode}</li>',
                                    '</tpl>',
                                '</tpl>',
                            '</tpl>',
                        '</ul>',
                        '<tpl if="groups_data.length &gt; 10">',
                        'and {groups_data.length - 10} more ',
                            '<tpl if="showAll">',
                                '<span class="show-hide-toggle-groups">(show less)</span>',
                            '<tpl else>',
                                '<span class="show-hide-toggle-groups">(show all)</span>',
                            '</tpl>',
                            '</br></br>',
                        '</tpl>',
                        '<ul class="learn-study-info">',
                            '<tpl for="groups_data">',
                                '<tpl if="parent.showAll && (xindex &gt; 10)">',
                                    '<tpl if="label">',
                                        '<li class="item-value" style="padding-right: 1em;">{label:htmlEncode}</li>',
                                    '</tpl>',
                                '</tpl>',
                            '</tpl>',
                        '</ul>',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),

    initComponent : function() {

        var data = this.getListData();
        data['group_title'] = "Groups";
        data['showAll'] = this.showAll;
        this.update(data);

        var treatmentSchemaLinkIsValid = function (schema_link, result) {
            data['treatment_schema_link_valid'] = result;
            data['treatment_schema_link_1'] = Ext.isEmpty(LABKEY.contextPath) ? data['treatment_schema_link'] : (LABKEY.contextPath + data['treatment_schema_link']);
            this.update(data);
        };

        this.on("afterrender", function () {
            this.validateSchemaAccessLink(data.treatment_schema_link, treatmentSchemaLinkIsValid);
        });

        this.callParent();
    },

    hasContent : function() {
        var grps = this.initialConfig.data.model.get('groups_data');
        if (grps) {
            return grps.length > 0;
        }
        return false;
    },

    getListData: function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('treatment_groups_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-groups');
    }
});
