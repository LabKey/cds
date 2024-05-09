/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabStatus', {
    extend: 'Ext.panel.Panel',
    mixins: {
        undohelper: 'Connector.utility.InfoPaneUtil'
    },

    alias: 'widget.mabstatus',

    ui: 'custom',

    cls: 'filterstatus',

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getSubHeader(),
            this.getSaveAsGroupBtn(),
            this.getGroupSavePanel()
        ];

        this.callParent();
    },

    getSubHeader : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
                tpl: new Ext.XTemplate('<div class="emptytext {subcls:htmlEncode}">{subtitle:htmlEncode}</div>'),
                data: {subtitle: this.getSubHeaderText()},
                listeners: {
                    render: function() {this.onMabFilterChange()},
                    scope: this
                }
            });
        }
        return this.emptyText;
    },

    getSubHeaderText: function() {
        if (this.hasMabFilters())
            return 'From the mAb grid';
        return 'All mAbs';
    },

    getSubHeaderData: function() {
        if (this.hasMabFilters())
            return {
                subtitle: 'From the mAb grid',
                subcls: 'mab-subtitle-filtered'
            };
        return {
            subtitle: 'All mAbs',
            subcls: 'emptytext'
        }
    },

    getSaveAsGroupBtn : function() {
        var me = this;
        return {
            xtype: 'container',
            itemId: 'mabfilterSaveAsGroupBtn',
            cls: 'filter-save-as-group-btn-container',
            //id: 'filter-save-as-group-btn-container-id',
            ui: 'custom',
            hidden : true,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'button',
                //id: 'filter-save-as-group-btn-id',
                text: '<div>Save as a group</div>', // need to wrap in div to get the 'g' in 'group' to fully show up otherwise it is cut off in the bottom
                ui: 'rounded-inverted-accent-small',
                cls: 'filter-save-as-group-btn filter-hdr-btn',
                itemId: 'mabsavegroup-cmp',
                style: 'margin-left: 110px; margin-right: auto; margin-top: 10px;',
                handler: function() {
                    this.hide();
                    me.showGroupSavePanel(true);
                }
            }]
        };
    },

    showGroupSavePanel(resetForm) {
        if(resetForm) {
            this.groupSave.hideError();
            this.groupSave.reset();
        }
        this.groupSave.show();
    },

    hasMabFilters: function() {
        return Connector.getState().getMabFilters().length > 0;
    },

    getHeaderData: function() {
        if (this.hasMabFilters())
            return {
                title: 'Filtered mAbs',
                headerCls: 'mab-section-title-filtered'
            };
        return {
            title: 'MAb Info',
            headerCls: 'section-title'
        };
    },

    getHeader : function () {
        return {
            xtype: 'container',
            itemId: 'mab-info-header',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'filterpanel-header',
                tpl: new Ext.XTemplate(
                        '<h2 class="mab-filterheader-text {headerCls:htmlEncode}">{title:htmlEncode}</h2>'
                ),
                itemId: 'title-text',
                data: this.getHeaderData()
            },{
                xtype: 'container',
                flex: 1
            },{
                xtype: 'button',
                text: 'clear',
                ui: 'rounded-small',
                cls: 'filter-hdr-btn mabfilterclear',
                itemId: 'clearmab',
                hidden: !this.hasMabFilters(),
                handler: this.clearMabFilters
            },{
                xtype: 'button',
                text: 'save',
                ui: 'rounded-inverted-accent-small',
                cls: 'filter-hdr-btn mabfiltersave',
                itemId: 'savemabgroup',
                hidden: !this.hasMabFilters()
            }]
        }
    },

    onMabSelectionChange: function() {
        this.hideMessage(true);
    },

    onMabFilterChange : function() {
        this.hideMessage(true);
        var filterHeader = this.getComponent('mab-info-header');

        var titleText = filterHeader.query('#title-text')[0];
        if (!titleText)
            return;
        var subHeader = this.getSubHeader();
        titleText.update(this.getHeaderData());
        subHeader.update(this.getSubHeaderData());

        var saveBtn = filterHeader.query('#savemabgroup')[0];
        var clrBtn = filterHeader.query('#clearmab')[0];
        var saveGroupBtn = this.getComponent('mabfilterSaveAsGroupBtn');

        if (!this.hasMabFilters()) {
            saveBtn.hide();
            clrBtn.hide();
            saveGroupBtn.hide();
        }
        else {
            saveBtn.show();
            clrBtn.show();
            saveGroupBtn.show();
        }
    },

    clearMabFilters: function() {
        Connector.getState().clearMabFilters(false, true);
    },

    getGroupSavePanel : function() {
        if (!this.groupSave) {
            this.groupSave = Ext.create('Connector.view.GroupSave', {
                hidden: true,
                mabGroup : true,
                itemId: 'groupsave-mab-cmp'
            });
        }
        return this.groupSave;
    }
});
