/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.AssayAntigen', {

    xtype : 'app.view.assayantigengrid',

    extend : 'Connector.app.view.LearnGrid',

    cls: 'learngrid antigengrid',

    isDetailLearnGrid: true,

    viewConfig: {
        stripeRows: false,
        getRowClass: function() {
            return 'detail-row';
        }
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
        if (this.learnViewConfig)
        {
            this.learnView = this.learnViewConfig.learnView;
            this.tabId = this.learnViewConfig.tabId;
            this.tabDimension = this.learnViewConfig.tabDimension;
            this.tabParams = this.learnViewConfig.tabParams;
        }
        this.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">None of the selected Antigens have data for this category.</div>'
        ).apply({});

        this.callParent();
    }

});
