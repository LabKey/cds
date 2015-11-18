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

    renderData: {},

    renderSelectors: {
        dismissLink: 'a.started-dismiss',
        introVideo: 'div.intro-video iframe'
    },

    listeners: {
        afterrender: {
            fn: function(start)
            {
                start.dismissLink.on('click', start.dismiss, start);
            },
            single: true
        },
        resize: function(start)
        {
            console.log(start.getWidth());
        }
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
    }
});