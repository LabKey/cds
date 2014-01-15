/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.view.Navigation', {

    extend : 'Ext.Panel',

    alias  : 'widget.navigation',

    constructor : function(config) {

        Ext4.applyIf(config, {
            ui : 'navigation'
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [this.getNavigationView()];

        this.callParent();
    },

    getNavigationView : function() {
        if (this.view)
            return this.view;

        this.view = Ext4.create('Connector.view.NavigationView', this.viewConfig);
        return this.view;
    },

    getSelectionModel : function() {
        if (this.view)
            return this.view.getSelectionModel();
    }
});

Ext4.define('Connector.view.NavigationView', {

    extend : 'Ext.view.View',

    trackOver : true,

    initComponent : function() {

        this.cls         = 'navigation-view';
        this.overItemCls = 'nav-label-over';
        this.selectedItemCls = 'nav-label-selected '+ this.arrow;

        this.store = Ext4.create('Ext.data.Store', {
            fields : ['label', 'value', 'disabled', 'basecls', 'cls'],
            data   : {'items' : this.mapping},
            proxy  : {
                type : 'memory',
                reader : {
                    type : 'json',
                    root : 'items'
                }
            },
            scope  : this
        });

        this.tpl = new Ext4.XTemplate(
            '<tpl for=".">',
                '<div class="{basecls} {cls}">',
                    '{label:this.renderContent}',
                '</div>',
            '</tpl>'
        );

        var me = this;
        this.tpl.renderContent = function(val) {
            var ret = '';
            if (me.arrow == 'left'){
                ret += '<span class="' + me.arrow +'-arrow"></span>';
                ret += '<span class="right-label">' + val + '</span>';
            } else if (me.arrow == 'right'){
                ret += '<span class="left-label">' + val + '</span>';
                ret += '<span class="' + me.arrow +'-arrow"></span>';
            }
            return ret;
        };

        this.itemSelector = 'div.labely';

        this.callParent();

        this.on('beforeselect', this.onBeforeSelect, this);
        this.on('viewready', this.onViewReady, this, {single: true});
    },

    prepareData : function(d)  {
        d.basecls = (d.disabled) ? 'dis-label labely' : 'nav-label labely';
        return d;
    },

    onBeforeSelect : function(v, rec) {
        return !(rec.data.disabled == true);
    },

    onViewReady : function(v) {
        var disabledRecs = Ext4.DomQuery.select('.dis-label', v.getEl().id);
        var knownIds = ['chartdemography'];

        for (var i=0; i < disabledRecs.length; i++)
        {
            if (knownIds.length <= i)
                break;

            Ext4.create('Ext.tip.ToolTip', {
                target : disabledRecs[i],
                anchor : 'left',
                autoHide: true,
                contentEl : knownIds[i],
                maxWidth : 500,
                minWidth : 200,
                bodyPadding: 0,
                padding: 0
            });
        }
    },

    selectByView : function(xtype, defaultSelect) {
        var rec = this.store.find('value', xtype, null, null, true, true);
        if (rec > -1)
            this.select(rec);
        else if (Ext4.isNumber(defaultSelect))
            this.select(defaultSelect);
    }
});
