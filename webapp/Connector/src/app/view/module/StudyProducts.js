/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyProducts', {

    xtype : 'app.module.studyproducts',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            Connector.constant.Templates.module.title,
            '<tpl for="items">',
                '<div class="item-row">',
                    '<p><a href="#learn/learn/vaccine/{[encodeURIComponent(values)]}">{.}</a></p>',
//                    '<p><a class="popupLink">{.} (popup)</a></p>',
                '</div>',
            '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data;

        var study = data.model;
        var studyId = study.get('Label');

        //var hierarchy = view.dimension.getHierarchies()[0];
        var config = {
            onRows: [{ level: '[Vaccine.Type].[Name]' }],
            filter: [ {hierarchy : 'Study', members: ["[Study].["+studyId+"]"]} ],
            success: function(slice) {
                var cells = slice.cells, row;
                var set = [], object;
                for (var c=0; c < cells.length; c++) {
                    row = cells[c][0];
                    object = row.positions[row.positions.length-1][0];
                    if (row.value > 0) {
                        set.push(object.name);
                    }
                }
                data.items = set;
                this.update(data);
                this.fireEvent('hideLoad', this);

                // var links = this.getEl().query('a[cls~=popupLink]');
                // links = Ext.select('.popupLink', this.getEl().dom);
                // links.on('click', function(a,b,c) {
                //     var target = Ext.get(b);
                //     var container = target.up('.modulecontainer');
                //     var content = Connector.factory.Module.defineView({
                //         type: 'text',
                //         staticData: {
                //             title: "Popup",
                //             text: "From thousands of spreadsheets scattered across computers to huge files generated in genomics and proteomics experiments, research teams face daunting data management challenges. LabKey Server is a secure, web-based data integration platform that can be customized to meet the evolving needs of translational research organizations."
                //         }
                //     }, this.model, this.state);

                //     var popup = Ext.create('Connector.view.Popup', {
                //         container: container,
                //         anchor: target,
                //         content: content,
                //         width: 350
                //     });
                // }, this);
            },
            scope: this
        };
        this.state.onMDXReady(function(mdx) {
            mdx.query(config);
        });

        this.callParent();

        this.on('render', function(){
            if (!data.items)
                this.fireEvent('showLoad', this);
        });
    }

    // afterRender: function() {
    // }
});
