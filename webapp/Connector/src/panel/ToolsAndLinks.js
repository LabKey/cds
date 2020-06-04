/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.ToolsAndLinks', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.toolslinks',

    cls: 'toolslinks-panel',

    border: false,

    statics: {
        DEFAULT_TOOLS_WIKI: '_dataspace_tools',
        DEFAULT_EMPTY_TOOLS_WIKI_CONTENT: 'No tools or links available',
        displayWindow : function(animateTarget) {
            var config = {
                id: 'toolspopup',
                items: [{
                    xtype: 'toolslinks'
                }]
            };
            Connector.panel.HelpCenter.displayWikiWindow(animateTarget, config);
        }
    },

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getForm()
        ];
        this.callParent();

    },

    getHeader : function() {
        if (!this.headerPanel) {
            this.headerPanel = Ext.create('Ext.panel.Panel', {
                cls: 'header',
                border: false,
                items: [{
                    xtype: 'label',
                    margin: "0 0 0 5",
                    text: 'Tools & links',
                    cls: 'toolslinks-title'
                }]
            });
        }

        return this.headerPanel;
    },

    getForm : function() {
        if (!this.toolsForm) {
            this.toolsForm = Ext.create('Ext.form.Panel', {
                ui: 'custom',
                id: 'toolspopupbody',
                bodyPadding: 5,
                border: false,
                flex: 1,
                cls: 'toolslinks-body',
                height: '400px',
                listeners: {
                    render: function(cmp) {
                        Ext.Ajax.request({
                            url: LABKEY.ActionURL.buildURL('wiki', 'getWikiToc'),
                            method: 'GET',
                            params: {
                                currentPage: Connector.panel.ToolsAndLinks.DEFAULT_TOOLS_WIKI
                            },
                            success: function (response) {
                                var json = Ext.decode(response.responseText);
                                var wikiHtml = json.container.wikihtml;
                                if (!wikiHtml)
                                    wikiHtml = Connector.panel.ToolsAndLinks.DEFAULT_EMPTY_TOOLS_WIKI_CONTENT;
                                cmp.update(wikiHtml, false, function(win) {
                                    Ext.select('#toolspopupbody a').each(function(link) {
                                        link.dom.target = '_blank';
                                    });
                                });
                            }
                        })
                    },
                    scope: this
                }
            });
        }

        return this.toolsForm;
    }

});