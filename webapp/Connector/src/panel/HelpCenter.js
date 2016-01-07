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
                        afterrender: function(me) {
                            HelpRouter.clearHistory();
                            me.loadHelpFile();
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

            // when click outside popup, first hide so that animate works, then close so that layout is correct when re-created..
            win.mon(Ext.getBody(), 'click', function(el, e){
                win.hide(animateTarget, function() {
                    this.fireEvent('close', this);
                    this.destroy();
                }, this);
             //   win.close(win.closeAction);
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
            var me = this;
            this.helpcenterBody = Ext.create('Ext.panel.Panel', {
                ui: 'custom',
                id: 'helpcenterbody',
                bodyPadding: 5,
                border: false,
                flex: 1,
                cls: 'helpcenter-body',
                height: '400px',
                setTemplate: function(template) {
                    this.update(template, false, function(win) {
                        var wikiController = 'wiki';
                        var currentContainer = encodeURIComponent(LABKEY.ActionURL.getContainerName());
                        Ext.select('#helpcenterbody a').each(function(link) {
                            // if target _blank, open in new tab, no link hijacking
                            if (link.dom.target.toString().toLowerCase() !== '_blank') {
                                var href = link.dom.href;
                                if (href.indexOf(currentContainer) > 0 && href.indexOf(wikiController) > 0) {
                                    var wikiName;
                                    if (href.indexOf('download.view') > 0) {
                                        // no hijacking for attachments
                                        return;
                                    }
                                    var params = LABKEY.ActionURL.getParameters(href);
                                    wikiName = params.name;
                                    link.on('mouseup', function interceptHref(e){
                                        e.preventDefault();
                                        me.loadHelpFile(wikiName);
                                    }, null, {single: true});
                                    link.on('click', function interceptHref(e){
                                        e.preventDefault();
                                    }, null, {single: true});
                                }
                                else {
                                    // this is an external link or non-wiki link, force open in a new tab
                                    link.dom.target = '_blank';
                                }
                            }
                        })
                    });
                }
            });
          }

        return this.helpcenterBody;
    },

    getHeader : function() {
        if (!this.headerPanel) {
            this.headerPanel = Ext.create('Connector.panel.HelpCenterHeader', {
                cls: 'header',
                border: false,
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                margin: "0 0 0 0",

                listeners: {
                    helpsearchchanged: this.onSearchChange,
                    backbuttonclicked: this.loadHelpFile,
                    scope: this
                }
            });
        }

        return this.headerPanel;
    },

    onSearchChange: function (searchKey) {
        if (searchKey !== HelpRouter.getSearchKey()) {
            if (searchKey !== ''){
                this.loadSearch(searchKey, false);
            }
            else {
                this.loadHelpFile(null, false); // show home page if search string is blank
            }
        }
    },

    loadSearch: function(searchKey, isBackAction) {
        var me = this;
        var query = [searchKey];
        var helpBackView = Ext.getCmp('helpback');
        var helpSearchElement = Ext.get('helpsearchinput');
        var helpTitleView = Ext.getCmp('helptitle');
        var helpBodyView = Ext.getCmp('helpcenterbody');
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('search', 'json'),
            method: 'GET',
            params: {
                q: query,
                scope: 'FolderAndSubfolders',
                includeHelpLink: false,
                category: 'Wiki'
            },
            success: function(response) {
                var json = Ext.decode(response.responseText);
                if (isBackAction) {
                    HelpRouter.removeHistory();
                }
                else {
                    HelpRouter.addSearchHistory(searchKey);
                }

                helpTitleView.setText('Help Center');
                helpBodyView.setTemplate(me.getSearchTemplate(json));
                helpBackView.setText('');
                helpSearchElement.dom.style.display = 'table';
            },
            scope: me
        });
    },

    getSearchTemplate: function (json) {
        var template = '<div>';
        if (!json || !json.hits || json.hits.length <= 0) {
            template += '<p style="color: #969696;" class="searchresult">0 results</p></div>';
            return template;
        }
        var hits = json.hits;
        var validCount = 0; //results other than wiki are returned (such as attachments in wiki), need to manually filter.
        for (var i = 0; i < hits.length; i++) {
            var hit = hits[i];
            if (hit.id && hit.id.indexOf('wiki') === 0) {
                validCount++;
            }
        }

        template = '<p style="color: #969696;" class="searchresult">' + validCount + ' results</p>';

        for (var i = 0; i < hits.length; i++) {
            var hit = hits[i];
            if (hit.id && hit.id.indexOf('wiki') === 0) {
                template += '<p class="searchresult"><a href="' + hit.url + '">' + hit.title + '</a></p>';
            }
        }

        template += '</div>';
        return template;
    },


    loadHelpFile : function(pageName, isBackAction) {
        if (isBackAction) {
            var history = HelpRouter.retrieveHistory();
            if (history.search) {
                this.loadSearch(history.search, isBackAction);
            }
            else if (history.wiki || !Ext.isString(history.wiki)) {
                history = history.wiki;
                this.loadWiki(history, isBackAction);
            }

            return;
        }

        this.loadWiki(pageName, isBackAction);
    },

    loadWiki: function(pageName, isBackAction) {
        var me = this;
        var helpBackView = Ext.getCmp('helpback');
        var helpSearchElement = Ext.get('helpsearchinput');
        var helpTitleView = Ext.getCmp('helptitle');
        var helpBodyView = Ext.getCmp('helpcenterbody');
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('wiki', 'getWikiToc'),
            method: 'GET',
            params: {
                currentPage: pageName
            },
            success: function(response) {
                var json = Ext.decode(response.responseText);

                if (isBackAction) {
                    HelpRouter.removeHistory();
                }
                else {
                    HelpRouter.addHelpHistory(pageName);
                }
                var template = me.getHelpTemplate(json, pageName);
                var pageTitle = 'Help Center';
                if (pageName) {
                    pageTitle = Ext.htmlDecode(json.container.wikititle);
                }
                helpTitleView.setText(pageTitle);
                helpBodyView.setTemplate(template);
                if (HelpRouter.showBackButton()) {
                    helpBackView.setText('&nbsp; &#8592; Back &nbsp; &nbsp; &nbsp;', false);
                    helpSearchElement.dom.style.display = 'none';
                }
                else {
                    helpBackView.setText('');
                    helpSearchElement.dom.style.display = 'table';
                }
            },
            scope: me
        });
    },

    getHelpTemplate: function(json, name) {
        var pages = json.pages;
        var template = json.container.wikihtml; // display wiki body, unless current wiki has children wiki, then display children

        if (!name)  {
            // the home view is a summary for all categories
            template = this.getMainCategoricalView(pages);
        }
        else {
            template = this.getSubCategoricalView(template, pages, name);
        }
        return template;

    },

    getMainCategoricalView: function (pages) {
        if (!pages) {
            return '';
        }
        var template = '<div>';
        //template += '<p><span style="font-size: 13px;font-weight: 500">The help center will have answers to FQA, ';
        //template += 'How to articles and videos added regularly. Below is a few articles to help get you started.</span></p>';
        template += '<table>';
        template += '<tbody>';
        template += '<tr valign="top">';
        template += '<td width="220px">';

        for (var j = 0; j < Math.ceil((pages.length) / 2.0); j++) {
            template += this.buildIndividualCategory(pages[j]);
        }
        template += '</td>';
        template += '<td width="30px">&nbsp;</td>';
        template += '<td width="220px">';
        for (; j < pages.length; j++)
        {
            template += this.buildIndividualCategory(pages[j]);
        }
        template += '</td>';
        template += '</tr>';
        template += '</tbody>';
        template += '</table>';
        template += '</div>';
        return template;
    },

    buildIndividualCategory: function (category) {
        var template = '<h3>' + Ext.htmlEncode(category.text.replace('(' + category.name + ')', '')) + '</h3>',
            child;

        if (category.children) {
            for (var i=0; i < category.children.length; i++) {
                if (i > 4) {
                    template += '<p><a class="see-all" href="' + category.href + '">' + 'See all' + '</a></p>';
                    break;
                }

                child = category.children[i];
                template += '<p><a href="' + child.href + '">' + Ext.htmlEncode(child.text.replace('(' + child.name + ')', '')) + '</a></p>';
            }
        }

        return template;
    },

    getSubCategoricalView: function (originalTemplate, pages, name) {
        var targetWiki = null;
        var template = originalTemplate; // if there are no children wiki for the current page, use wikihtml as content
        for (var i = 0; i < pages.length; i++) {
            targetWiki = this.findWikiName(pages[i], name);
            if (targetWiki != null) {
                break;
            }
        }
        if (targetWiki && targetWiki.children)  {
            template = '<div>';
            for (var i = 0; i < targetWiki.children.length; i++) {
                var child = targetWiki.children[i];
                template += '<p><a href="' + child.href + '">' + Ext.htmlEncode(child.text.replace('(' + child.name + ')', '')) + '</a></p>';
            }
            template += '</div>';
        }
        return template;
    },

    findWikiName: function (node, name) {
        if (node.name === name)
            return node;
        var children = node.children;
        if (!children)
            return null;
        var targetWiki = null;
        for (var i = 0; i < children.length; i++) {
            targetWiki = this.findWikiName(children[i], name);
            if (targetWiki != null) {
                return targetWiki;
            }
        }
        return null;
    }

});

Ext.define('Connector.panel.HelpCenterHeader', {
    extend: 'Ext.panel.Panel',
    initComponent: function() {
        this.items = [this.getBackArrow(), this.getTitle(), this.getSearchField()];

        this.callParent();
        this.addEvents('helpsearchchanged', 'backbuttonclicked');
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
                    this.fireEvent('helpsearchchanged', value);
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
                html: '&nbsp; <- Back &nbsp; &nbsp; &nbsp;',
                cls: 'helpcenter-back',
                listeners: {
                    afterrender: function() {
                        Ext.getCmp('helpback').getEl().on('click',function(){
                            me.fireEvent('backbuttonclicked', null, true);
                        });
                    }
                }
            });
        }
        return this.backArrow;
    }

});