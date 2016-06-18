/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyAssays', {

    xtype : 'app.module.studyassays',

    extend : 'Connector.view.module.BaseModule',

    initComponent : function() {
        if (!Ext.isObject(this.data)) {
            this.data = {};
        }

        Ext.apply(this.data, {
            assays: this.data.model ? this.data.model.get('assays'): []
        });

        this.tpl = new Ext.XTemplate(
                '<tpl>',
                    '<p>',
                        Connector.constant.Templates.module.title,
                    '</p>',
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
                    '<tpl if="assays.length &gt; 0">',
                        '<table>',
                            '<tpl for="assays">',
                                '<tr class="item-row">',
                                    '<td>',
                                        '<tpl if="has_data">',
                                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                                        '<tpl else>',
                                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                                        '</tpl>',
                                    '</td>',
                                    '<td>',
                                        '<tpl if="assay_label">', //determines if we have a learn about page to back the assay
                                            '<a href="#learn/learn/Assay/{[encodeURIComponent(values.assay_identifier)]}">{assay_label:htmlEncode}</a>',
                                        '<tpl else>',
                                            '{assay_identifier:htmlEncode}',
                                        '</tpl>',
                                    '</td>',
                                '</tr>',
                            '</tpl>',
                        '</table>',
                    '<tpl else>',
                        '<div class="item-row">',
                        '<p>No related assays</p>',
                        '</div>',
                    '</tpl>',
                '</tpl>'
        );

        this.callParent();

        var data = this.data;
        this.on('afterrender', function(sp) {
            sp.update(data);
            sp.fireEvent('hideLoad', sp);
        });
    }
});
