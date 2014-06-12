/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyAssays', {

    xtype : 'app.module.studyassays',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            Connector.constant.Templates.module.title,
            '<tpl if="!values.assays">',
                '<p class="loading-data">Loading data...</p>',
            '</tpl>',
            '<tpl if="values.assays">',
                Connector.constant.Templates.module.availableDataLegend,
                '<tpl for="assays">',
                    '<div class="item-row">',
                        '<div class="checkbox">',
                            '<tpl if="count">',
                                '&#10003',
                            '</tpl>',
                        '</div>',
                        '<p><a href="#learn/learn/assay/{[encodeURIComponent(values.name)]}">{name}</a></p>',
                    '</div>',
                '</tpl>',
            '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data;

        var study = data.model;
        var studyId = study.get('Label');

        //var hierarchy = view.dimension.getHierarchies()[0];
        var config = {
            onRows: [{ level: '[Assay.Platform].[Name]' }],
            filter: [ {hierarchy : 'Study', members: ["[Study].["+studyId+"]"]} ],
            success: function(slice) {
                var cells = slice.cells, row;
                var assaySet = [], assay;
                for (var c=0; c < cells.length; c++) {
                    row = cells[c][0];
                    assay = row.positions[row.positions.length-1][0];
                    //if (row.value > 0) {
                    assaySet.push({
                        name: assay.name,
                        count: row.value
                    });
                    //}
                }
                data.assays = assaySet;
                this.update(data);
            },
            scope: this
        };
        this.state.onMDXReady(function(mdx) {
            mdx.query(config);
        });

        this.callParent();
    }
});
