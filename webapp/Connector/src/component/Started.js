/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.Started', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.cds-started',

    statics: {
        DISMISS_PROPERTY: 'showIntro'
    },

    tpl: new Ext.XTemplate(
            '<div class="expanded-intro" id="expanded-intro-div"',
                '<tpl if="showIntro==false">',
                    ' style="display: none !important;"',
                '</tpl>',
            '>',
                '<h1 class="section-title bottom-spacer">Get Started!</h1>',
                '<a id="hidelink" href="#" onclick="return false;" style="float: right; padding-right: 28px;" class="started-dismiss">Hide</a>',
                    '<tpl if="videoURL">',
                        '<div class="get-started"',
                        '<tpl if="multiRow">',
                            ' style="height: 610px; margin-left: auto; margin-right: auto;"',
                        '<tpl else>',
                            ' style="height: 310px; margin-left: auto; margin-right: auto;"',
                        '</tpl>',
                        '>',
                        '<div class="tile-group">',
                            '<div class="tile" onclick="location.href=\'#learn\'">',
                                '<span class="tile-title">Answer questions</span>',
                                '<span class="home_text backgroundimage"></span>',
                                '<span class="tile-detail">Learn about of [number of studies with metadata] CAVD studies, [number] products, and [number] assays.</span>',
                            '</div>',
                            '<div class="tile right-tile" onclick="location.href=\'#explorer/singleaxis/Study%20Product/Product%20Class\'">',
                                '<span class="tile-title">Find a cohort</span>',
                                '<span class="home_bar backgroundimage"></span>',
                                '<span class="tile-detail">Find subjects based on attributes that span studies.</span>',
                            '</div>',
                        '</div>',

                        '<div class="tile-group">',
                            '<div class="tile" onclick="location.href=\'#chart\'">',
                                '<span class="tile-title">Explore relationships</span>',
                                '<span class="home_plot backgroundimage"></span>',
                                '<span class="tile-detail">Plot assay results across [number of studies with data] studies and years of research.</span>',
                            '</div>',
                            '<div id="home-video" class="tile right-tile">',
                                '<span class="tile-title">Be inspired</span>',
                                '<span class="home_video backgroundimage"></span>',
                                '<span class="tile-detail">Watch the most powerful ways to explore the DataSpace.</span>',
                            '</div>',
                        '</div>',

                    '</div>',
                    '<tpl elif="isAdmin">',
                    '<div style="margin-left: 28px;">Hey! You look like an admin. The Get Started Video URL needs to be setup.&nbsp;',
                    '<a href="{adminURL}" target="_blank">Configure</a></div>',
                    '</tpl>',
            '</div>',
            '<a id="showlink" href="#" onclick="return false;" class="started-show"',
                '<tpl if="showIntro==true">',
                ' style="display: none;"',
                '</tpl>',
                '>Show tips for getting started  &#709;',
            '</a>'
    ),

    width: '100%',

    /**
     * As the video is the only content of 'Getting Started' at the moment, this flag is used
     * to determine if a video is configured properly for this user. Without the video, this component
     * will act differently depending on this flag
     */
    hasIntro: true,

    renderSelectors: {
        dismissLink: 'a.started-dismiss',
        showLink: 'a.started-show',
        introVideo: 'div.expanded-intro'
    },

    data: {
        showIntro: Connector.user.properties.showIntro === undefined || Ext.decode(Connector.user.properties.showIntro).value === true,
        isAdmin: LABKEY.user.isAdmin === true,
        adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
        videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL,
        multiRow: false
    },

    listeners: {
        afterLayout: function(start) {
                Ext.get('hidelink').on('click', function(event, target) {
                    start.dismiss();
                });
                Ext.get('showlink').on('click', function(event, target) {
                    start.display();
                });
            start.registerTileHandlers();
        },resize: function(c)
        {
            /*
            Inline-flex doesn't work with extjs component layout so well.
            Home.js this.getBody().setHeight() cause the tiles to shift but the div below doesn't adjust position, resulting in overlap.
            Force div height as a workaround.
             */
            var divHeight = Ext.get('expanded-intro-div').getHeight();
            var divWidth = c.getEl().dom.offsetWidth;
            var needResize = (divWidth < 1002 && divHeight < 600) || (divWidth > 1002 && divHeight > 600);
            if (needResize) {
                var isMulti = false;
                if (divWidth < 1002 && divHeight < 600) {
                    isMulti = true;
                }
                var data = {
                    showIntro: Connector.getProperty(Connector.component.Started.DISMISS_PROPERTY),
                    isAdmin: LABKEY.user.isAdmin === true,
                    adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
                    videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL,
                    multiRow: isMulti
                };
                c.update(data);
                c.doLayout();
            }
        },
        scope: this
    },

    initComponent : function()
    {
        this.callParent();
    },

    registerTileHandlers: function(){
        var el, tiles, tile, i;

        el = this.getEl();
        tiles = el.query('.tile');

        if (!this.mouseClickTask) {
            this.mouseClickTask = new Ext.util.DelayedTask(function(tile)
            {
                var win = Ext.create('Ext.window.Window', {
                    modal: true,
                    width : '80%',
                    height: '80%',
                    resizable: false,
                    draggable: false,
                    closable: false,
                    layout : 'fit',
                    items : [{
                        xtype : "component",
                        autoEl : {
                            tag : "iframe",
                            src : LABKEY.moduleContext.cds.GettingStartedVideoURL + "?color=ff9933&title=0&byline=0&portrait=0?color=ff9933&title=0&byline=0&portrait=0"
                        }
                    }]
                });
                win.show();
                win.mon(Ext.getBody(), 'click', function(){
                    win.close();
                }, win, { delegate: '.x-mask' });

            }, this);
        }

        var me = this;
        Ext.each(tiles, function(t) {
            if (t.id !== 'home-video') {
                return;
            }
            tile = Ext.get(t);
            tile.on('click', function() {
                return function() {
                    me.mouseClickTask.delay(200, undefined, undefined, [tile]);
                };
            }());
        });
    },

    dismiss : function(scope)
    {
        Connector.setProperty(Connector.component.Started.DISMISS_PROPERTY, false, function() {
            var data = {
                showIntro: false,
                isAdmin: LABKEY.user.isAdmin === true,
                adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
                videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL
            };
            this.update(data);
            this.doLayout();
        }, this);

    },

    _hide : function()
    {
        this.getEl().slideOut('t', {
            duration: 200,
            callback: function()
            {
                this.hide();
            },
            scope: this
        });
    },

    display : function(link)
    {
        Connector.setProperty(Connector.component.Started.DISMISS_PROPERTY, true, function() {
            var data = {
                showIntro: true,
                isAdmin: LABKEY.user.isAdmin === true,
                adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
                videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL
            };
            this.update(data);
            var start = this;
            this.doLayout();
        }, this);

    },

    _display : function()
    {
        this.getEl().slideIn('t', {
            duration: 200,
            callback: function()
            {
                this.show();
            },
            scope: this
        });
    }
});
