Ext.define('Connector.view.module.AssayTutorial', {
    xtype: 'app.module.assaytutorial',

    extend : 'Connector.view.module.ShowList',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
        '<tpl if="has_assay_tutorials">',
            '<h3 id="assay_tutorial_title_id" class="listing_title">{assay_tutorial_title}</h3>',
                '<tpl if="assayTutorialLinks && assayTutorialLinks.length &gt; 0">',
                    '<table class="learn-study-info">',
                        '<tpl for="assayTutorialLinks">',
                            '<tr><td>',
                                '<div class="item-value">',
                                    '<a style="cursor:pointer" class="tile" href={assay_tutorial_link}>{label:htmlEncode}</a>',
                                '</div>',
                            '</td></tr>',
                        '</tpl>',
                    '</table>',
                '</tpl>',
            '<tpl if="assayTutorialDocuments && assayTutorialDocuments.length &gt; 0">',
                '<table class="learn-study-info">',
                    '<tpl for="assayTutorialDocuments">',
                        '<tr><td>',
                             '<div class="item-value">',
//                                '<span>{label:htmlEncode}',
//                                '&nbsp;{suffix}&nbsp;</span>',
                                '<a style="display: inline-block" href="{filePath}" target="_blank"><img alt="{label:htmlEncode}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="right"/>',
                                '<span>{label:htmlEncode}',
                                '&nbsp;{suffix}&nbsp;</span>',
                                '</a>',
                             '</div>',
                        '</td></tr>',
                    '</tpl>',
                '</table>',
            '</tpl>',
        '</tpl>'
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