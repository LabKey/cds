/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Feedback', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.feedback',

    cls: 'feedback-panel',

    border: false,

    statics: {
        DEFAULT_ISSUE_USER: 'drienna',
        DEFAULT_ISSUE_PROJECT: 'Feedback',
        displayWindow : function(animateTarget) {
            var resizer = function() {
                this.center();
            };

            var win = Ext.create('Ext.window.Window', {
                ui: 'axiswindow',
                border: false,
                modal: true,
                resizable: false,
                draggable: false,
                header: false,
                layout: {
                    type: 'fit'
                },
                items: [{
                    xtype: 'feedback',
                    listeners: {
                        hide: function() {
                            //removes the listener if the window is hidden so center isnt called for no reason
                            Ext.EventManager.removeResizeListener(resizer, win);
                            win.hide(animateTarget);
                        },
                        scope: this
                    }
                }],
                width: 540,
                height: 600,
                listeners: {
                    afterrender: function(win) {
                        Ext.EventManager.onWindowResize(resizer, win);
                    }
                }
            });
            win.show(animateTarget);
        }
    },

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getForm(),
            this.getFooter()
        ];
        this.callParent();
    },

    getForm : function() {

        if (!this.feedbackForm) {
            this.feedbackForm = Ext.create('Ext.form.Panel', {
                ui: 'custom',
                bodyPadding: 5,
                border: false,
                flex: 1,
                items: [{
                    xtype: 'textfield',
                    name: 'title',
                    emptyText: 'Title',
                    width: '100%',
                    validateOnBlur: false,
                    allowBlank: false
                },{
                    xtype: 'textareafield',
                    name: 'comment',
                    width: '100%',
                    height: '400px',
                    emptyText: 'Description. For a bug, include details that will help us reproduce it.',
                    validateOnBlur: false,
                    allowBlank: false
                },{
                    //If this box is checked the current page url is printed in the comments
                    xtype: 'checkbox',
                    boxLabel: 'Check this box if the issue is on your current screen.',
                    name: 'url',
                    checked: false,
                    inputValue: window.location.href
                },{
                    xtype: 'numberfield',
                    itemId: 'assignedToField',
                    hidden: true,
                    name: 'assignedTo'
                }]
            });

            // Request default issue user information
            this.queryUsers(Connector.panel.Feedback.DEFAULT_ISSUE_USER, function(userInfo) {
                if (Ext.isDefined(userInfo)) {
                    this.feedbackForm.getComponent('assignedToField').setValue(userInfo.UserId);
                }
                else {
                    console.warn('Feedback: Unable to determine default issue user.');
                }
            }, this);
        }

        return this.feedbackForm;
    },

    getHeader : function() {
        if (!this.headerPanel) {
            var initialData = {
                title: this.headerTitle,
                showCount: false,
                border: true
            };

            var tpl = new Ext.XTemplate(
                '<div class="main-title">Give feedback</div>',
                    '<div class="sub-title">',
                    '<span class="nav-text">Tell us what’s valuable, what’s broken, and what you’d like to see next.</span>',
                '</div>'
            );
            this.headerPanel = Ext.create('Ext.panel.Panel', {
                cls: 'header',
                border: false,
                tpl: tpl,
                data: initialData
            });
        }

        return this.headerPanel;
    },

    postFeedback : function(title, comments, url, assignedUserId, callback, scope) {

        var config = {
            url: LABKEY.ActionURL.buildURL('issues', 'insert.view', Connector.panel.Feedback.DEFAULT_ISSUE_PROJECT),
            method: 'POST',
            success: callback,
            failure: callback,
            scope: scope,
            params: {
                issueId: 0,
                action: 'org.labkey.issue.IssuesController$InsertAction',
                title: title,
                priority: 3,
                comment: comments
            }
        };

        if (assignedUserId) {
            config.params.assignedTo = parseInt(assignedUserId);
        }

        if (url) {
            config.params.comment += '\n\n' + url;
        }

        Ext.Ajax.request(config);
    },

    queryUsers: function(userDisplayName, callback, scope) {
        LABKEY.Query.selectRows({
            schemaName: 'core',
            queryName: 'users',
            filterArray: [
                LABKEY.Filter.create('DisplayName', userDisplayName)
            ],
            success: function(data) {

                var userInfo;

                if (data.rows.length > 0) {
                    userInfo = data.rows[0];
                }

                callback.call(scope, userInfo);
            }
        });
    },

    getFooter : function() {
        if (!this.footerPanel) {
            this.footerPanel = Ext.create('Ext.panel.Panel', {
                bodyCls: 'footer',
                border: false,
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    itemId: 'cancel-link',
                    xtype: 'button',
                    ui: 'rounded-inverted-accent-text',
                    hidden: false,
                    text: 'Cancel',
                    handler: function() {
                        this.hide();
                    },
                    scope: this
                },{
                    itemId: 'done-button',
                    xtype: 'button',
                    text: 'Submit',
                    handler: function(btn) {
                        var form = this.getForm();

                        //checks whether both the title and comment sections are printed out
                        if (form.isValid()) {
                            btn.disable();
                            btn.setText('Submitting...');

                            var values = form.getValues();
                            this.postFeedback(values.title, values.comment, values.url, values.assignedTo, function(response) {
                                btn.setText('Done');

                                if (response) {
                                    var html = response.responseText;

                                    // The issues API only returns HTML views. In the case of a successful creation
                                    // of an issue the server responds with a different title than if it fails to save.
                                    // This check is to attempt to inspect that the issue was actually created
                                    if (response.status === 403 || html.indexOf('<title>Issue') > -1) {
                                        this.hide();

                                        var viewManager = Connector.getApplication().getController('Connector');
                                        if (viewManager) {
                                            var fsview = viewManager.getViewInstance('filterstatus');
                                            if (fsview) {
                                                fsview.showMessage('Thanks for your feedback!', true);
                                            }
                                            else {
                                                console.warn('no filterstatus view available');
                                            }
                                        }
                                    }
                                    else {
                                        Ext.Msg.alert('Oops! Looks like something went wrong in gathering your feedback.');
                                    }
                                }

                            }, this);
                        }
                    },
                    scope: this
                }]
            });
        }

        return this.footerPanel;
    }
});