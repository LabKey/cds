/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyMabs', {

    xtype : 'app.module.studymabs',

    extend : 'Connector.view.module.ShowList',

    showAll: false,

    tpl : new Ext.XTemplate(
            '<tpl>',

                '<tpl if="monoclonal_antibodies.length &gt; 0">',
                '<h3 id="mab_listing_title" class="listing_title">{title_related_mabs}</h3>',
                '<table class="learn-study-info"><tbody>',
                    '<tpl for="monoclonal_antibodies">',
                        '<tpl if="xindex &lt; 11">',
                            '<tr>',
                            '<td class="item-label"><a href="#learn/learn/MAb/{name}">{name:htmlEncode}</a></td>',
                                '<tpl if="label">',
                                '<td class="item-value" style="padding-right: 1em;">Labeled as: {label:htmlEncode}</td>',
                                '</tpl>',
                            '</tr>',
                        '</tpl>',
                    '</tpl>',
                '</tbody></table>',
                '</tpl>',

                '<tpl if="monoclonal_antibodies.length &gt; 10">',
                    'and {monoclonal_antibodies.length - 10} more ',
                    '<tpl if="showAll">',
                        '<span class="show-hide-toggle-mabs">(show less)</span>',
                    '<tpl else>',
                        '<span class="show-hide-toggle-mabs">(show all)</span>',
                    '</tpl>',
                    '</br></br>',
                '</tpl>',

                '<table class="learn-study-info"><tbody>',
                    '<tpl for="monoclonal_antibodies">',
                        '<tpl if="parent.showAll && (xindex &gt; 10)">',
                            '<tr>',
                                '<td class="item-label"><a href="#learn/learn/MAb/{name}">{name:htmlEncode}</a></td>',
                                '<tpl if="label">',
                                    '<td class="item-value" style="padding-right: 1em;">Labeled as: {label:htmlEncode}</td>',
                                '</tpl>',
                            '</tr>',
                        '</tpl>',
                    '</tpl>',
                '</tbody></table>',
            '</tpl>'
    ),

    initComponent : function() {

        var data = this.getListData();
        data['title_related_mabs'] = this.initialConfig.data.title;
        data['showAll'] = this.showAll;
        this.update(data);

        this.callParent();
    },

    hasContent : function() {
        var mabs = this.initialConfig.data.model.get('monoclonal_antibodies');
        if (mabs) {
            return mabs.length > 0;
        }
        return false;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('mab_listing_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-mabs');
    }
});
