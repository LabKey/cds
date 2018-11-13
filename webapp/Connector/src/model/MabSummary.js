/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.MabSummary', {

    extend : 'Ext.data.Model',

    idProperty: 'mab_mix_name_std',

    resolvableField: 'mab_mix_name_std',

    fields: [
        {name: 'mab_mix_name_std', sortType: 'asUCString'},
        {name: 'mab_donor_species', sortType: 'asUCString'},
        {name: 'mab_isotype', sortType: 'asUCString'},
        {name: 'mab_hxb2_location', sortType: 'asUCString'},
        {name: 'virusCount', sortType: 'asInt'},
        {name: 'cladeCount', sortType: 'asInt'},
        {name: 'neutralization_tierCount', sortType: 'asInt'},
        {name: 'IC50geomean', sortType: 'asFloat'},
        {name: 'studyCount', sortType: 'asInt'}
    ]
});