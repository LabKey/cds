/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Summary', {

    extend : 'Ext.panel.Panel',

    requires : ['Connector.model.Summary'],

    alias  : 'widget.summary',

    ui: 'custom',

    cls : 'summaryview',

    layout : 'anchor',

    initComponent : function() {

        this.refreshRequired = true;

        this.titlePanel = Ext.create('Ext.panel.Panel', {
            ui  : 'custom',
            cls : 'titlepanel',
            html: '<span>find subjects...</span>'
        });

        this.items = [this.titlePanel, this.getSummaryDataView()];

        this.callParent();
    },

    getSummaryDataView : function() {

        if (this.summaryPanel)
            return this.summaryPanel;

        var resizer = function(cmp, w) {

            var roots = ['bycolumn', 'detailcolumn'], root,
                    elArray, el, e, targets, result, r;

            for (r=0; r < roots.length; r++) {

                root = roots[r];
                if (w < 850) {
                    elArray = Ext.select('.' + root + ', .med-' + root).elements;
                    targets = [root, 'med-' + root];
                    result  = 'small-' + root;
                }
                else if (850 <= w && w < 1075) {
                    elArray = Ext.select('.' + root + ', .small-' + root).elements;
                    targets = [root, 'small-' + root];
                    result  = 'med-' + root;
                }
                else {
                    elArray = Ext.select('.small-' + root + ', .med-' + root).elements;
                    targets = ['small-' + root, 'med-' + root];
                    result  = root;
                }

                for (e=0; e < elArray.length; e++) {
                    el = Ext.get(elArray[e]);
                    el.replaceCls(targets[0], result);
                    el.replaceCls(targets[1], result);
                }

            }
        };

        var refreshHandler = function(view) {
            resizer(view, view.getBox().width);
        };

        this.summaryPanel = Ext.create('Connector.view.SummaryDataView', {
            anchor : '100% 50%',
            ui     : 'custom',
            store  : this.store
//            listeners : {
//                refresh : refreshHandler,
//                resize  : refreshHandler
//            }
        });

        return this.summaryPanel;
    },

    refresh : function () {
        if (this.summaryPanel) {
            this.summaryPanel.getStore().load();
        }
    },

    onFilterChange : function(f) {

        if (this.isVisible()) {
            this.refresh();
        }
        else {
            this.refreshRequired = true;
        }
    },

    showMessage : function(msg) {

        var box = this.summaryPanel.getBox();

        this.msg = Ext.create('Connector.window.SystemMessage', {
            msg : msg,
            x   : Math.floor(box.width/2),
            y   : (box.y-70) // height of message window
        });
    },

    displayLoad : function() {
        this.titlePanel.addCls('showload');
    },

    removeLoad : function() {
        this.titlePanel.removeCls('showload');
    }
});

Ext.define('Connector.view.SummaryDataView', {

    extend : 'Ext.view.View',

    alias : 'widget.summarydataview',

    itemSelector: 'div.row',

    loadMask : false,

    statics : {
        linksTpl: new Ext.XTemplate(
                '<tpl for="details">',
                '{[ this.showValue(values, parent) ]}',
                '</tpl>',
                '{[ this.clearSep(values) ]}',
                {
                    showValue: function(values, parent) {
                        if (!Ext.isDefined(parent.sep)) {
                            parent.sep = '';
                        }
                        else if (parent.sep.length == 0) {
                            parent.sep = ', ';
                        }
                        var nav = (values.nav ? ' class="nav" nav="' + values.nav + '"' : '');
                        return parent.sep + values.counter + ' <a' + nav + '>' + values.text + '</a>';
                    },
                    clearSep: function(p) {
                        p.sep = undefined;
                    }
                })
    },

    tpl : new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="row">',
            '<div class="line"></div>',
            '<div class="column bycolumn"><span class="pp">by</span><span class="label"> {label}</span></div>',
            '<div class="column detailcolumn">{[ Connector.view.SummaryDataView.linksTpl.apply(values) ]}</div>',
            '<div class="column endcolumn totalcolumn">{total} {subject}</div>',
            '</div>',
            '</tpl>'
    )
});