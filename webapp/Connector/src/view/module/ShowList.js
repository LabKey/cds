/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ShowList', {

    extend : 'Ext.view.View',

    sectionY: -1,

    cls: 'module',

    listeners: {
        render: function(cmp) {
            // treatmentschemagroup component's documentvalidation plugin is somehow interfering with registeringListToggle,
            // hence have to put a timeout
            if (cmp.xtype === "app.module.treatmentschemagroup") {
                setTimeout(function(){
                    cmp.registerListToggle();
                }, 500);
            }
            else {
                cmp.registerListToggle();
            }
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
        this.toggleListTask = new Ext.util.DelayedTask(this.toggleList, this);
    },

    registerListToggle: function() {

        var me = this;
        var expandos = this.getToggleId();

        Ext.each(expandos, function(expando) {
            Ext.get(expando).on('click', function() {
                me.toggleListTask.delay(100);
            });
        });

        if (this.sectionY > 0) {
            this.scrollListIntoView();
        }
    },

    toggleList: function() {
        this.sectionY = 1;
        var data = this.getListData();
        this.showAll = !this.showAll;
        data['showAll'] = this.showAll;
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
    },

    getToggleId : function() {
    }
});
