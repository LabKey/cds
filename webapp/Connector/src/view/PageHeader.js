/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This is a shared header class for an individual item detail. This will be the header for a single
// Study, a single Assay or a single Lab etc.
Ext.define('Connector.view.PageHeader', {

    extend: 'Ext.container.Container',

    alias: 'widget.pageheader',

    cls: 'pageheader learnheader header-container-slim',

    title: 'PageHeader!',

    dimension: undefined,

    upText: undefined,

    upLink: undefined,

    model: undefined,

    height: 114,

    activeTab: 0,

    activeTabCls: 'active',

    layout: 'vbox',

    width: '100%',

    assayTypesToExport: ["BAMA", "NAb", "NABMAb", "PKMAb"],

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('upclick', 'searchchanged', 'tabselect', 'exportassaycsv', 'exportassayexcel');
    },

    initComponent : function() {
        if (Ext.isDefined(this.dimension)) {
            if (!Ext.isDefined(this.upLink)) {
                this.upLink = {
                    controller: 'learn',
                    view: 'learn',
                    context: [this.dimension.name]
                };
            }
        }

        if (!this.tabs)
        {
            if (Ext.isDefined(this.dimension) && Ext.isArray(this.dimension.itemDetailTabs))
            {
                var dataModel = this.model;
                this.tabs = Ext.Array.filter(this.dimension.itemDetailTabs, function(tab) {
                    if (tab.matchField && dataModel) {
                        if (!dataModel.get(tab.matchField))
                            return false;
                    }
                    return true;
                });
            }
            else
            {
                this.tabs = undefined;
            }
        }

        this.setTabHeader();

        var upText = this.upText ? this.upText : (this.dimension ? this.dimension.pluralName : undefined);
        if (this.dimension && this.dimension.itemDetailTabs && this.dimension.itemDetailTabs[0] && this.dimension.itemDetailTabs[0].upText)
            upText = this.dimension.itemDetailTabs[0].upText;

        var titleAndBack = {
            xtype: 'box',
            cls: 'inline',
            flex: 1,
            renderTpl: new Ext.XTemplate(
                '<div class="learn-up">',
                    '<div class="iarrow">&nbsp;</div>',
                    '<div class="breadcrumb">{upText:htmlEncode} / </div>',
                    '<div class="studyname">{title:htmlEncode}</div>',
                '</div>'
            ),
            renderData: {
                title: this.title,
                upText: upText
            },
            renderSelectors: {
                upEl: 'div.learn-up'
            },
            listeners: {
                afterrender: {
                    fn: function(cmp)
                    {
                        cmp.upEl.on('click', this._onUpClick, this);
                    },
                    single: true,
                    scope: this
                }
            }
        };

        var buttonsContainer = {
            xtype: 'container',
            height: 56,
            layout: {
                type: 'hbox',
                align: 'middle',
                defaultMargins: {
                    right: 18
                }
            },
            items: this.buttons
        };

        var tabPanel = {
            xtype: 'panel',
            border: false,
            html: new Ext.XTemplate(
                    '<div class="learnabouttab">',
                    '<tpl for=".">',
                    '<h1 class="lhdv">{label:htmlEncode}</h1>',
                    '</tpl>',
                    '</div>'
            ).apply(this.tabs),
            flex: 2
        };

        var detailSearchField = Ext.create('Ext.form.field.Text', {
            emptyText: 'Search',
            cls: 'learn-search-input',
            minWidth: 150,
            checkChangeBuffer: 500,
            flex: 1,
            value: this.searchValue,
            validator: Ext.bind(function(value) {
                this.fireEvent('searchchanged', value);
                return true;
            }, this)
        });

        if (this.showExport) {

            var id_suffix = this.model.data.assay_identifier.replaceAll(" ", "-");
            var assayExportButton = Ext.create('Connector.button.ExportButton', {
                id: 'learn-grid-assay-export-button-id-' + id_suffix,
                margin: '17 25 0 25',
                dimension: undefined,
                store: undefined,
                width: 100,
                hidden: false
            });

            assayExportButton.on('click', function (cmp, item) {
                if (item.itemId) {
                    switch (item.itemId) {
                        case 'csv-menu-item' :
                            this.fireEvent('exportassaycsv', cmp, item, this.model.data);
                            break;
                        case 'excel-menu-item' :
                            this.fireEvent('exportassayexcel', cmp, item, this.model.data);
                            break;
                    }
                }
            }, this);
        }

        var dim_items = [tabPanel];
        if (this.hasSearch) {
            dim_items = [tabPanel, detailSearchField];
        }
        else {
            if (this.showExport && this.model && this.model.data && this.assayTypesToExport.includes(this.model.data.assay_type)) {
                dim_items = [tabPanel, assayExportButton];
            }
        }

        this.items = [{
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            cls: 'title-and-back-panel',
            items: this.buttons ? [titleAndBack, buttonsContainer] : [titleAndBack]
        },{
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            cls: "dim-selector",
            items: dim_items
        }];

        this.callParent();

        this.on('render', function(cmp)
        {
            var headers = cmp.getEl().query('.lhdv'),
                tabEls = [], el;

            Ext.each(headers, function(h, i)
            {
                el = Ext.get(h);
                tabEls.push(el);
                el.on('click', function()
                {
                    if (this.tabs) {
                        this.fireEvent('tabselect', this.dimension, this.model, this.tabs[i]);
                    }
                }, this);

                if (i === this.activeTab)
                {
                    el.addCls(this.activeTabCls);
                }
            }, this);

            cmp.tabEls = tabEls;

        }, this, {single: true});
    },

    _onUpClick : function()
    {
        this.fireEvent('upclick', this.upLink);
    },

    setTabHeader : function() {
        //rare case so deal with on a case by case basis
        if (!Ext.isDefined(this.tabs) || this.tabs[this.activeTab].url != 'antigens') {
            //default behavior
            this.cls = this.cls + ' pageheader';
        }
    },

    selectTab : function(tabIndex) {
        Ext.each(this.tabEls, function(tab, i) {
            i === tabIndex ? tab.addCls(this.activeTabCls) : tab.removeCls(this.activeTabCls);
        }, this);
    }
});