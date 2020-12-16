/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
        var assayType = this.assayType.toUpperCase();
        if (assayType == 'PKMAB') { //TODO in PK learn story
            this.loadRawData([]);
            return;
        }

        if (assayType === 'ICS' || assayType === 'ELISPOT') {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'learn_' + assayType + '_antigens',
                scope: this,
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
                                if (row.antigen_description[0] && !Ext.Array.contains(antigens[idx-1].antigen_description, row.antigen_description[0])) {
                                    var concat = '';
                                    if (antigens[idx-1].antigen_description.length > 0)
                                        concat = ', ';
                                    antigens[idx-1].antigen_description.push(concat + row.antigen_description[0]);
                                }
                            }
                            else {
                                var antigen = this.getAntigen(row);
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
                    }, this);

                    this.loadRawData(antigens);
                    this.isAntigensLoaded = true;
                }
            })
        }
        else
        {
            if (assayType === 'NABMAB')
                assayType = "NAB";

            var query = this.getAntigenQuery(assayType);

            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: query,
                scope: this,
                sort: assayType === 'BAMA' ? 'antigen_full_name' : '',
                success: function(result) {
                    var antigens = [];
                    Ext.each(result.rows, function(row) {
                        if (row.assay_identifier === this.assayId) {
                            var antigen = this.getAntigen(row);
                            antigens.push(antigen);
                        }
                    }, this);
                    this.loadRawData(antigens);
                    this.isAntigensLoaded = true;
                }
            })
        }
    },

    getAntigenQuery: function(assayType) {
        if (assayType === "NAB")
            return 'nabAntigenWithPanelMeta';
        else if (assayType === "BAMA")
            return 'bamaAntigenWithPanelMeta';
        else
            return (assayType + 'antigen');
    },

    getAntigen: function(row)
    {
        var identifier = row.antigen_name;
        if (row.target_cell)
            identifier += row.target_cell;
        identifier += row.antigen_type;
        var description = Ext.isArray(row.antigen_description) ? (row.antigen_description[0] ? [row.antigen_description[0]] : []) : [row.antigen_description];
        return {
            antigen_identifier: identifier,
            antigen_name: row.antigen_name,
            antigen_description: description,
            antigen_type: row.antigen_type,
            antigen_control_value: row.antigen_control && row.antigen_control != "0" ? "YES" : "NO", //this assumes the control status is the same for all peptide pools of a protein panel
            antigen_clade: row.clade,
            antigen_clades: row.clades,
            antigen_neutralization_tier: row.neutralization_tier,
            antigen_protein: row.protein,
            antigen_target_cell: row.target_cell,
            antigen_virus_type: row.virus_type,
            antigen_virus_full_name: row.virus_full_name,
            antigen_virus_species: row.virus_species,
            antigen_virus_host_cell: row.virus_host_cell,
            antigen_virus_backbone: row.virus_backbone,
            antigen_virus_name_other: row.virus_name_other,
            antigen_panel_names: row.panel_names && row.panel_names.length > 0 ? row.panel_names[0].split("|") : [],
            //BAMA antigen fields
            antigen_short_name: row.antigen_short_name,
            antigen_full_name: row.antigen_full_name,
            antigen_name_other: row.antigen_name_other,
            antigen_category: row.antigen_category,
            isolate_species: row.isolate_species,
            isolate_clade: row.isolate_clade,
            isolate_donor_id: row.isolate_donor_id,
            isolate_mutations: row.isolate_mutations,
            antigen_type_region: row.antigen_type_region,
            antigen_type_scaffold: row.antigen_type_scaffold,
            antigen_type_modifiers: row.antigen_type_modifiers,
            antigen_type_tags: row.antigen_type_tags,
            panel_name: row.panel_name,
            production_host_cell: row.production_host_cell,
            production_purification_method: row.production_purification_method,
            production_special_reagent: row.production_special_reagent,
            production_manufacturer: row.production_manufacturer,
            antigen_plot_label: row.antigen_plot_label,
            cds_ag_id: row.cds_ag_id,
            isolate_name_component: row.isolate_name_component,
            antigen_type_component: row.antigen_type_component,
            production_component: row.production_component
        };
    }

});
