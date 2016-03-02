/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.Started', {

    extend: 'Ext.Component',

    alias: 'widget.cds-started',

    statics: {
        DISMISS_PROPERTY: 'showIntro'
    },

    renderTpl: new Ext.XTemplate(
        '<h2 class="section-title bottom-spacer" style="display: inline-block;">Getting Started</h2>',
        '<a href="#" onclick="return false;" style="float: right; padding-right: 28px;" class="started-dismiss">Dismiss</a>',
        '<div>',
            '<div class="intro-video">',
                '<tpl if="videoURL">',
                    '<iframe width="533" height="300" src="{videoURL}" frameborder="0" allowfullscreen></iframe>',
                '<tpl elif="isAdmin">',
                    '<div>',
                        'Hey! You look like an admin. The Getting Started Video URL needs to be setup.&nbsp;',
                        '<a href="{adminURL}" target="_blank">Configure</a>',
                    '</div>',
                '</tpl>',
            '</div>',
        '</div>'
    ),

    width: 560,

    /**
     * As the video is the only content of 'Getting Started' at the moment, this flag is used
     * to determine if a video is configured properly for this user. Without the video, this component
     * will act differently depending on this flag
     */
    hasIntro: true,

    renderSelectors: {
        dismissLink: 'a.started-dismiss',
        introVideo: 'div.intro-video iframe'
    },

    renderData: {
        isAdmin: LABKEY.user.isAdmin === true,
        adminURL: LABKEY.ActionURL.buildURL('admin', 'folderManagement.view', null, {tabId: 'props'}),
        videoURL: LABKEY.moduleContext.cds.GettingStartedVideoURL
    },

    listeners: {
        afterrender: {
            fn: function(start)
            {
                // bind dismiss
                start.dismissLink.on('click', start.dismiss, start);

                // check to see if a valid videoURL is available
                if (!this.renderData.videoURL)
                {
                    this.hasIntro = false;
                }

                if (this.hasIntro)
                {
                    Ext.EventManager.onWindowResize(function()
                    {
                        this.resizeTask.delay(200);
                    }, this);

                    this.resizeTask.delay(0);
                }
                else if (!this.renderData.isAdmin)
                {
                    // not an admin and a video is not available
                    this.hide();
                }
            },
            single: true
        }
    },

    initComponent : function()
    {
        this.callParent();

        this.resizeTask = new Ext.util.DelayedTask(this._onResize, this);
    },

    dismiss : function()
    {
        if (this.hasIntro)
        {
            this.introVideo.fadeOut({
                duration: 300,
                callback: this._hide,
                scope: this
            });
        }
        else
        {
            this._hide();
        }

        Connector.setProperty(Connector.component.Started.DISMISS_PROPERTY, false);
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

    // Do not call directly. Use 'resizeTask' instead
    _onResize : function()
    {
        var baseVideoWidth = 1280,
            baseVideoHeight = 720,
            width = Ext.getBody().getBox().width < 1100 ? 460 : 560;

        if (this.lastWidth != width)
        {
            this.lastWidth = width;
            var calcVideoWidth = Math.ceil(width * 0.95),
                calcVideoHeight = Math.ceil((calcVideoWidth / baseVideoWidth) * baseVideoHeight);

            if (this.hasIntro)
            {
                this.introVideo.setSize(calcVideoWidth, calcVideoHeight);
            }
            this.setWidth(width);
        }
    }
});
