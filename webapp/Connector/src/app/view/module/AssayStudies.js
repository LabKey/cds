/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayStudies', {

    xtype : 'app.module.assaystudies',

    extend : 'Connector.view.module.BaseModule',

    initComponent : function() {
        if (!Ext.isObject(this.data)) {
            this.data = {};
        }

        Ext.apply(this.data, {
            studies: this.data.model ? this.data.model.get('studies'): []
        });

        this.tpl = new Ext.XTemplate(
                '<tpl><p>',
                    Connector.constant.Templates.module.title,
                    '<tpl if="studies.length &gt; 0">',
                        '<tpl for="studies">',
                            '<div class="item-row">',
                                '<p><a href="#learn/learn/Study/{[encodeURIComponent(values.id)]}">{label:htmlEncode}</a></p>',
                            '</div>',
                        '</tpl>',
                    '<tpl else>',
                        '<div class="item-row">',
                        '   <p>No related assays</p>',
                        '</div>',
                    '</tpl>',
                '</p></tpl>'
        );

        this.callParent();

        var data = this.data;
        this.on('afterrender', function(sp) {
            sp.update(data);
            sp.fireEvent('hideLoad', sp);
        });
    }
});
