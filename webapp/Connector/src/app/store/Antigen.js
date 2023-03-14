/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Antigen', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Antigen',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function() {
        this.assayCombinedAntigenMetadata = undefined;
        this.assayCombinedAntigenPanel = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'assay_combined_antigen_metadata',
            success: this.onLoadAssayCombinedAntigenMetadata,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'assayCombinedAntigenPanel',
            success: this.  onLoadAssayCombinedAntigenPanel,
            scope: this
        });
    },

      onLoadAssayCombinedAntigenPanel : function(panel) {
        this.assayCombinedAntigenPanel = panel.rows;
        this._onLoadComplete();
    },

    onLoadAssayCombinedAntigenMetadata : function(combinedAgData) {
        this.assayCombinedAntigenMetadata = combinedAgData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayCombinedAntigenMetadata) && Ext.isDefined(this.assayCombinedAntigenPanel)) {

            var antigens = [];

            this.assayCombinedAntigenMetadata.forEach(function(antigen) {
                var panels = this.assayCombinedAntigenPanel.filter(function(panel) {return panel.antigen_cds_id === antigen.antigen_cds_id;});
                antigen.antigen_panel = panels && panels.length > 0 ? panels : undefined;
                antigens.push(antigen);
            }, this);

            this.assayCombinedAntigenMetadata = undefined;

            this.loadRawData(antigens);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
