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
                '</div>',
            '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data,
            study = data.model,
            studyId = study.get('label');

        Connector.getState().onMDXReady(function(mdx) {
            mdx.query({
                onRows: [{ level: '[Vaccine.Type].[Name]' }],
                filter: [{
                    hierarchy : 'Study',
                    members: ["[Study].[" + studyId + "]"]
                }],
                success: function(slice) {
                    var cells = slice.cells, row,
                        _set = [], object;

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
        }, this);
    }
});
