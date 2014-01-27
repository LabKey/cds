/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GroupSave', {

    extend : 'Ext.Panel',

    alias  : 'widget.groupsave',

    initComponent : function() {

        this.items = [];

        // title
        this.items.push({
            xtype : 'box',
            autoEl: {
                tag : 'div',
                cls : 'savetitle',
                html: 'Save group'
            }
        });

        this.items.push(this.getForm());

        this.callParent();

        this.on('show', function() {
            if (this.form) {
                this.form.setDefaultFocus();
                this.onSelectionChange();
            }
        }, this);
    },

    getForm : function() {
        if (this.form)
            return this.form;

        var saveBtn = Ext.create('Connector.button.RoundedButton', {
            itemId: 'dogroupsave',
            ui: 'darkrounded',
            text  : 'Save'
        });

        this.selectText = 'Selection and Active Filters';
        this.filterText = 'Only Active Filters';

        this.form = Ext.create('Ext.form.Panel', {

            ui : 'custom',

            style : 'padding: 8px 0 0 27px',

            layout: {
                align : 'stretch'
            },
            defaults : {
                labelAlign : 'top',
                validateOnBlur   : false,
                validateOnChange : false,
                width : 225
            },

            // fields
            defaultType : 'textfield',
            items : [{
                itemId     : 'groupselection',
                xtype      : 'radiogroup',
                fieldLabel : 'Group selection',
                vertical   : true,
                columns    : 1,
                items      : [
                    {boxLabel : this.selectText, cls: 'withSelectionRadio' , width: 200, name : 'groupselect', inputValue: true, checked : true},
                    {boxLabel : this.filterText, cls: 'filterOnlyRadio', width: 200, name : 'groupselect', inputValue: false}
                ],
                name       : 'groupselect',
                plain      : true,
                allowBlank : false,
                cls        : 'grouptop',
                flex : 1
            },{
                xtype       : 'checkbox',
                itemId      : 'livefilter',
                name        : 'livefilter',
                fieldLabel  : 'Live filter',
                vertical    : 'true'
            },{
                itemId     : 'groupnamefield',
                fieldLabel : 'Subject group name',
                name       : 'groupname',
                plain      : true,
                allowBlank : false,
                cls        : 'grouptop',
                flex : 1
            },{
                xtype      : 'textareafield',
                name       : 'groupdescription',
                hideLabel  : true,
                emptyText  : 'Group description',
                flex : 1
            },{
                xtype : 'box',
                hidden : true,
                itemId : 'error',
                autoEl : {
                    tag : 'div',
                    cls : 'errormsg'
                }
            }],

            // Save and Cancel Buttons
            buttons : [saveBtn,{
                itemId: 'cancelgroupsave',
                xtype : 'roundedbutton',
                ui: 'darkrounded',
                text  : 'Cancel',
                handler : this.clearForm,
                scope : this
            }],
            buttonAlign : 'left',

            setDefaultFocus : function() {
                this.getComponent(1).focus();
            }
        });

        return this.form
    },

    clearForm : function() {
        if (this.form) {
            this.form.getForm().reset();
            this.hideError();
        }
    },

    requestGroupSave : function(group, filters) {
        this.fireEvent('groupsaved', group, filters);
    },

    onSelectionChange : function() {

        var me = this;
        this.state.onMDXReady(function(mdx){

            mdx.queryMultiple([
                {
                    onRows : [ { hierarchy : 'Study', lnum : 0 } ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Subject',
                        plural   : 'Subjects'
                    }
                },{
                    onRows : [ { hierarchy : 'Study', lnum : 0 } ],
                    useNamedFilters : ['statefilter'],
                    label     : {
                        singular : 'Subject',
                        plural   : 'Subjects'
                    }
                }
            ], function(qrArray) {
                var items = me.form.getForm().findField('groupselect').items.items;

                items[0].boxLabelEl.update(me.selectText + ' (' + qrArray[0].cells[0][0].value + ')');
                items[1].boxLabelEl.update(me.filterText + ' (' + qrArray[1].cells[0][0].value + ')');
            });

        }, this);

    },

    showError : function(error) {
        var errorEl = this.form.getComponent('error');
        if (errorEl) {
            errorEl.update(error);
            errorEl.show();
        }
    },

    hideError : function() {
        var errorEl = this.form.getComponent('error');
        if (errorEl) {
            errorEl.hide();
        }
    }
});