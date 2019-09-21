/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.NonIntegratedDataAvailability', {

    xtype : 'app.module.nonintegrateddataavailability',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="non_integrated_assay_data.length &gt; 0 && non_integrated_assay_data_has_permission">',
            '<h3>{title_non_integrated_assay}</h3>',
            '<p>{instructions_non_integrated_assay}</p>',
            '</br>',
            '<table class="learn-study-info">',
            '<tpl for="non_integrated_assay_data">',
            '<tr>',
            // case when there is both a link to the assay learn page and data to download
            '<tpl if="isLinkValid && hasAssayLearn">',
                '<td class="item-value">',
                    '<a href="#learn/learn/Assay',
                        '/{assayIdentifier}">',
                        '{label:htmlEncode}',
                    '</a> {suffix} ',
                '</td>',
                '<td><a href="{filePath}" target="_blank"><img src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="left"/></a></td>',

            // case when there is data to download and no assay learn page
            '<tpl elseif="isLinkValid && !hasAssayLearn">',
                '<td class="item-value">',
                    '{label:htmlEncode}',
                    '{suffix} ',
                '</td>',
                '<td><a href="{filePath}" target="_blank"><img src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="left"/></a></td>',

            // case when there is assay learn page and no data to download
            '<tpl elseif="hasPermission && hasAssayLearn">',
                '<td class="item-value">',
                    '<a href="#learn/learn/Assay',
                        '/{assayIdentifier}">',
                        '{label:htmlEncode}',
                    '</a>',
                '</td>',

            // case when there is no assay learn page and no data to download
            '<tpl elseif="hasPermission">',
                '<td class="item-value">',
                '{label:htmlEncode}',
                '</td>',
            '</tpl>',
            '</tr>',
            '</tpl>',
            '</table>',
            '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_non_integrated_assay'] = this.initialConfig.data.title;
        data['instructions_non_integrated_assay'] = this.initialConfig.data.instructions;

        if (data.non_integrated_assay_data.length > 0) {
            var docIsValidAction = function(doc, status) {
                doc.isLinkValid = status;
                this.update(data);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.non_integrated_assay_data, docIsValidAction);
            }, this);
        }
    },

    hasContent : function() {
        var reports = this.initialConfig.data.model.data.non_integrated_assay_data;
        if (reports) {
            return reports.length > 0;
        }
        return false;
    }
});
