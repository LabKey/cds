/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.ReportModuleContainer', {

    extend : 'Connector.view.module.BaseModule',

    cls :'reportmodulecontainer',

    tpl : new Ext.XTemplate(
            '<tpl if="description || created">',
            '<table class="learn-report-info module">',
            '<tr>',
            '<td class="learn-report-header-column">',
            '<tpl if="description">',
            '<h3>Description</h3>',
            '<p>{description:htmlEncode}</p>',
            '</tpl>',
            '</td>',
            '<td class="learn-report-header-column">',
            '<tpl if="created">',
            '<p>Date Created: {created:this.renderDate}</p>',
            '</tpl>',
            '</td>',
            '</tr>',
            '</table>',
            '</tpl>',
            '<tpl if="panelId">',
            '<div id={panelId} class="reportView"></div>',
            '</tpl>',
            {
                renderDate : function(date) {
                    return Connector.app.view.LearnSummary.dateRenderer(date);
                }
            }
    ),

    listeners : {
        render : {fn : function(cmp){
            var url = LABKEY.ActionURL.buildURL('reports', 'viewScriptReport', cmp.report.container, {
                reportId: cmp.report.reportId
            });
            cmp.getEl().mask("Loading report results...");
            Ext.Ajax.request({
                url : url,
                method: 'POST',
                success: function(resp){
                    cmp.getEl().unmask();
                    LABKEY.Utils.loadAjaxContent(resp, cmp.panelId, function() {
                    });
                },
                failure : function() {
                    Ext.Msg.alert("Error", "Failed to load report.");
                },
                scope : this
            });
        }, scope : this}
    },

    initComponent : function() {
        var data = this.model.data, panelId = Ext.id();
        this.panelId = panelId;
        this.report = data;
        data.panelId = panelId;
        this.update(data);
    }

});
