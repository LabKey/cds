/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductStudies', {

    xtype : 'app.module.productstudies',

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
                '<table class="data-availability-header">',
                    '<tr>',
                        '<td>',
                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                        '</td>',
                        '<td> Data added to Dataspace </td>',
                        '<td>',
                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png"/>',
                        '</td>',
                        '<td> Data not added </td>',
                    '</tr>',
                '</table>',
                '<tpl if="studies.length &gt; 0">',
                    '<table>',
                        '<tpl for="studies">',
                            '<tr class="item-row">',
                                '<td>',
                                    '<tpl if="has_data">',
                                        '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                                    '<tpl else>',
                                        '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                                    '</tpl>',
                                '</td>',
                                '<td>',
                                    '<a href="#learn/learn/Study/{study_name}">{label:htmlEncode}</a>',
                                '</td>',
                            '</tr>',
                        '</tpl>',
                    '</table>',
                '<tpl else>',
                    '<div class="item-row">',
                        '<p>No related studies</p>',
                    '</div>',
                '</tpl>',
            '</p></tpl>'
        );

        this.callParent();

        var data = this.data;
        this.on('afterrender', function(ps) {
            ps.update(data);
            ps.fireEvent('hideLoad', ps);
        });
    }
});
