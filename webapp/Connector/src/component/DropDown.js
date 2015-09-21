/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.DropDown', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.dropdown',

    cls: 'dropdown-container',

    ui: 'custom',

    comboConfig: undefined,

    store: undefined,

    valueField: '',

    displayField: '',

    constructor: function(config) {

        this.comboItem = Ext.apply({}, config.comboConfig, {
            queryMode: 'local',
            valueField: config.valueField,
            displayField: config.displayField,
            margin: 0,
            padding: 0,
            store: config.store,
            hideTrigger: true,
            fieldLabel: 'By',
            labelSeparator: '',
            labelWidth: 10,
            readOnly: true,
            fieldCls: 'dropdown-input',
            listeners : {
                afterrender : function(c) {
                    c.setValue(c.getStore().getAt(0));
                }
            }
        });

        Ext.apply(this.comboItem, {
            itemId: 'ddcombo',
            xtype: 'combo'
        });

        this.callParent([config]);

        this.addEvents('select');
    },

    initComponent : function() {

        this.items = [this.comboItem, {
            xtype: 'box',
            autoEl: {
                tag: 'span',
                cls: 'parrow'
            }
        }];

        this.callParent();

        this.on('afterrender', function(p) {

            var combo = p.getComponent('ddcombo');

            // bind click to expand combo
            p.getEl().on('click', function() { combo.expand(); }, this);

            combo.on('select', function(c, models) {
                this.fireEvent('select', this, models);
            }, this);

        }, this);
    },

    getStore : function() {
        return this.getComponent('ddcombo').getStore();
    },

    select : function(model) {
        this.getComponent('ddcombo').setValue(model);
    }
});
