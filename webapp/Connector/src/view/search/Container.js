/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.search.Container', {

    extend : 'Ext.container.Container',

    requires : ['Connector.button.RoundedButton'],

    alias  : 'widget.searchcontainer',

    fieldId : 'search-field',

    emptyText : 'Search',

    btnText : 'go',

    btnUI : 'rounded',

    btnMargin: '0 0 0 3',

    initComponent : function() {
        this.cls = 'search';
        this.layout = 'hbox';

        this.items = [{
            xtype     : 'triggerfield',
            emptyText : this.emptyText,
            width     : 150,
            id        : this.fieldId,
            enableKeyEvents : true,
            hideTrigger: true
        },{
            xtype : 'roundedbutton',
            ui    : this.btnUI,
            text  : this.btnText,
            margin : this.btnMargin
        }];
        this.callParent();
    },

    setEmptyText : function(text) {
        this.items.items[0].emptyText = text;
        if (this.rendered)
            Ext.DomQuery.select('input', this.items.items[0].getEl().id)[0].placeholder = text;
    }
});