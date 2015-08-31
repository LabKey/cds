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
            '<tpl for="items">',
                '<div class="item-row">',
                    '<p><a href="#learn/learn/Vaccine/{[encodeURIComponent(values)]}">{.:htmlEncode}</a></p>',
                '</div>',
            '</tpl>',
        '</p></tpl>'
    ),

    initComponent : function() {
        var data = this.data,
            product = data.model,
            id = product.getId();

        LABKEY.Query.executeSql({
            schemaName: Connector.studyContext.schemaName,
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
                });
                this.update(data);
                this.fireEvent('hideLoad', this);
            },
            scope: this
        });

        this.callParent();

        this.on('render', function() {
            if (!data.items) {
                this.fireEvent('showLoad', this);
            }
        }, this);
    }
});
