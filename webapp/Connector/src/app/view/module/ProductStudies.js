/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductStudies', {

    xtype : 'app.module.productstudies',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            Connector.constant.Templates.module.title,
            '<tpl for="items">',
                '<div class="item-row">',
                    '<p><a href="#learn/learn/Study/{[encodeURIComponent(values)]}">{.}</a></p>',
                '</div>',
            '</tpl>',
        '</p></tpl>'
    ),

    initComponent : function() {
        var data = this.data,
            product = data.model;

        Connector.getState().onMDXReady(function(mdx) {
            mdx.query({
                onRows: [{ level: '[Study].[Name]' }],
                filter: [{
                    level : '[Subject].[Subject]',
                    membersQuery: {
                        hierarchy: '[Vaccine.Type]',
                        members: ["[Vaccine.Type].["+(product.get('Type') || '#null')+"].[" + product.get('Label') + "]"]
                    }
                }],
                success: function(slice) {
                    var cells = slice.cells, row;
                    var _set = [], object;
                    for (var c=0; c < cells.length; c++) {
                        row = cells[c][0];
                        object = row.positions[row.positions.length-1][0];
                        if (row.value > 0) {
                            _set.push(object.name);
                        }
                    }
                    data.items = _set;
                    this.update(data);
                    this.fireEvent('hideLoad', this);
                },
                scope: this
            });
        });

        this.callParent();

        this.on('render', function() {
            if (!data.items) {
                this.fireEvent('showLoad', this);
            }
        });
    }
});
