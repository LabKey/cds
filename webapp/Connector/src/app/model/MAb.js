/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.MAb', {

    extend : 'Ext.data.Model',

    idProperty: 'mab_mix_name_std',

    labelProperty: 'mab_mix_name_std',

    resolvableField: 'mab_mix_name_std',

    dataAvailabilityField: 'studies_with_data',

    fields: [
        {name: 'mab_mix_id'},
        {name: 'mab_mix_name_std'},
        {name: 'mab_mix_type'},
        {name: 'mab_mix_lanlid'},
        {name: 'mab_mix_lanlid_link'},
        {name: 'mab_mix_name_other'},
        {name: 'other_labels'},

        {name: 'has_data'},

        {name: 'mabs', convert : Connector.model.Filter.asArray},
        {name: 'donors_str'},
        {name: 'donors', convert : Connector.model.Filter.asArray},
        {name: 'isotypes_str'},
        {name: 'isotypes', convert : Connector.model.Filter.asArray},
        {name: 'hxb2Locs_str'},
        {name: 'hxb2Locs', convert : Connector.model.Filter.asArray},

        {name: 'mabnames_str'},

        {name: 'mab_donor_species'},
        {name: 'mab_isotope'},
        {name: 'mab_hxb2_location'},

        {name: 'data_availability'},
        {name: 'data_accessible'},
        {name: 'studies_with_data_count'},
        {name: 'studies', convert : Connector.model.Filter.asArray},
        {name: 'studies_with_data', convert : Connector.model.Filter.asArray}
    ]
});