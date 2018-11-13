/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyMabs', {

    xtype : 'app.module.studymabs',

    extend : 'Ext.view.View',

    cls: 'module',

    mabSectionY: -1,

    tpl : new Ext.XTemplate(
            '<tpl>',

                '<tpl if="monoclonal_antibodies.length &gt; 0">',
                '<h3 id="mab_listing_title" class="mab_listing_title">{title_related_mabs}</h3>',
                '<table class="learn-study-info"><tbody>',
                    '<tpl for="monoclonal_antibodies">',
                        '<tpl if="parent.showAll || (xindex &lt; 11)">',
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
                    '<div class="show-hide-mabs-toggle">',
                    '<tpl if="showAll">',
                    '<span>- SHOW LESS</span>',
                    '<tpl else>',
                    '<span>+ SHOW ALL {monoclonal_antibodies.length}</span>',
                    '</tpl>',
                    '</div>',
                '</tpl>',

            '</tpl>'
    ),
    listeners: {
        render: function(cmp) {
            cmp.registerMabListToggle();
        },
        refresh: function(cmp) {
            cmp.registerMabListToggle(true);
        },
        scope: this
    },

    initComponent : function() {
        if (!this.hasContent()) {
            this.hidden = true;
        }

        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_related_mabs'] = this.initialConfig.data.title;
        data['showAll'] = false;

        this.update(data);

        this.toggleMabListTask = new Ext.util.DelayedTask(this.toggleMabList, this);
    },

    registerMabListToggle: function(scroll) {
        var me = this;
        var expandos = Ext.query('.show-hide-mabs-toggle');
        Ext.each(expandos, function(expando) {
            Ext.get(expando).on('click', function() {
                me.toggleMabListTask.delay(100);
            });
        });
        if (this.mabSectionY > 0) {
            Ext.get('mab_listing_title').el.dom.scrollIntoView()
        }
    },

    toggleMabList: function() {
        this.mabSectionY = 1;
        var data = this.initialConfig.data.model.data;
        data['showAll'] = !data['showAll'];
        this.update(data);
        this.refresh();
    },

    hasContent : function() {
        var mabs = this.initialConfig.data.model.get('monoclonal_antibodies');
        if (mabs) {
            return mabs.length > 0;
        }
        return false;
    }
});
