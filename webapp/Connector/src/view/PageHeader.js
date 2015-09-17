/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// PARAMS
// var data = {
//     label : "Blah",
//     buttons : {
//         back: true,
//         group: [{
//             groupLabel: "Select",
//             buttonLabel: 'text',
//             handler: function() {
//                 // ...
//             }
//         }]
//     },
//     tabs : ["Overview", "Variables, Antigens, Analytes"],
//     lockPixels : 100
// }

// This is a shared header class for an individual item detail. This will be the header for a single
// Study, a single Assay or a single Lab etc.
Ext.define('Connector.view.PageHeader', {

    extend: 'Ext.Component',

    alias: 'widget.learnpageheader',

    cls: 'pageheader learnheader header-container-slim',

    title: 'PageHeader!',

    dimension: undefined,

    upText: undefined,

    upLink: undefined,

    model: undefined,

    height: 100,

    activeTab: 0,

    activeTabCls: 'active',

    flex: 1,

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('upclick', 'tabselect');
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

        if (Ext.isDefined(this.dimension) && Ext.isArray(this.dimension.itemDetailTabs)) {
            this.tabs = this.dimension.itemDetailTabs;
        }
        else {
            this.tabs = undefined;
        }

        this.setTabHeader();

        this.renderTpl = new Ext.XTemplate(
            '<div>',
                '<div class="learn-up titlepanel interactive inline">',
                    '<span class="iarrow">&nbsp;</span>{upText:htmlEncode}',
                '</div>',
                '<h1 class="inline">{title:htmlEncode}</h1>',
                '<div class="dim-selector">',
                    '<tpl for="tabs">',
                        '<h1 class="lhdv">{label:htmlEncode}</h1>',
                    '</tpl>',
                '</div>',
            '</div>'
        );

        this.renderData = {
            title: this.title,
            upText: this.upText ? this.upText : (this.dimension ? this.dimension.pluralName : undefined),
            tabs: this.tabs
        };

        this.renderSelectors = {
            upEl: 'div.learn-up',
            tabParentEl: 'div.dim-selector'
        };

        this.callParent();

        this.on('render', function(cmp) {

            var headers = cmp.tabParentEl.query('.lhdv'),
                tabEls = [], el;

            Ext.each(headers, function(h, i) {
                el = Ext.get(h);
                tabEls.push(el);
                el.on('click', function(evt, el) {
                    this.fireEvent('tabselect', this.dimension, this.model, this.tabs[i]);
                }, this);

                if (i === this.activeTab) {
                    el.addCls(this.activeTabCls);
                }
            }, this);

            cmp.tabEls = tabEls;

        }, this);

        this.on('afterrender', function(cmp) {
            cmp.upEl.on('click', function() {
                this.fireEvent('upclick', this.upLink);
            }, this);
        }, this);
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
