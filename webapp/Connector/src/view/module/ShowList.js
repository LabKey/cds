/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ShowList', {

    extend : 'Ext.view.View',

    sectionY: -1,

    listeners: {
        render: function(cmp) {
            cmp.registerListToggle();
        },
        refresh: function(cmp) {
            cmp.registerListToggle(true);
        },
        scope: this
    },

    initComponent : function() {

        if (!this.hasContent()) {
            this.hidden = true;
        }

        this.callParent();

        var data = this.getListData();

        data['showAll'] = false;

        this.update(data);

        this.toggleListTask = new Ext.util.DelayedTask(this.toggleList, this);
    },

    registerListToggle: function(scroll) {

        var me = this;
        var expandos = Ext.query('.show-hide-toggle');

        if (this.sectionY > 0) {
            this.scrollListIntoView();
        }

        Ext.each(expandos, function(expando) {
            Ext.get(expando).on('click', function() {
                me.toggleListTask.delay(100);
            });
        });
    },

    toggleList: function() {
        this.sectionY = 1;
        var data = this.getListData();
        data['showAll'] = !data['showAll'];
        this.update(data);
        this.refresh();
    },

    hasContent : function() {
        return false;
    },

    getListData: function () {
        return null;
    },

    scrollListIntoView : function () {
    }
});
