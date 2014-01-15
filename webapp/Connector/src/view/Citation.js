Ext.define('Connector.view.Citation', {

    extend : 'Ext.Panel',

    alias : 'widget.citation',

    layout : {
        type : 'vbox',
        align: 'stretch'
    },

    cls : 'citationview',

    initComponent : function() {

        this.store = Ext.create('Ext.data.Store', {
            model : 'Connector.model.Citation',
            proxy : {
                type : 'memory',
                reader : {
                    type : 'json',
                    root : 'citations'
                }
            }
        });

        this.items = [
            this.createNorthPanel(),
            this.getCitationPanel()
        ];

        this.callParent();
    },

    createNorthPanel : function() {

        this.citationBtn = Ext.create('Connector.button.RoundedButton', {
            margin  : '10 5 0 0',
            cls     : 'dark',
            text    : 'Citations',
            height  : 30,
            scope   : this,
            hidden  : true,
            handler : function() {
                this.fireEvent('citationrequest');
            }
        });

        return Ext.create('Ext.Panel', {
            ui  : 'custom',
            cls : 'assayNorthDetails',
            height : 150,
            layout  : {
                type : 'hbox',
                align: 'top'
            },
            items : [this.getTitleDisplay(),
                this.citationBtn, {
                    margin  : '10 10 0 0',
                    xtype   : 'roundedbutton',
                    cls     : 'dark',
                    text    : 'Close',
                    height  : 30,
                    scope   : this,
                    handler : function() {
                        this.fireEvent('closedetail', {dimension : this.dimension}, this.getXType());
                        this.src = null;
                        this.updateTitle('Citations');
                        this.fireEvent('destroycitation', this);
                    }
                }
            ]
        });

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
//                                        '<a href="{link}" target="_blank">{title}</a>',
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
        }

        citationTpl.renderReferences = function(references) {
            if (references.length > 0) {
                return '<a class="cite-ref" style="padding-right: 10px;">References</a>';
            }
        };

        citationTpl.renderSources = function(sources) {
            if (sources.length > 0) {
                return '<a class="cite-src">Sources</a>';
            }
        }

        var dataView = Ext.create('Ext.view.View', {
            store : this.store,
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

        this.citationPanel = Ext.create('Ext.Panel', {
            flex        : 1,
            bodyStyle   : 'overflow-y: auto; background-color: #F0F0F0;',
            cls         : 'iScroll',
            ui          : 'custom',
            items       : [dataView]

        });

        return this.citationPanel;
    },

    getTitleDisplay : function() {

        var me = this;

        if (!this.titleDisplay) {

            var bodyTpl = new Ext.XTemplate(
                    '<tpl>',
                    '<div class="nav-label">',
                    '<div class="savetitle assaytitle">{.:this.renderTitle}</div>',
                    '<div class="cite-subtitle">{.:this.renderSrc}</div>',
                    '</div>',
                    '</tpl>'
            );

            bodyTpl.renderTitle = function() {
                return me.title || 'Citations';
            };

            bodyTpl.renderSrc = function() {
                if (me.src) {
                    if (Ext.isString(me.src)) {
                        return Ext.htmlEncode(me.src);
                    }

                    // Should be record of type 'Connector.model.Citation'
                    if (me.src.data) {
                        return 'of \"' + me.src.get('title') + '\"';
                    }
                }
                return '';
            }

            this.titleDisplay = Ext.create('Ext.view.View', {
                ui   : 'custom',
                flex : 1,
                tpl  : bodyTpl,
                store: this.store,
                emptyText : '<div class="nav-label"><div class="savetitle assaytitle">Citations</div><div class="cite-subtitle">Not available for current selection.</div></div>',
                itemSelector : 'div.nav-label'
            });
        }
        return this.titleDisplay;

    },

    handleRequest : function(citations, title, src) {

        if (!citations.citations || citations.citations.length == 0) {
            this.store.removeAll();
        }
        else {
            this.store.loadRawData(citations);
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
        if (this.citationBtn) {
            if (this.title == 'Citations') {
                this.citationBtn.hide();
            }
            else {
                this.citationBtn.show();
            }
        }
        this.getTitleDisplay().refresh();
    }
});