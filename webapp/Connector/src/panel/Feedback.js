/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Feedback', {

    extend : 'Ext.window.Window',

    alias : 'widget.feedback',

    cls : 'feedback',

    yOffset : 195,

    constructor : function(config) {

        Ext.applyIf(config, {
            border : false,
            frame  : false,
            ui     : 'custom',
            autoShow : true,
            closable : false,
            resizable : false,
            shadow : false
        });

        Ext.apply(config, this.getPosition());

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [
            this.getForm()
        ];

        this.callParent();

        Ext.EventManager.onWindowResize(this.onResize, this);

        this.resizeTask = new Ext.util.DelayedTask(function(){
            var pos = this.getPosition(true);
            this.setPagePosition(pos.x, pos.y);
        }, this);

        this.on('afterrender', function() {

            // textarea
            var nav = new Ext.util.KeyNav(this.getTextArea(), {
                'esc' : function(e) {
                    this.getForm().getComponent('fbackarea').blur();
                },
                'tab' : function(e) {
                    this.blockBlur = true;
                    this.submit.focus();
                    this.blockBlur = false;
                },
                scope : this
            });

            // button
            var btnNav = new Ext.util.KeyNav(this.submit.getEl(), {
                'tab' : function(e) {
                    this.submit.blur();
                    this.form.getComponent('fbackarea').focus();
                    this.form.getComponent('fbackarea').blur();
                },
                scope : this
            });

        }, this, {single: true});
    },

    getForm : function() {

        if (this.form) {
            return this.form;
        }

        this.submit = Ext.create('Connector.button.RoundedButton', {
            itemId: 'sbmtfback',
            ui: 'darkrounded',
            text  : 'Submit',
            hidden : true,
            handler : this.onSubmit,
            scope : this
        });

        this.form = Ext.create('Ext.form.Panel', {

            ui : 'custom',

            layout : {
                align: 'stretch'
            },

            defaults : {
                labelAlign : 'top',
                validateOnBlur : false,
                validateOnChange : false,
                width : 225
            },

            items : [{
                fieldLabel : 'Feedback',
                labelSeparator : '',
                itemId : 'fbackarea',
                xtype : 'textareafield',
                name  : 'description',
                flex  : 1,
                height: 55,
                plain      : true,
                allowBlank : true,
                emptyText : 'Insights, feature suggestions, bugs...',
                listeners : {
                    afterrender : this.onFeedbackRender,
                    scope : this
                }
            },{
                itemId : 'fbackstate',
                xtype : 'hidden',
                name  : 'state'
            }],

            buttons : [this.submit],
            buttonAlign : 'left'
        });

        this.form.getComponent('fbackarea').on('focus', this.onFormFocus, this);
        this.form.getComponent('fbackarea').on('blur', this.onFormBlur, this);

        return this.form;
    },

    onFeedbackRender : function(field) {
        var label = Ext.DomQuery.select('label', field.getEl()['id']);
        if (label && label.length > 0) {
            Ext.get(label[0]).applyStyles('float: left;');
            Ext.DomHelper.insertAfter(label[0], {
                tag    : 'a',
                html   : 'Take our survey',
                cls    : 'survey',
                target : '_blank',
                href   : 'https://www.surveymonkey.com/s/CZ56XTF'
            })
        }
    },

    getPosition : function(recalc) {

        if (!recalc && this.posCache) {
            return this.posCache
        }

        var win = {
            x : window.outerWidth,
            y : window.outerHeight
        };

        this.posCache = {
            x : win.x-(290-13),
            y : win.y-this.yOffset
        };

        return this.posCache;
    },

    onFormFocus : function() {

        if (!this.submit.isVisible()) {

            this.getEl().animate({
                to : {
                    y : this.getPosition().y-this.yOffset
                },
                listeners : {
                    afteranimate : function() {
                        this.getForm().getComponent('fbackarea').setHeight(200);
                        this.submit.show();
                    },
                    scope : this
                },
                scope : this
            });
        }
    },

    onFormBlur : function() {

        if (this.blockBlur) {
            return;
        }

        if (this.submit.isVisible) {

            this.getEl().animate({
                delay : 150,
                to : {
                    y : this.getPosition().y
                },
                listeners : {
                    beforeanimate : function(anim) {
                        if (!this.buttonpress) {
                            this.getForm().getComponent('fbackarea').setHeight(55);
                            this.submit.hide();
                        }
                        else {
                            anim.end();
                            return false;
                        }
                    },
                    scope : this
                },
                scope : this
            });
        }
    },

    onResize : function() {
        this.onFormBlur();
        this.resizeTask.delay(500);
    },

    beforeSubmit : function() {
        var text = 'Submitting';
        var val  = '.', count = 1, ellip;
        var me = this;
        var textSubmit = function() {
            ellip = '';
            for (var x=0; x < count; x++){
                ellip += val;
            }
            for (x=count; x < 3; x++) {
                ellip += '&nbsp';
            }

            count >= 3 ? count = 1 : count++;
            me.submit.setText(text + ellip);
        };

        this.task = {
            run : textSubmit,
            interval : 350
        };

        this.runner = new Ext.util.TaskRunner();
        this.runner.start(this.task);
    },

    onSubmit : function() {
        this.buttonpress = true;

        this.beforeSubmit();

        var state = this.form.getComponent('fbackstate');
        if (state && this.getState) {
            state.setValue(Ext.encode(this.getState().data));
        }

        if (this.form.getValues().description.length > 0) {
            LABKEY.Query.insertRows({
                schemaName : 'CDS',
                queryName  : 'feedback',
                rows : [this.getForm().getValues()],
                success : function(response) {
                    this.afterSubmit();
                },
                failure : function(response) {
                    console.warn('Failed to post feedback.');
                    this.afterSubmit();
                },
                scope : this
            });
        }
        else {
            this.afterSubmit();
        }
    },

    afterSubmit : function() {
        if (this.runner && this.task) {
            this.runner.stop(this.task);
        }

        this.submit.setText('Thank You!');
        this.getForm().getComponent('fbackarea').reset();
        this.setEmptyText('Thank you for your feedback!');

        var wrapupTask = new Ext.util.DelayedTask(function() {
            this.buttonpress = false;
            this.onFormBlur();
            this.submit.setText('Submit');
        }, this);
        wrapupTask.delay(1250);
    },

    getTextArea : function() {
        return Ext.DomQuery.select('textarea[name=description]', this.getForm().items.items[0].getEl().id)[0];
    },

    setEmptyText : function(text) {
        this.getForm().items.items[0].emptyText = text;
        if (this.rendered) {
            this.getTextArea().placeholder = text;
        }
    }
});