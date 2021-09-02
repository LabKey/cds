/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyPublications', {

    xtype : 'app.module.studypublications',

    extend : 'Connector.view.module.ShowList',

    plugins : ['documentvalidation'],

    showAll : false,

    tpl : new Ext.XTemplate(
            '<tpl>',
                '<tpl if="publications && publications.length &gt; 0">',
                    '<h3  id="pub_listing_title" class="listing_title">{title_study_publications}</h3>',
                    '<table class="learn-study-info">',
                        '<tpl for="publications">',
                            '<tpl if="xindex &lt; 11">',
                                '<tr>',
                                    '<td class="item-value">',
                                    '<tpl if="label">',
                                        '{[this.getPublicationLink(values)]}',
                                    '</tpl>',
                                    '{authors:htmlEncode}. {title:htmlEncode}. {journal:htmlEncode}. {date:htmlEncode}',
                                    '<tpl if="volume || issue">',
                                        ';',
                                    '</tpl>',
                                    '<tpl if="volume">',
                                        '{volume}',
                                    '</tpl>',
                                    '<tpl if="issue">',
                                        '({issue:htmlEncode})',
                                    '</tpl>',
                                    '<tpl if="location">',
                                        ':{location:htmlEncode}. ',
                                    '<tpl else>',
                                        '. ',
                                    '</tpl>',
                                    '<tpl if="pmid">',
                                        'PMID: {pmid:htmlEncode}. ',
                                    '</tpl>',
                                    '<tpl if="link">',
                                            '<a href="{link}" target="_blank">View in PubMed <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a></td>',
                                    '</tpl>',
                                '</tr>',
                            '</tpl>',
                        '</tpl>',
                    '</table>',


                    '<tpl if="publications.length &gt; 10">',
                        'and {publications.length - 10} more ',
                        '<tpl if="showAll">',
                            '<span class="show-hide-toggle-pub">(show less)</span>',
                        '<tpl else>',
                            '<span class="show-hide-toggle-pub">(show all)</span>',
                        '</tpl>',
                        '</br></br>',
                    '</tpl>',

                    '<tpl if="publications.length &gt; 10">',
                        '<table class="learn-study-info">',
                            '<tpl for="publications">',
                                '<tpl if="parent.showAll && (xindex &gt; 10)">',
                                    '<tr>',
                                        '<td class="item-value">',
                                        '<tpl if="label">',
                                            '<a href="#learn/learn/Publication/{id}">{label:htmlEncode}: </a>',
                                        '</tpl>',
                                        '{authors:htmlEncode}. {title:htmlEncode}. {journal:htmlEncode}. {date:htmlEncode}',
                                        '<tpl if="volume || issue">',
                                            ';',
                                        '</tpl>',
                                        '<tpl if="volume">',
                                            '{volume}',
                                        '</tpl>',
                                        '<tpl if="issue">',
                                            '({issue:htmlEncode})',
                                        '</tpl>',
                                        '<tpl if="location">',
                                            ':{location:htmlEncode}. ',
                                        '<tpl else>',
                                            '. ',
                                        '</tpl>',
                                        '<tpl if="pmid">',
                                            'PMID: {pmid:htmlEncode}. ',
                                        '</tpl>',
                                        '<tpl if="link">',
                                            '<a href="{link}" target="_blank">View in PubMed <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a></td>',
                                        '</tpl>',
                                    '</tr>',
                                '</tpl>',
                            '</tpl>',
                        '</table>',

                '</tpl>',
            '</tpl>',
            {
                getPublicationLink : function(row) {
                    let link = '<a href="#learn/learn/Publication/';

                    link += row.id;
                    link += '">';
                    link += Ext.htmlEncode(row.label);
                    if (row.available_data_count > 0) {
                        // add the non-integrated data available icon
                        link += '<img class="detail-has-data-very-small" src="' + Connector.resourceContext.path + '/images/learn/ni-added.svg"/>';
                    }
                    link += ': </a>';

                    return link;
                }
            }
    ),

    initComponent : function() {
        var data = this.getListData();
        data['title_study_publications'] = this.initialConfig.data.title;
        data['showAll'] = this.showAll;
        this.update(data);

        this.callParent();
    },

    hasContent : function() {
        var pubs = this.initialConfig.data.model.data.publications;
        if (pubs) {
            return pubs.length > 0;
        }
        return false;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('pub_listing_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-pub');
    }
});
