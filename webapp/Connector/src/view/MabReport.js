Ext.define('Connector.view.MabReport', {
    extend : 'Ext.container.Container',

    alias: 'widget.mabreportview',

    initComponent : function() {

        this.items = [this.getHeaderItem(), this.getReportResult()];
        this.callParent();
    },

    getHeaderItem: function() {
        return {
            xtype: 'box',
            width: '100%',
            cls: 'mabreportheader learnheader',
            flex: 1,
            renderTpl: new Ext.XTemplate(
                    '<div class="title-and-back-panel">',
                    '<div class="iarrow">&nbsp;</div>',
                    '<div class="breadcrumb">Monoclonal Antibodies / </div>',
                    '<div class="studyname">{title:htmlEncode}</div>',
                    '</div>'
            ),
            renderData: {
                title: this.reportLabel
            },
            renderSelectors: {
                upEl: 'div.title-and-back-panel'
            },
            listeners: {
                afterrender: {
                    fn: function (cmp) {
                        cmp.upEl.on('click', this._onBackClick, this);
                    },
                    single: true,
                    scope: this
                }
            }
        }
    },

    _onBackClick: function(){
        this.hide();
        this.parentGrid.showGridView(true);
        this.parentGrid.remove(this);
    },

    getReportResult: function() {
        return {
            xtype: 'box',
            width: '100%',
            html: '<div id="mabreportrenderpanel" class="reportView"></div>',
            listeners: {
                render : {fn : function(cmp){
                    var url = LABKEY.ActionURL.buildURL('reports', 'viewScriptReport', LABKEY.container.path, {
                        reportId: this.reportId,
                        filteredKeysQuery: this.filteredKeysQuery,
                        filteredDatasetQuery: this.filteredDatasetQuery
                    });
                    cmp.getEl().mask("Loading " + this.reportLabel);
                    Ext.Ajax.request({
                        url : url,
                        method: 'POST',
                        success: function(resp){
                            cmp.getEl().unmask();
                            var json = LABKEY.Utils.decode(resp.responseText);
                            if (!json || !json.html)
                                Ext.Msg.alert("Error", "Unable to load " + this.reportLabel + ". The report doesn't exist or you may not have permission to view it.");
                            LABKEY.Utils.loadAjaxContent(resp, 'mabreportrenderpanel', function() {
                            });
                        },
                        failure : function() {
                            Ext.Msg.alert("Error", "Failed to load " + this.reportLabel);
                        },
                        scope : this
                    });
                }, scope : this}
            }
        }
    }
});
