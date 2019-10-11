/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.Started', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.cds-started',

    statics: {
        DISMISS_PROPERTY: 'showIntroPage'
    },

    tpl: new Ext.XTemplate(
            '<div class="expanded-intro" id="expanded-intro-div"',
                '<tpl if="showIntro==false">',
                    ' style="display: none !important;"',
                '</tpl>',
            '>',
                '<h1 class="started-section-title bottom-spacer">Quick Links</h1>',
                '<a id="hidelink" href="#" onclick="return false;" class="started-dismiss">Hide &nbsp; <span style="font-size: 9px">&#x2715;</span></a>',
                    '<tpl if="videoURL">',
                        '<div class="get-started get-started-multiRow">',
                        '<table class="tile-group">',
                        '<tr>',
                            '<td class="tile tile-image"><div class="home_video backgroundimage"></div></td>',
                            '<td class="tile tile-image"><div class="home_integrated_data backgroundimage"></div></td>',
                            '<td class="tile tile-image"><div class="home_bar backgroundimage"></div></td>',
                            '<td class="tile tile-image"><div class="home_try_it_out backgroundimage"></div></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="tile-detail" style="padding-left:5%;"><h3 class="tile-title">Watch the <a href="{videoURL}" target="_blank">Get Started</a> video</h3>',
                                '<div><table>',
                                    '<tr><td>See the most powerful ways to explore the DataSpace.</td></tr>',
                                '</table></div>',
                            '</td>',
                            '<td class="tile-detail" style="padding-left:8%;"><h3 class="tile-title">What you need to know</h3>',
                                '<div id="whatyouneedtoknow-wiki"><table>',
                                    '<td>{[this.getWhatYouNeedToKnowWiki()]}</td>',
                                '</table></div>',
                            '</td>',
                            '<td class="tile-detail" style="padding-left:10%;"><h3 class="tile-title">Take a tour</h3>',
                                '<div id="tours-wiki"><table>',
                                    '<td>{[this.getTakeATourWiki()]}</td>',
                                '</table></div>',
                            '</td>',
                            '<td class="tile-detail" style="padding-left:10%"><h3 class="tile-title">Try it out</h3>',
                                '<div><table>',
                                    '<tr><td class="tile-detail-static"><a href=\'#learn/learn/Study/\' target="_blank">Learn about</a> studies, products, assays, antibodies, ad publications</td></td></tr>',
                                    '<tr><td class="tile-detail-static"><a href=\'#summary\' target="_blank">Find subjects</a> with common characteristics</td></td></tr>',
                                    '<tr><td class="tile-detail-static"><a href=\'#chart\' target="_blank">Plot</a> assay results across studies and years of research</td></td></tr>',
                                    '<tr><td class="tile-detail-static">Compare <a href=\'#mabgrid\' target="_blank">Monoclonal antibodies</a> and their neutralization curves</td></td></tr>',
                                '</table></div>',
                            '</td>',
                        '</tr>',
                        '</table>',

                    '<tpl elif="isAdmin">',
                    '<div style="margin-left: 28px;">Hey! You look like an admin. The Get Started Video URL needs to be setup.&nbsp;',
                    '<a href="{adminURL}" target="_blank">Configure</a></div>',
                    '</tpl>', {
                        getWhatYouNeedToKnowWiki: function()
                        {
                            return new LABKEY.WebPart({
                                partName: 'Wiki',
                                frame: 'none',
                                renderTo: 'whatyouneedtoknow-wiki',
                                partConfig: {
                                    name: LABKEY.getModuleProperty('cds', 'WhatYouNeedToKnowWiki')
                                }
                            }).render();
                        },
                        getTakeATourWiki: function()
                        {
                            return new LABKEY.WebPart({
                                partName: 'Wiki',
                                frame: 'none',
                                renderTo: 'tours-wiki',
                                partConfig: {
                                    name: LABKEY.getModuleProperty('cds', 'ToursWiki')
                                }
                            }).render();
                        }
                    },
            '</div></div>',
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

    isSmallSize: false,

    renderSelectors: {
        dismissLink: 'a.started-dismiss',
        showLink: 'a.started-show',
        introVideo: 'div.expanded-intro'
    },

    data: {
        showIntro: Connector.user.properties.showIntroPage === undefined || Ext.decode(Connector.user.properties.showIntroPage).value === true,
        isAdmin: LABKEY.user.isAdmin === true,
        adminURL: LABKEY.ActionURL.buildURL('admin', 'moduleProperties.view', null, {tabId: 'props'}),
        videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL,
        multiRow: false,
        nstudy: 0,
        ndatapts: 0,
        nsubjectstudy: 0,
        nassay: 0,
        nproduct: 0
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
            var divHeight = Ext.get('expanded-intro-div').getHeight();
            var divWidth = c.getEl().dom.offsetWidth;
            var needResize = (divWidth < 880 && divHeight < 600) || (divWidth > 880 && divHeight > 600);
            if (needResize) {
                var isMulti = false;
                if (divWidth < 880 && divHeight < 600) {
                    isMulti = true;
                }
                var data = {
                    multiRow: isMulti
                };
                this.isSmallSize = isMulti;
                c._updateData(data);
            }
        },
        scope: this
    },

    initComponent : function()
    {
        this.callParent();
        this._updateData({});
    },

    _updateData: function (data) {
        if (!data) {
            data = {};
        }
        var isSmallSize = this.isSmallSize;
        Statistics.resolve(function(stats)
        {
            var newData =  {
                showIntro: Connector.getProperty(Connector.component.Started.DISMISS_PROPERTY),
                isAdmin: LABKEY.user.isAdmin === true,
                adminURL: LABKEY.ActionURL.buildURL('admin', 'moduleProperties.view', null, {tabId: 'props'}),
                videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL,
                multiRow: isSmallSize,
                nstudy: stats.studies,
                ndatapts: stats.datacount,
                nsubjectstudy: stats.subjectlevelstudies,
                nassay: stats.assays,
                nproduct: stats.products
            };
            Ext.applyIf(data, newData);
            this.update(data);
            this.doLayout();
        }, this);
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
                    constrain:true,
                    id: 'started-video-frame',
                    items : [{
                        xtype : "component",
                        autoEl : {
                            tag : "iframe",
                            src : LABKEY.moduleContext.cds.GettingStartedVideoURL
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
                showIntro: false
            };
            this._updateData(data);
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
                showIntro: true
            };
            this._updateData(data);
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
