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

        {name: 'mabs', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'donors_str'},
        {name: 'donors', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'isotypes_str'},
        {name: 'isotypes', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'hxb2Locs_str'},
        {name: 'hxb2Locs', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},

        {name: 'mabnames_str'},

        {name: 'mab_donor_species'},
        {name: 'mab_isotope'},
        {name: 'mab_hxb2_location'},

        {name: 'data_availability'},
        {name: 'data_accessible'},
        {name: 'studies_with_data_count'},
        {name: 'studies', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'studies_with_data', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }}
    ]
});