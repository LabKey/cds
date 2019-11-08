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

    maxHt: 1000,

    tpl: new Ext.XTemplate(
            '<div class="expanded-intro" id="expanded-intro-div"',
            '<tpl if="showIntro==false">',
                ' style="display: none !important;"',
            '</tpl>',
            '>',
            '<h1 class="started-section-title bottom-spacer">Getting Started</h1>',
            '<a id="hidelink" href="#" onclick="return false;" class="started-dismiss">Hide &nbsp; <span style="font-size: 9px">&#x2715;</span></a>',
            '<tpl if="videoURL">',
                '<div style="height:auto" class="get-started ',
            '<tpl if="multiRow">',
                ' get-started-multiRow"',
            '<tpl else>',
                ' get-started-singleRow"',
            '</tpl>',
            '>',

            '<table style="table-layout: fixed;" class="tile-group"><tr>',
                '<td style="vertical-align: top"><div>',
                    '<table class="tile" id="home-video">',
                        '<tr><td class="tile-image"><div class="home_video backgroundimage"></div></td></tr>',
                        '<tr><td class="tile-detail"><h3 class="tile-title">Watch the <a style="cursor:pointer" class="tile" id="home-video">Get Started</a> video</h3></td></tr>',
                        '<tr><td>See the most powerful ways to explore the DataSpace.</td></tr>',
                    '</table>',
                '</div></td>',

                '<td style="vertical-align: top"><div>',
                    '<table class="tile">',
                        '<tr><td class="tile-image"><div class="home_bar backgroundimage"></div></td></tr>',
                        '<tr><td style="padding-left:20%;"><div id="tours-wiki">{[this.getTakeATourWiki()]}</div></td></tr>',
                    '</table>',
                '</div></td>',

                '<tpl if="multiRow">',
                    '</tr><tr>',
                '</tpl>',

                '<td style="vertical-align: top;"><div>',
                    '<table class="tile">',
                        '<tr><td class="tile-image"><div class="home_try_it_out backgroundimage"></div></td></tr>',
                        '<tr><td style="padding-left: 25%"><div>',
                            '<h3 class="tile-title">Try it out</h3>',
                            '<table width="220px">',
                                '<tr><td class="tile-detail-static"><a id="learn-about-link" href=\'#learn/learn/Study/\'">Learn about</a> studies, products, assays, antibodies, and publications</td></td></tr>',
                                '<tr><td class="tile-detail-static"><a id="find-subjects-link" href=\'#summary\'">Find subjects</a> with common characteristics</td></td></tr>',
                                '<tr><td class="tile-detail-static"><a id="plot-link" href=\'#chart\'">Plot</a> assay results across studies and years of research</td></td></tr>',
                                '<tr><td class="tile-detail-static">Compare <a id="monoclonal-antibodies-link" href=\'#mabgrid\'">Monoclonal antibodies</a> and their neutralization curves</td></td></tr>',
                            '</table>',
                        '</div></td></tr>',
                    '</table>',
                '</div></td>',

                '<td style="vertical-align: top"><div>',
                    '<table class="tile">',
                        '<tr><td class="tile-image"><div class="home_integrated_data backgroundimage"></div></td></tr>',
                        '<tr><td style="padding-left:20%;white-space: normal"><div id="whatyouneedtoknow-wiki">{[this.getWhatYouNeedToKnowWiki()]}</div></td></tr>',
                        '<tr><td style="padding-top: 5%;padding-left:20%;"><div id="helpCenter">See the <a id="helpCenterDialog" class="helpcenter-panel" href="#" onclick="return false">Help</a> section for more info</div></td></tr>',
                    '</table>',
                '</div></td>',

            '</tr></table>',

            '<tpl elif="isAdmin">',
            '<div style="margin-left: 28px;">Hey! You look like an admin. The Get Started Video URL needs to be setup.&nbsp;',
            '<a href="{adminURL}" target="_blank">Configure</a></div>',
            '</tpl>',{
                getWhatYouNeedToKnowWiki: function() {
                    return new LABKEY.WebPart({
                        partName: 'Wiki',
                        frame: 'none',
                        renderTo: 'whatyouneedtoknow-wiki',
                        containerPath: '/Shared',
                        partConfig: {
                            name: LABKEY.getModuleProperty('cds', 'WhatYouNeedToKnowWiki')
                        }
                    }).render();
                },
                getTakeATourWiki: function() {
                    return new LABKEY.WebPart({
                        partName: 'Wiki',
                        frame: 'none',
                        renderTo: 'tours-wiki',
                        containerPath: '/Shared',
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

    helpCenterDialogHandler: function (event, target) {
        var config = {
            ui: 'axiswindow',
            id: 'helpdialog',
            items: [{
                xtype: 'helpcenter',
                listeners: {
                    afterrender: function(me) {
                        HelpRouter.clearHistory();
                        me.loadHelpFile();
                    }
                }
            }],
        };
        Connector.panel.HelpCenter.displayWikiWindow(target, config);
    },

    listeners: {
        afterLayout: function(scope) {
                Ext.get('hidelink').on('click', function(event, target) {
                    scope.dismiss();
                });
                Ext.get('showlink').on('click', function(event, target) {
                    scope.display();
                });

                //afterLayout gets called multiple times accumulating event handler and throwing off the Help Center window - hence unregistering first and then registering so that there's only one event handler
                Ext.get('helpCenterDialog').un('click', scope.helpCenterDialogHandler, scope);
                Ext.get('helpCenterDialog').on('click', scope.helpCenterDialogHandler, scope);

            scope.registerTileHandlers();
        },resize: function(c)
        {

            var toursWikiHeight = Ext.get('tours-wiki').getHeight();
            var needToKnowWikiHeight = Ext.get('whatyouneedtoknow-wiki').getHeight();

            var divHeight = Ext.get('expanded-intro-div').getHeight();
            var divWidth = c.getEl().dom.offsetWidth;

            if (c.maxHt < divHeight) {
                c.maxHt = divHeight;
            }
            if (c.maxHt === divHeight) {
                c.maxHt = toursWikiHeight + needToKnowWikiHeight;
            }

            var needResize = (divWidth < 880 && divHeight < c.maxHt) || (divWidth > 880 && divHeight > c.maxHt);
            if (needResize) {
                var isMulti = false;
                if (divWidth < 880 && divHeight < c.maxHt) {
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
        this.maxHt = 1000;
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
