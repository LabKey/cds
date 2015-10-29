/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.HelpCenter', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.helpcenter',

    cls: 'helpcenter-panel',

    border: false,

    statics: {
        displayWindow : function(animateTarget) {
            var resizer = function() {
                this.center();
            };
            var me = this;
            var win = Ext.create('Ext.window.Window', {
                ui: 'axiswindow',
                id: 'helppopup',
                border: false,
                modal: true,
                resizable: false,
                draggable: false,
                header: false,
                layout: {
                    type: 'fit'
                },
                items: [{
                    xtype: 'helpcenter',
                    listeners: {
                        hide: function() {
                            //removes the listener if the window is hidden so center isnt called for no reason
                            Ext.EventManager.removeResizeListener(resizer, win);
                            win.hide(animateTarget);
                        },
                        afterrender: function() {
                            HelpRouter.clearHistory();
                            me.prototype.loadHelpFile();
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

            win.mon(Ext.getBody(), 'click', function(el, e){
                win.close(win.closeAction);
            }, win, { delegate: '.x-mask' });
        }
    },

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getForm()
        ];
        this.callParent();

    },

    getForm : function() {

        if (!this.helpcenterBody) {

            var tpl = new Ext.XTemplate(
                    '<h1>Help</h1>'
            );
            var me = this;
            var i=0;
            this.helpcenterBody = Ext.create('Ext.panel.Panel', {
                ui: 'custom',
                id: 'helpcenterbody',
                bodyPadding: 5,
                border: false,
                flex: 1,
                cls: 'helpcenter-body',
                tpl: tpl,
                data: {title:'test'},
                height: '400px',
                setTemplate: function(template) {
                    //this.tpl = new Ext.XTemplate(template);
                    this.update(template, false, function(win) {
                        Ext.select('#helpcenterbody a').each(function(link) {
                            if (link.dom.target.toString().toLowerCase() !== '_blank') {
                               // link.un('click', me.interceptHref);
                                link.on('click', function interceptHref(e) {
                                    console.log("clicked" + i++);
                                    e.preventDefault();
                                    var href = e.target.href;
                                    var params = LABKEY.ActionURL.getParameters(href);
                                    me.loadHelpFile(params.name);
                                },null, {single: true});
                            }
                        })
                    });
                },
                listeners: {
                   //afterlayout: function(win) {
                   //     Ext.select('#helpcenterbody a').each(function(link) {
                   //         if (link.dom.target.toString().toLowerCase() !== '_blank') {
                   //             link.un('click', me.interceptHref)
                   //              link.on('click', function interceptHref(e) {
                   //                  console.log("clicked" + i++);
                   //                 e.preventDefault();
                   //                 var href = e.target.href;
                   //                 var params = LABKEY.ActionURL.getParameters(href);
                   //                 me.loadHelpFile(params.name);
                   //             },null, {single: true});
                   //         }
                   //     })
                   // }
                }
            });
          }

        return this.helpcenterBody;
    },

    //interceptHref: function (e, scope) {
    //    console.log("clicked" + i++);
    //    e.preventDefault();
    //    var href = e.target.href;
    //    var params = LABKEY.ActionURL.getParameters(href);
    //    scope.loadHelpFile(params.name);
    //},

    getHeader : function() {
        if (!this.headerPanel) {
            var initialData = {
                title: this.headerTitle,
                showCount: false,
                border: true
            };

            var tpl = new Ext.XTemplate(
                    '<div class="main-title">Help Center</div>'
            );
            this.headerPanel = Ext.create('Ext.panel.Panel', {
                cls: 'header',
                border: false,
                data: initialData,
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                margin: "0 0 0 0",
                items: [this.getBackArrow(), this.getTitle(), this.getSearchField()]
            });
        }

        return this.headerPanel;
    },

    getHeader2 : function() {
        if (!this.headerPanel) {
            var initialData = {
                title: "Help",
                showBack: true,
                showSearch: true
            };

            var tpl = new Ext.XTemplate(
                    '<div>',
                    '<tpl if="showBack">',
                    '<span class="back-action">',
                    '<span class="arrow">Back</span>',
                    '</span>',
                    '</tpl>',
                    '<span>',
                    '<label id="helptitle" class="helpcenter-title">{title:htmlEncode}</label>',
                    '</span>',
                    '<tpl if="showSearch">',
                    '<span>',
                    '<input id="helpsearchinput" class="helpcenter-search-input" placeholder="Search by name or keywords" type="text"/>',
                    '</span>',
                    '</tpl>',
                    '</div>'
            );

            this.headerPanel = Ext.create('Ext.panel.Panel', {
                cls: 'header',
                tpl: tpl,
                data: initialData,
                listeners: {
                    afterrender: {
                        fn: function(header) {
                            this.bindHeader(header, this.headerData ? this.headerData : initialData);
                        },
                        scope: this,
                        single: true
                    }
                }
            });
        }

        return this.headerPanel;
    },

    getSearchField : function() {
        if (!this.searchField) {
            this.searchField = Ext.create('Ext.form.field.Text', {
                id: 'helpsearchinput',
                emptyText: 'Search by name or keywords',
                cls: 'helpcenter-search-input',
                margin: "0 0 0 55",
                checkChangeBuffer: 500,
                validator: Ext.bind(function(value) {
                    this.fireEvent('searchchanged', value);
                    return true;
                }, this)
            });
        }
        return this.searchField;
    },

    getTitle : function() {
        if (!this.helpTitle) {
            this.helpTitle = Ext.create('Ext.form.Label', {
                id: 'helptitle',
                margin: "0 0 0 5",
                text: 'Help',
                cls: 'helpcenter-title'
            });
        }
        return this.helpTitle;
    },

    getBackArrow : function() {
        if (!this.backArrow) {
            var me = this;
            this.backArrow = Ext.create('Ext.form.Label', {
                id: 'helpback',
                margin: "0 0 0 0",
                html: '<- Back &nbsp; &nbsp; &nbsp; &nbsp;',
                cls: 'helpcenter-back',
                listeners: {
                    afterrender: function() {
                        Ext.getCmp('helpback').getEl().on('click',function(){
                            me.loadHelpFile(null, true);
                        });
                    }
                }
            });
        }
        return this.backArrow;
    },

    loadHelpFile : function(pageName, isBackAction) {
        var helpBackView = Ext.getCmp('helpback');
        var helpTitleView = Ext.getCmp('helptitle');
        var helpBodyView = Ext.getCmp('helpcenterbody');

        if (isBackAction) {
            var pageName = HelpRouter.retrieveHistory();
            if (pageName.wiki || !Ext.isString(pageName.wiki)) {
                pageName = pageName.wiki;
            }
        }

        var me = this;

        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('wiki', 'GetWikiToc'),
            method: 'GET',
            params: {
                currentPage: pageName
            },
            success: function(response) {
                var json = Ext.decode(response.responseText);
               // me.updateHelpContent(json, isBackAction);
                if (isBackAction) {
                    HelpRouter.removeHistory();
                }
                else {
                    HelpRouter.addHelpHistory(pageName);
                }
                var template = me.getHelpTemplate(json, pageName);
                var pageTitle = 'Help Center';
                if (pageName)
                    pageTitle = json.container.wikititle
                helpTitleView.setText(pageTitle);
                helpBodyView.setTemplate(template);
                if (HelpRouter.showBackButton()) {
                    helpBackView.setText('&#8592; Back &nbsp; &nbsp; &nbsp; &nbsp;', false);
                }
                else {
                    helpBackView.setText('');
                }
            },
            scope: this
        });
    },

    getHelpTemplate: function(json, name)
    {
        var pages = json.pages;
//        var name = json.container.wikiname;
        var template = json.container.wikibody;


        if (!name)  // this is the 1st categorical home page
        {
            template = '<div>';
            for (var j = 0; j < pages.length; j++)
            {
                var category = pages[j];
                template += '<h3>' + category.text + '</h3>'; // to do get rid of name
                for (var i = 0; i < category.children.length; i++)
                {

                    var child = category.children[i];
                    template += '<p><a href="' + child.href + '">' + child.text.replace(name, '') + '</a></p>'; // to do get rid of name
                }
            }
            template += '</div>';
        }
        else
        {
            var targetWiki = null;
            for (var i = 0; i < pages.length; i++)
            {
                targetWiki = this.findWikiName(pages[i], name);
                if (targetWiki != null)
                {
                    break;
                }
            }

            if (targetWiki && targetWiki.children)
            {
                // build html body with children nodes
                template = '<div>';
                for (var i = 0; i < targetWiki.children.length; i++)
                {

                    var child = targetWiki.children[i];
                    template += '<p><a href="' + child.href + '">' + child.text.replace(name, '') + '</a></p>'; // to do get rid of name
                }
                template += '</div>';
            }
        }
        return template;

    },

    findWikiName: function (node, name) {
        if (node.name === name)
            return node;
        var children = node.children;
        if (!children)
            return null;
        for (var i = 0; i < children.length; i++) {
            return this.findWikiName(children[i], name);
        }
        return null;
    },

    updateHelpContent: function (json, isBackAction) {
        if (isBackAction) {
            HelpRouter.removeHistory();
        }
        else {
            HelpRouter.addHelpHistory(json.name);
        }
        var me = this;
        var helpBackView = Ext.getCmp('helpback');
        var helpTitleView = Ext.getCmp('helptitle');
        var helpBodyView = Ext.getCmp('helpcenterbody');

        helpTitleView.setText(json.title);
        helpBodyView.setTemplate(json.htmlBody);
        if (HelpRouter.showBackButton()) {
            helpBackView.setText('&#8592; Back &nbsp; &nbsp; &nbsp; &nbsp;', false);
            //helpBackView.on('click', function() {
            //    me.loadHelpFile(null, true);
            //})
        }
        else {
            helpBackView.setText('');
        }
    }
});