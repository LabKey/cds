/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabReport', {
    extend : 'Ext.container.Container',

    alias: 'widget.mabreportview',

    reportHeaderHeight: 56 + 58, // page header + report title

    rightSideNavWidth: 244,

    maskWidthOffset: 500,

    initComponent : function() {
        if (this.parentGrid) {
            this.parentGrid.on('resize', this.resizeReport, this, {buffer: 200});
        }
        this.items = [this.getHeaderBreadCrumbs(), this.getReportResult()];
        this.callParent();
    },

    getHeaderBreadCrumbs : function() {
        if (!this.gridHeader) {
            this.gridHeader = Ext.create('Ext.container.Container', {
                height: this.headerHeight,
                ui: 'custom',
                cls: 'header-container',
                layout: {
                    type: 'hbox'
                },
                items: [{
                            xtype: 'box',
                            width: '100%',
                            cls: 'mabreportheader learnheader',
                            flex: 1,
                            renderTpl: new Ext.XTemplate(
                                    '<div class="title-and-back-panel" style="white-space: nowrap; width: 100%">',
                                    '<div class="iarrow">&nbsp;</div>',
                                    '<div class="breadcrumb">Monoclonal antibodies / </div>',
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
                        },{
                            xtype: 'actiontitle',
                            text: '',
                            buttons: [
                                this.getViewGridButton(),
                                this.getExportButton()
                            ]
                    }]
            });
        }
        return this.gridHeader;
    },

    getExportButton : function () {
        if (!this.exportButton) {
            this.exportButton = {
                xtype: 'exportbutton',
                id: 'mab-grid-export-btn-breadcrumb',
                margin : '0 0 0 28',
                hidden : false,
                width : 100,
                listeners: {
                    exportcsv : this._onExportCSVClick,
                    exportexcel : this._onExportExcel,
                    scope: this
                }
            }
        }
        return this.exportButton;
    },

    getViewGridButton : function() {

        // Fix for support ticket: 41638: MAb visualization button alignment adjustments
        // utilize same pattern as Reports on MabGrid so that the buttons are aligned as expected
        var items = [];
        this.viewGridButtons = [];

        items.push({
            xtype: 'button',
            cls: 'mabgridcolumnsbtn',
            handler: this._onBackClick,
            id: 'mabgridcolumnsbtn-breadcrumb',
            text: 'Return to mAb grid',
            scope: this
        });

        this.viewGridButtons.push({
            xtype: 'container',
            childEls: ['outerCt', 'innerCt'],
            items: items,
            renderTpl: [
                '<span id="{id}-outerCt" style="display:table;">',
                '<div id="{id}-innerCt" class="mabgridbuttonslayout"></div>',
                '</span>'
            ]
        });

        return this.viewGridButtons[0];
    },

    _onBackClick: function(){
        this.hide();
        if (this.parentGrid) {
            this.parentGrid.showGridView(true);
            this.parentGrid.remove(this);
        }
    },

    _onExportCSVClick: function(){
        if (this.parentGrid) {
            this.parentGrid.requestExportCSV();
        }
    },

    _onExportExcel: function(){
        if (this.parentGrid) {
            this.parentGrid.requestExportExcel();
        }
    },

    getReportResult: function() {
        var me = this;
        return {
            xtype: 'box',
            cls: 'reportViewMAb',
            width: '100%',
            html: '<div id="mabreportrenderpanel"></div>',
            listeners: {
                render : function(cmp){
                    me.reportPanel = cmp;

                    //temporary setting of height and width so that the mask position is not out of bounds
                    cmp.getEl().setWidth(me.maskWidthOffset);
                    cmp.getEl().setHeight(me.reportHeaderHeight);

                    cmp.getEl().mask("Generating " + me.reportLabel);

                    Connector.getQueryService().prepareMAbReportQueries({
                        reportId: this.reportId,
                        reportLabel: this.reportLabel,
                        success: function(vals) {

                            var url = LABKEY.ActionURL.buildURL('reports', 'viewScriptReport', LABKEY.container.path, {
                                reportId: me.reportId,
                                filteredKeysQuery: vals.filteredKeysQuery,
                                filteredDatasetQuery: vals.filteredDatasetQuery
                            });

                            Ext.Ajax.request({
                                url : url,
                                method: 'POST',
                                success: function(resp){

                                    if (cmp.getEl())
                                        cmp.getEl().unmask();

                                    var json = LABKEY.Utils.decode(resp.responseText);
                                    if (!json || !json.html)
                                        Ext.Msg.alert("Error", "Unable to load " + me.reportLabel + ". The report doesn't exist or you may not have permission to view it.");
                                    LABKEY.Utils.loadAjaxContent(resp, 'mabreportrenderpanel', function() {
                                        me.resizeReport();
                                    });
                                },
                                failure : function() {
                                    Ext.Msg.alert("Error", "Failed to load " + me.reportLabel);
                                },
                                scope : this
                            });

                        },
                        failure: function() {
                            Ext.Msg.alert('Error', "Unable to render report.");
                        },
                        scope: this
                    });
                },
                resize : function() {
                    me.resizeReport();
                },
                scope: this
            }
        }
    },

    resizeReport: function() {
        if (this.reportPanel && !this.isHidden()) {
            var box = Ext.getBody().getBox();
            this.reportPanel.setWidth(box.width - this.rightSideNavWidth);
            this.reportPanel.setHeight(box.height - this.reportHeaderHeight);
        }
    }
});
