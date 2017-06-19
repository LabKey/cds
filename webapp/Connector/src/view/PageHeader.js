/*
 * Copyright (c) 2014-2016 LabKey Corporation
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

    height: 100,

    activeTab: 0,

    activeTabCls: 'active',

    layout: 'vbox',

    width: '100%',

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('upclick', 'searchchanged', 'tabselect');
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
                this.tabs = this.dimension.itemDetailTabs;
            }
            else
            {
                this.tabs = undefined;
            }
        }

        this.setTabHeader();

        var titleAndBack = {
            xtype: 'box',
            cls: 'titlepanel inline',
            flex: 1,
            renderTpl: new Ext.XTemplate(
                '<div class="learn-up">',
                    '<span class="iarrow">&nbsp;</span>',
                    '<span class="breadcrumb">{upText:htmlEncode} / </span>',
                    '<span class="studyname">{title:htmlEncode}</span>',
                '</div>'
            ),
            renderData: {
                title: this.title,
                upText: this.upText ? this.upText : (this.dimension ? this.dimension.pluralName : undefined)
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
            html: new Ext.XTemplate(
                    '<div class="dim-selector learnabouttab">',
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

        this.items = [{
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            items: this.buttons ? [titleAndBack, buttonsContainer] : [titleAndBack]
        },{
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            items: this.hasSearch ? [tabPanel, detailSearchField] : [tabPanel]
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