/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyRelationships', {

    xtype : 'app.module.studyrelationships',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="relationships && relationships.length &gt; 0">',
                '<h3>{title_study_relationships}</h3>',
                '<table class="learn-study-info">',
                    '<tpl for="relationships">',
                        '<tr>',
                            '<td class="item-value"><a href="#learn/learn/Study/{rel_prot}">{rel_prot_label}</a> ({relationship:htmlEncode})</td>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '</tpl>'
    ),

    scope : this,

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_study_relationships'] = this.initialConfig.data.title;

        this.update(data);
    },

    hasContent : function() {
        var rels = this.initialConfig.data.model.data.relationships;
        if (rels) {
            return rels.length > 0;
        }
        return false;
    }
});
