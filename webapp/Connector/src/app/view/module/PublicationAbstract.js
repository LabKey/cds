/*
 * Copyright (c) 2022 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.PublicationAbstract', {

    xtype : 'app.module.publicationabstract',

    extend : 'Connector.view.module.ShowList',

    showAll : false,

    numCharactersToShow : 800,

    tpl : new Ext.XTemplate(
            '<tpl>',
                '<tpl if="publication_abstract != null">',
                    '<h3 id="pub-abstract-title" class="listing_title">{publication_abstract_title}</h3>',
                    '<tpl if="isAbstractLengthUnderLimit">',
                        '<p>{publication_abstract:htmlEncode}</p>',
                    '<tpl else>',
                        '<div>',
                            '<p>{initialDisplayCharacters:htmlEncode}</p>',
                            '</br>',
                            '<tpl if="showAll">',
                                '<span class="show-hide-toggle-pub-abstract">(show less)</span>',
                            '<tpl else>',
                                '<span class="show-hide-toggle-pub-abstract">(show all)</span>',
                            '</tpl>',
                            '</br></br>',
                            '<tpl if="showAll">',
                                '<p>{remainingDisplayCharacters:htmlEncode}</p>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {

        let data = this.getListData();
        data['publication_abstract_title'] = this.initialConfig.data.title;
        data['showAll'] = this.showAll;

        let publication_abstract = data['publication_abstract'];
        if (null != publication_abstract) {
            data['isAbstractLengthUnderLimit'] = publication_abstract.length <= this.numCharactersToShow;
            data['initialDisplayCharacters'] = publication_abstract.substring(0, this.numCharactersToShow);
            data['remainingDisplayCharacters'] = publication_abstract.substring(this.numCharactersToShow);
        }

        this.update(data);
        this.callParent();
    },

    hasContent : function() {
        let pub_abstract = this.initialConfig.data.model.get('publication_abstract');
        return pub_abstract != null;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('pub-abstract-title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-pub-abstract');
    }
});
