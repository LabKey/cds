/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.AssayAntigen', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.AssayAntigen',

    isAntigensLoaded: false,

    assayType: null,

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadAntigens : function() {
        if (this.isAntigensLoaded)
            return;
        var me = this, assayName = this.assayType.toUpperCase();
        if (assayName === 'ICS' || assayName === 'ELISPOT') {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'learn_' + assayName + '_antigens',
                success: function(result) {
                    var antigens = [],
                            idx = 0;
                    Ext.each(result.rows, function(row) {

                            if(antigens[idx-1] && antigens[idx-1].antigen_name === row.antigen_name) {
                                antigens[idx-1].antigen_proteinAndPools.push({
                                    protein: row.protein,
                                    pools: row.pools
                                });
                                antigens[idx-1].antigen_proteins.push(row.protein);
                                Ext.each(row.pools, function(pool){
                                    antigens[idx-1].antigen_pools.push(pool);
                                });
                                if (!Ext.Array.contains(antigens[idx-1].antigen_description, row.antigen_description[0])) {
                                    antigens[idx-1].antigen_description.push(', ' + row.antigen_description[0]);
                                }
                            }
                            else {
                                var antigen = me.getAntigen(row);
                                Ext.apply(antigen, {
                                    antigen_proteinAndPools: [{
                                        protein: row.protein,
                                        pools: row.pools
                                    }],
                                    antigen_proteins: [row.protein],
                                    antigen_pools: row.pools
                                });
                                antigens[idx] = antigen;
                                idx++;
                            }
                    });

                    me.loadRawData(antigens);
                    me.isAntigensLoaded = true;
                }
            })
        }
        else
        {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: assayName + 'antigen',
                success: function(result) {
                    var antigens = [];
                    Ext.each(result.rows, function(row) {
                        var antigen = me.getAntigen(row);
                        antigens.push(antigen);
                    });
                    me.loadRawData(antigens);
                    me.isAntigensLoaded = true;
                }
            })
        }
    },

    getAntigen: function(row)
    {
        var identifier = row.antigen_name;
        if (row.target_cell)
            identifier += row.target_cell;
        identifier += row.antigen_type;
        return {
            antigen_identifier: identifier,
            antigen_name: row.antigen_name,
            antigen_description: row.antigen_description,
            antigen_type: row.antigen_type,
            antigen_control_value: row.antigen_control && row.antigen_control != "0" ? "YES" : "NO", //this assumes the control status is the same for all peptide pools of a protein panel
            antigen_clade: row.clade,
            antigen_clades: row.clades,
            antigen_neutralization_tier: row.neutralization_tier,
            antigen_protein: row.protein,
            antigen_target_cell: row.target_cell,
            antigen_virus_type: row.virus_type
        };
    }

});
