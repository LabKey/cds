Ext.define('Connector.view.module.AssayTutorial', {
    xtype: 'app.module.assaytutorial',

    extend : 'Connector.view.module.ShowList',

    plugins : ['documentvalidation'],

    statics : {
        openPopupModal : function(videoUrl) {
            var win = Ext.create('Ext.window.Window', {
                modal: true,
                width : '80%',
                height: '80%',
                resizable: false,
                draggable: false,
                closable: false,
                layout : 'fit',
                constrain:true,
                id: 'tutorial-video-frame',
                items : [{
                    xtype : "component",
                    autoEl : {
                        tag : "iframe",
                        src : videoUrl
                    }
                }]
            });
            win.show();
            win.mon(Ext.getBody(), 'click', function(){
                win.close();
            }, win, { delegate: '.x-mask' });
        }
    },

    tpl : new Ext.XTemplate(
        '<tpl if="has_assay_tutorials">',
            '<h3 id="assay_tutorial_title_id">{assay_tutorial_title}</h3>',
                '<tpl if="assayTutorialLinks && assayTutorialLinks.length &gt; 0">',
                    '<table class="assay-tutorial">',
                        '<tpl for="assayTutorialLinks">',
                            '<tr><td>',
                                '<div class="assay-tutorial-img-container">',
                                    '<div>',
                                        '<a id="assay-tutorial-video" onclick="Connector.view.module.AssayTutorial.openPopupModal(\'{assay_tutorial_link:htmlEncode}\');">',
                                            '<img src={[this.getThumbnailImgSrc()]}/>',
                                        '</a>',
                                        '<div class="assay-tutorial-label">{video_thumbnail_label:htmlEncode}</div>',
                                    '</div>',
                                '</div>',
                            '</td></tr>',
                        '</tpl>',
                    '</table>',
                '</tpl>',
            '<tpl if="assayTutorialDocuments && assayTutorialDocuments.length &gt; 0">',
                '<table class="learn-study-info">',
                    '<tpl for="assayTutorialDocuments">',
                        '<tr><td>',
                             '<div id="tutorial-doc-id" class="item-value">',
                                '<span>{label:htmlEncode}',
                                '&nbsp;{suffix}&nbsp;</span>',
                                '<a style="display: inline-block" href="{filePath}" target="_blank"><img alt="{label:htmlEncode}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="left"/></a>',
                             '</div>',
                        '</td></tr>',
                    '</tpl>',
                '</table>',
            '</tpl>',
        '</tpl>',
        {
            getThumbnailImgSrc : function() {
                let imgSrc = Connector.resourceContext.path + '/images/learn/tutorialVideoNoText.png' + " height=\"181\" width=\"322\"";
                return imgSrc;
            }
        }
    ),

    initComponent : function() {
        var data = this.getListData();
        data['has_assay_tutorials'] = !!data.assayTutorialLinks || !!data.assayTutorialDocuments
        data['assay_tutorial_title'] = this.initialConfig.data.title;
        this.update(data);

        this.callParent();

        if (data.assayTutorialDocuments.length > 0) {
            var docIsValidAction = function(doc, status) {
                doc.isLinkValid = status;
                this.update(data);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.assayTutorialDocuments, docIsValidAction);
            }, this);
        }
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    hasContent : function() {
        var d = this.getListData();
        return d["assayTutorialDocuments"].length > 0 || d["assayTutorialLinks"].length > 0;
    }
});