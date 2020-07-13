/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssaySchemaMethod', {

    xtype : 'app.module.assayschemamethod',

    plugins : ['documentvalidation'],

    extend: 'Ext.container.Container',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl if="methods || assay_schema_link">',
                '<div class="module">',
                    '<h3 id="assay_methods_title" class="listing_title">{method_title}</h3>',
                    '<tpl if="methods_assay_schema_link_valid">',
                        '<div class="schema-link">',
                            '<a id="methods_assay_link" href= "' + LABKEY.contextPath + '{assay_schema_link}" target="_blank">Click for assay schema</a>',
                        '</div>',
                    '</tpl>',
                     '{methods:htmlEncode}',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['method_title'] = "Methods";

        var methodsAssaySchemaLinkIsValid = function (schema_link, result) {
            data['methods_assay_schema_link_valid'] = result;
            this.update(data);
        };

        this.on("afterrender", function () {
            this.validateSchemaAccessLink(data.assay_schema_link, methodsAssaySchemaLinkIsValid);
        });
    }
});
