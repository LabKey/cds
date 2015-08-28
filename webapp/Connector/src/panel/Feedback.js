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
                width: 520,
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
                    emptyText: 'Describe what you\'re seeing...',
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
                '<div class="main-title">Provide Feedback</div>',
                    '<div class="sub-title">',
                    '<span class="nav-text">Give us feedback on what we could improve</span>',
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
            url: LABKEY.ActionURL.buildURL('issues', 'insert.view'),
            method: 'POST',
            success: callback,
            failure: function() {
                // This will only get called in the event that the server responds with something
                // other than status 200 OK. Normally, a JSON-based API would return 'success' false or the like,
                // however, since this API is HTML-only it will normally return 200 OK even when there are
                // errors since it is trying to let the user re-see the issue in an attempt to rectify their errors.
                Ext.Msg.alert('Failed to save feedback.');
            },
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
                    text: 'Done',
                    handler: function(btn) {
                        var form = this.getForm();

                        //checks whether both the title and comment sections are printed out
                        if (form.isValid()) {
                            btn.disable();
                            btn.setText('Submitting...');

                            var values = form.getValues();
                            this.postFeedback(values.title, values.comment, values.url, values.assignedTo, function(response) {
                                btn.setText('Done');
                                var html = response.responseText;

                                // The issues API only returns HTML views. In the case of a successful creation
                                // of an issue the server responds with a different title than if it fails to save.
                                // This check is to attempt to inspect that the issue was actually created
                                if (html.indexOf('<title>Issue') > -1) {
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