/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.AssayAntigen', {

    xtype : 'app.view.assayantigengrid',

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid antigengrid',

    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && record.data.data_availability ? cls + ' detail-row-has-data' : cls;
        },
        overItemCls: 'detail-row-hover',
        selectedItemCls: ''
    },

    normalGridConfig: {},

    lockedViewConfig: {
        overflowY: 'hidden',
        emptyText: ''
    },

    normalViewConfig: {
        overflowY: 'scroll'
    },

    initComponent: function ()
    {
        this.callParent();
    }

});
