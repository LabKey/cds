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

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'assay_combined_antigen_metadata',
            success: this.onLoadAssayCombinedAntigenMetadata,
            scope: this
        });
    },

    onLoadAssayCombinedAntigenMetadata : function(combinedAgData) {
        this.assayCombinedAntigenMetadata = combinedAgData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayCombinedAntigenMetadata)) {

            var antigens = [];

            Ext.each(this.assayCombinedAntigenMetadata, function(antigen) {
                antigens.push(antigen);
            }, this);

            this.assayCombinedAntigenMetadata = undefined;

            this.loadRawData(antigens);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
