/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAntigenList', {

    xtype : 'app.module.assayantigenlist',

    extend : 'Connector.view.module.BaseModule',

    initComponent : function() {
        var assay_type = this.data.model.data.assay_type,
            store = StoreCache.getStore('Connector.app.store.Assay');
            this.tpl = new Ext.XTemplate(
                '<tpl>',
                    this.renderHeader(assay_type),
                '</tpl>',
                '<tpl for=".">',
                    '<div class="list-container">',
                        '<div class="list-entry-container">',
                            '<div class="detail-large-column">',
                                '<div class="list-detail-text">',
                                    '<h2>{antigen_name:htmlEncode}</h2>',
                                    '<div class="list-entry-description">{antigen_description:htmlEncode}</div>',
                                '</div>',
                            '</div>',
                            '<div class="detail-small-column list-detail-text">',
                                '<div class="list-detail-gray-text">{[values.antigen_control && values.antigen_control != "0" ? "YES" : "NO"]}</div>',
                            '</div>',
                            this.renderBody(assay_type),
                        '</div>',
                    '</div>',
                '</tpl>',
                {
                    maintainWidth : function(value) {
                        return value == undefined ? '-' : Ext.htmlEncode(value);
                    }
                }
            );

        store.loadAntigens(assay_type, function(results) {
            this.update(results);
        }, this);
    },

    renderHeader : function(assay_type) {
        assay_type = assay_type.toUpperCase();

        var ret = '<div class="list-container">'+
                '<div class="list-title-bar">';


        if (assay_type === 'NAB') {
            ret = ret +
                    '<div class="detail-large-column">Virus</div>'+
                    '<div class="detail-small-column">Control</div>'+
                    '<div class="detail-small-column">Clade</div>'+
                    '<div class="detail-small-column">Tier</div>'+
                    '<div class="detail-small-column">Virus Type</div>'+
                    '<div class="detail-small-column list-detail-text">Target Cell</div>';
        }
        else if (assay_type === 'ICS' || assay_type === 'ELISPOT') {
            ret = ret +
                   '<div class="detail-large-column">Protein Panel</div>'+
                    '<div class="detail-small-column">Control</div>'+
                    '<div class="detail-small-column">Clade(s)</div>'+
                    '<div class="detail-medium-column">Protein:Pools</div>';
        }
        else if (assay_type === 'BAMA') {
            ret = ret +
                    '<div class="detail-large-column">Antigen</div>'+
                    '<div class="detail-small-column">Control</div>'+
                    '<div class="detail-small-column">Clade</div>'+
                    '<div class="detail-small-column">Protein</div>'+
                    '<div class="detail-small-column">Antigen Type</div>';
        }
        return ret + '</div></div>';

    },

    renderBody : function(assay_type) {
        assay_type = assay_type.toUpperCase();

        if (assay_type === 'NAB') {
            return  '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.clade)]}</div>'+
                    '</div>'+
                    '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.neutralization_tier)]}</div>'+
                    '</div>'+
                    '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.virus_type)]}</div>'+
                    '</div>'+
                    '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.target_cell)]}</div>'+
                    '</div>';
        }
        else if (assay_type === 'ICS' || assay_type === 'ELISPOT') {
            return  '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.clades)]}</div>'+
                    '</div>'+
                    '<div class="detail-medium-column list-detail-text">'+
                        '<tpl for="protienAndPools">'+
                            '<div class="list-detail-gray-text">{[this.maintainWidth(values.protein)]}: {[this.maintainWidth(values.pools)]}</div>'+
                        '</tpl>'+
                    '</div>';
        }
        else if (assay_type === 'BAMA') {
            return  '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.clade)]}</div>'+
                    '</div>'+
                    '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.protein)]}</div>'+
                    '</div>'+
                    '<div class="detail-small-column list-detail-text">'+
                        '<div class="list-detail-gray-text">{[this.maintainWidth(values.antigen_type)]}</div>'+
                    '</div>';
        }
        else {
            return '';
        }
    }
});
