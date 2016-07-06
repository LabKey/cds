Ext.define('Connector.utility.Report', {
    alternateClassName: ['ReportUtils'],
    singleton: true,
    getRReportPageView : function(learnView, reportId, report) {
        if (learnView.items.length > 1) {
            for (var i=0; i < learnView.items.items.length; i++) {
                learnView.items.items[i].hide();
            }
        }
        if (!report || report.type.indexOf('.rReport') < 0) {
            Ext.Msg.alert("Invalid Report", "Report is not an R report");
            return;
        }
        var panelId = Ext.id();
        var tabViews = [
            Ext.create('Ext.container.Container', {
                title   : 'Report',
                width: '100%',
                cls: 'reportContent',
                html    : {
                    tag : 'div',
                    children : [
                        {
                            html:   '<div class="reportinfo">' +
                                        '<div class="reportinfoheader">Report Information</div>' +
                                        '<span class="reportinfoname">Author:</span><span class="reportinfovalue">' +
                                        report.author + '</span><br>' +
                                        '<span class="reportinfoname">Date created:</span><span class="reportinfovalue">' +
                                        report.created + '</span>' +
                                    '</div>'
                        },
                        {tag : 'div', cls : 'reportView', id : panelId}
                    ]
                },
                bodyPadding : 10,
                autoScroll  : true,
                listeners : {
                    render : {fn : function(cmp){
                        var url = LABKEY.ActionURL.buildURL('reports', 'viewScriptReport', report.reportContainer, {
                            reportId: 'db:' + reportId
                        });
                        cmp.getEl().mask("Loading report results...");
                        Ext.Ajax.request({
                            url : url,
                            method: 'POST',
                            success: function(resp){
                                cmp.getEl().unmask();
                                LABKEY.Utils.loadAjaxContent(resp, panelId, function() {
                                    cmp.doLayout();
                                });
                            },
                            failure : function() {
                                Ext.Msg.alert("Error", "Failed to load report.");
                            },
                            scope : learnView
                        });
                    }, scope : learnView}
                }})
        ];

        var pageView = Ext.create('Connector.view.Page', {
            pageID: 'learnDetail' + 'report',
            contentViews: tabViews,
            initialSelectedTab: 0,
            header: Ext.create('Connector.view.PageHeader', {
                upLink: {
                    controller: 'learn',
                    view: 'learn',
                    context: 'Study'
                },
                height: 112,
                upText: 'Report',
                title: report.name,
                renderTpl: new Ext.XTemplate(
                        '<div style="background-color: #ebebeb;">',
                        '{%this.renderContainer(out,values);%}',
                        '</div>',
                        '<div class="dim-selector learnabouttab">',
                        '<h1 class="lhdv">Overview</h1>',
                        '</div>'
                )
            })
        });

        return pageView;
    }

});