/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyPublications', {

    xtype : 'app.module.studypublications',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="publications && publications.length &gt; 0">',
                Connector.constant.Templates.module.title,
                '<table class="learn-study-info">',
                    '<tpl for="publications">',
                        '<tr>',
                            '<tpl if="isLinkValid">',
                                '<td class="item-value"><a href="{fileName}">{label:htmlEncode} {suffix}</a></td>',
                            '<tpl else>',
                                '<td class="item-value">{label:htmlEncode}</td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;

        this.on("afterrender", function() {
            this.validateDocLinks(data.publications, data);
            this.update(data);
        }, this);
        this.update(data);
    }
});
