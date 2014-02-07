Ext.define('Connector.view.Citation', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.citation',

    layout : {
        type : 'vbox',
        align: 'stretch'
    },

    cls: 'citationview',

    defaultTitle: 'Citations',

    initComponent : function() {

        this.items = [
            {
                xtype: 'panel',
                ui: 'custom',
                cls: 'assayNorthDetails',
                height: 161,
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                items : [
                    this.getTitleDisplay(),
                    this.getCitationButton(),
                    {
                        margin  : '10 10 0 0',
                        xtype   : 'roundedbutton',
                        ui: 'darkrounded',
                        text: 'Close',
                        height: 30,
                        handler : function() {
                            this.fireEvent('closedetail', {dimension : this.dimension}, this.getXType());
                            this.src = null;
                            this.updateTitle(this.defaultTitle);
                            this.fireEvent('destroycitation', this);
                        },
                        scope: this
                    }
                ]
            },
            this.getCitationPanel()
        ];

        this.callParent();
    },

    getCitationButton : function() {

        if (!this.citationBtn) {
            this.citationBtn = Ext.create('Connector.button.RoundedButton', {
                margin: '10 5 0 0',
                ui: 'darkrounded',
                text: 'Citations',
                height: 30,
                hidden: true,
                handler : function() {
                    this.fireEvent('citationrequest');
                },
                scope: this
            });
        }
        return this.citationBtn;
    },

    getCitationPanel : function() {

        if (this.citationPanel) {
            return this.citationPanel;
        }

        var citationTpl = new Ext.XTemplate(
                '<ol style="list-style-type:upper-roman;">',
                    '<tpl for=".">',
                        '<li>',
                            '<div class="cite-block">',
                                '<div class="inner">',
                                    '<div class="cite-title">',
                                        '<tpl if="link != null && link != undefined">',
                                            '<a href="{link}" target="_blank">{title}</a>',
                                        '</tpl>',
                                        '<tpl if="link == null && link == undefined">',
                                            '<span>{title}</span>',
                                        '</tpl>',
                                    '</div>',
                                    '<div class="cite-authors">{authors:this.renderAuthors}</div>',
                                    '<div class="cite-des">{description:this.renderDescription}</div>',
                                    '<div class="cite-refer">',
                                        '{references:this.renderReferences}',
                                        '{dataSources:this.renderSources}',
                                    '</div>',
                                '</div>',
                            '</div>',
                        '</li>',
                    '</tpl>',
                '</ol>'
        );

        citationTpl.renderAuthors = function(authors) {
            var auth = '', sep = '';
            for (var a=0; a < authors.length; a++) {
                auth += sep + authors[a];
                sep = ', ';
            }
            return auth;
        };

        citationTpl.renderDescription = function(val) {
            return Ext.String.ellipsis(val, 250, true);
        };

        citationTpl.renderReferences = function(references) {
            var render = '';
            if (references.length > 0) {
                render = '<a class="cite-ref" style="padding-right: 10px;">References</a>';
            }
            return render;
        };

        citationTpl.renderSources = function(sources) {
            var render = '';
            if (sources.length > 0) {
                render = '<a class="cite-src">Sources</a>';
            }
            return render;
        };

        var dataView = Ext.create('Ext.view.View', {
            store : this.getStore(),
            flex : 1,
            ui : 'custom',
            tpl : citationTpl,
            itemSelector : 'div.cite-block',
            listeners : {
                itemclick : function(view, rec, html, index, e, eOpts) {
                    if (Ext.get(e.target).hasCls('cite-ref')) {
                        this.fireEvent('referencerequest', rec);
                    }
                    else if (Ext.get(e.target).hasCls('cite-src')) {
                        this.fireEvent('sourcerequest', rec);
                    }
                },
                scope : this
            },
            scope : this
        });

        this.citationPanel = Ext.create('Ext.panel.Panel', {
            ui: 'custom',
            flex: 1,
            bodyStyle: 'overflow-y: auto; background-color: #F0F0F0;',
            cls: 'iScroll',
            items: [dataView]

        });

        return this.citationPanel;
    },

    getStore : function() {
        if (!this.store) {
            this.store = Ext.create('Ext.data.Store', {
                model: 'Connector.model.Citation',
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        root: 'citations'
                    }
                }
            });
        }

        return this.store;
    },

    getTitleDisplay : function() {

        if (!this.titleDisplay) {

            var me = this;

            var bodyTpl = new Ext.XTemplate(
                    '<tpl>',
                        '<div class="nav-label">',
                            '<div class="savetitle assaytitle">{.:this.renderTitle}</div>',
                            '<div class="cite-subtitle">{.:this.renderSrc}</div>',
                        '</div>',
                    '</tpl>',
                    {
                        renderSrc : function() {
                            var render = '';
                            if (me.src) {
                                if (Ext.isString(me.src)) {
                                    render = Ext.htmlEncode(me.src);
                                }
                                else if (me.src.data) {
                                    // Should be record of type 'Connector.model.Citation'
                                    render = 'of \"' + me.src.get('title') + '\"';
                                }
                            }
                            return render;
                        },
                        renderTitle : function() {
                            return me.title || me.defaultTitle;
                        }
                    }
            );

            this.titleDisplay = Ext.create('Ext.view.View', {
                ui: 'custom',
                flex: 1,
                tpl: bodyTpl,
                store: this.getStore(),
//                emptyText: '<div class="nav-label"><div class="savetitle assaytitle">' + this.defaultTitle + '</div><div class="cite-subtitle">Not available for current selection.</div></div>',
                itemSelector: 'div.nav-label'
            });
        }

        return this.titleDisplay;
    },

    handleRequest : function(citations, title, src) {

        if (!citations.citations || citations.citations.length == 0) {
            this.getStore().removeAll();
        }
        else {
            this.getStore().loadRawData(citations);
        }

        if (src) {
            this.src = src;
        }

        if (title) {
            this.updateTitle(title);
        }
    },

    updateTitle : function(title) {
        this.title = title;
        var btn = this.getCitationButton();
        if (btn) {
            if (this.title == this.defaultTitle) {
                btn.hide();
            }
            else {
                btn.show();
            }
        }
        this.getTitleDisplay().refresh();
    }
});