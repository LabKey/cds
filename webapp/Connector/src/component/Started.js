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
                '<a id="hidelink" href="#" onclick="return false;" class="started-dismiss">Hide &nbsp; <span style="font-size: 9px">&#x2715;</span></a>',
                    '<tpl if="videoURL">',
                        '<div class="get-started ',
                        '<tpl if="multiRow">',
                            ' get-started-multiRow"',
                        '<tpl else>',
                            ' get-started-singleRow"',
                        '</tpl>',
                        '>',

                        '<table class="tile-group"><tr>',
                            '<td><div>',
                                '<table class="tile" onclick="location.href=\'#learn/learn/Study/\'">',
                                '<tr><td><p class="tile-title">Answer questions</p></td></tr>',
                                '<tr><td><div class="home_text backgroundimage"></div></td></tr>',
                                '<tr><td>Learn about {nstudy:htmlEncode} CAVD studies, {nproduct:htmlEncode} products, and {nassay:htmlEncode} assays.</td></tr>',
                                '</table>',
                            '</div></td>',
                            '<td><div>',
                                '<table class="tile" onclick="location.href=\'#explorer/singleaxis/Study%20Product/Product%20Class\'">',
                                '<tr><td><p class="tile-title">Find a cohort</p></td></tr>',
                                '<tr><td><div class="home_bar backgroundimage"></div></td></tr>',
                                '<tr><td>Find subjects based on attributes that span studies.</td></tr>',
                                '</table>',
                            '</div></td>',
                        '<tpl if="multiRow">',
                        '</tr><tr>',
                        '</tpl>',
                            '<td><div>',
                                '<table class="tile" onclick="location.href=\'#chart\'">',
                                '<tr><td><p class="tile-title">Explore relationships</p></td></tr>',
                                '<tr><td><div class="home_plot backgroundimage"></div></td></tr>',
                                '<tr><td>Plot assay results across {nsubjectstudy:htmlEncode} studies and years of research.</td></tr>',
                                '</table>',
                            '</div></td>',
                            '<td><div>',
                                '<table class="tile" id="home-video">',
                                '<tr><td><p class="tile-title">Be inspired</p></td></tr>',
                                '<tr><td><div class="home_video backgroundimage"></div></td></tr>',
                                '<tr><td>Watch the most powerful ways to explore the DataSpace.</td></tr>',
                                '</table>',
                            '</div></td>',
                        '</tr></table>',

                    '<tpl elif="isAdmin">',
                    '<div style="margin-left: 28px;">Hey! You look like an admin. The Get Started Video URL needs to be setup.&nbsp;',
                    '<a href="{adminURL}" target="_blank">Configure</a></div>',
                    '</tpl>',
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
        showIntro: Connector.user.properties.showIntro === undefined || Ext.decode(Connector.user.properties.showIntro).value === true,
        isAdmin: LABKEY.user.isAdmin === true,
        adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
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
                adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
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
