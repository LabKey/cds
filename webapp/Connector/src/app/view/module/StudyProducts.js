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
            '<p>* placeholder *</p>',
            // '<tpl if="!values.products">',
            //     '<p class="loading-data">Loading data...</p>',
            // '</tpl>',
            // '<tpl for="products">',
            //     '<p><a href="#">{.}</a></p>',
            // '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data;

        // var study = data.model;
        // var studyId = study.get('Label');

        // //var hierarchy = view.dimension.getHierarchies()[0];
        // var config = {
        //     onRows: [{ level: '[Assay.Methodology].[Name]' }],
        //     filter: [ {hierarchy : 'Study', members: ["[Study].["+studyId+"]"]} ],
        //     success: function(slice) {
        //         var cells = slice.cells, row;
        //         var assaySet = [], assay;
        //         for (var c=0; c < cells.length; c++) {
        //             row = cells[c][0];
        //             assay = row.positions[row.positions.length-1][0];
        //             if (row.value > 0) {
        //                 assaySet.push(assay.name);
        //             }
        //         }
        //         data.assays = assaySet;
        //         this.update(data);
        //     },
        //     scope: this
        // };
        // this.state.onMDXReady(function(mdx) {
        //     mdx.query(config);
        // });

        this.callParent();
    }
});
