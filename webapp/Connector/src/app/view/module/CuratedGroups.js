/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.CuratedGroups', {

    xtype : 'app.module.curatedgroups',

    extend : 'Connector.view.module.ShowList',

    showAll: false,

    tpl : new Ext.XTemplate(
            '<tpl>',
            '<tpl if="curated_groups && curated_groups.length &gt; 0">',
                '<h3 id="curated_groups_title" class="listing_title">{curated_groups_title}</h3>',
                    '<table class="learn-study-info">',
                        '<tpl for="curated_groups">',
                            '<tr><td>',
                                '<div class="item-row">',
                                    '<tpl if="label">',
                                        '<a href="#group/groupsummary/{cds_saved_group_id}">{label:htmlEncode}</a>',
                                    '</tpl>',
                                '</div>',
                            '</td></tr>',
                        '</tpl>',
                    '</table>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {
        var data = this.getListData();
        data['curated_groups_title'] = this.initialConfig.data.title;
        this.update(data);

        this.callParent();
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    hasContent : function() {
        var d = this.getListData();
        return d["curated_groups"].length > 0;
    }
});
