Ext.define('Connector.component.Started', {

    extend: 'Ext.Component',

    alias: 'widget.cds-started',

    renderTpl: new Ext.XTemplate(
        '<h2 class="section-title bottom-spacer" style="display: inline-block;">Getting Started</h2>',
        '<a href="#" onclick="return false;" style="float: right; padding-right: 28px;" class="started-dismiss">Dismiss</a>',
        '<div>',
            '<div class="intro-video">',
                '<iframe width="533" height="300" src="https://player.vimeo.com/video/142939542?color=ff9933&title=0&byline=0&portrait=0" frameborder="0" allowfullscreen></iframe>',
            '</div>',
        '</div>'
    ),

    width: 560,

    renderSelectors: {
        dismissLink: 'a.started-dismiss',
        introVideo: 'div.intro-video iframe'
    },

    listeners: {
        afterrender: {
            fn: function(start)
            {
                start.dismissLink.on('click', start.dismiss, start);

                Ext.EventManager.onWindowResize(function()
                {
                    this.resizeTask.delay(200);
                }, this);

                this.resizeTask.delay(0);
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
        this.introVideo.fadeOut({
            duration: 300,
            callback: function()
            {
                this.getEl().slideOut('t', {
                    duration: 200,
                    callback: function()
                    {
                        this.hide();
                    }
                });
            },
            scope: this
        });

        Connector.setProperty('showIntro', false);
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

            this.introVideo.setSize(calcVideoWidth, calcVideoHeight);
            this.setWidth(width);
        }
    }
});