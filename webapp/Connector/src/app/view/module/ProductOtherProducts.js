/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductOtherProducts', {

    xtype : 'app.module.productotherproducts',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            Connector.constant.Templates.module.title,
            '<tpl if="!values.items">',
                Connector.constant.Templates.module.loadingData,
            '</tpl>',
            '<tpl for="items">',
                '<div class="item-row">',
                    '<p><a href="#learn/learn/Vaccine/{[encodeURIComponent(values)]}">{.}</a></p>',
                '</div>',
            '</tpl>',
        '</p></tpl>'),

//    foundData : false,

    // hasContent : function() {
    //     return true;
    // },

    initComponent : function() {
        var data = this.data;

        var product = data.model;
        var id = product.getId();

        // var config = {
        //     onRows: [{ level: '[Study].[Study]' }],
        //     filter: [ {level : '[Subject].[Subject]', membersQuery: {
        //         members: ["[Vaccine.Type].["+product.get('Type')+"].[" + product.get('Label') + "]"],
        //         hierarchy: "Vaccine"
        //     }}],
        //     success: function(slice) {
        //         var cells = slice.cells, row;
        //         var set = [], object;
        //         for (var c=0; c < cells.length; c++) {
        //             row = cells[c][0];
        //             object = row.positions[row.positions.length-1][0];
        //             if (row.value > 0) {
        //                 set.push(object.name);
        //             }
        //         }
        //         data.items = set;
        //         this.update(data);
        //     },
        //     scope: this
        // };
        // this.state.onMDXReady(function(mdx) {
        //     mdx.query(config);
        // });

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: "SELECT DISTINCT label FROM product p, treatmentvisitmap tvm, treatmentproductmap tpm "+
                 "WHERE cohortid IN ("+
                    "SELECT cohortid "+
                     "FROM product p,  treatmentvisitmap tvm, treatmentproductmap tpm "+
                     "WHERE tvm.treatmentid = tpm.treatmentid "+
                     "AND tpm.productid = p.rowid "+
                     "AND p.label = '"+id+"' "+
                 ") "+
                 "AND p.rowid = tpm.productid "+
                 "AND tpm.treatmentid = tvm.treatmentid "+
                 "AND p.label <> '"+id+"' ",
            success: function(response) {
                data.items = [];
                Ext.each(response.rows, function(row) {
                    data.items.push(row.label);
                })
                // if (data.items.length) {
                //    this.foundData = true;
                //     this.updateVisibility();
                // }
                this.update(data);
            },
            scope: this
        });

        this.callParent();
    }
});
