
Ext.define('Connector.component.AdvancedOption', {
    extend: 'Ext.form.field.Display',

    alias: 'widget.advancedoptionfield',

    anchor: '100%',
    labelWidth: 140,
    submitValue: true, // this makes the value be included in the form.getValues() even though this is a Display field

    constructor: function(config) {
        if (config.dimension == undefined || config.dimension.$className !== 'Connector.model.Measure') {
            console.warn('Advanced option fields should be defined using a Measure record.');
        }
        else
        {
            config.name = config.dimension.get('name');
            config.fieldLabel = Ext.String.htmlEncode(config.dimension.get('label'));

            // TODO set default value based on the dimension properties
            config.value = 'Value';

            var isHierarchical = config.dimension.get('hierarchicalSelectionChild') != undefined;
            config.cls = isHierarchical ? 'hierarchical' : '';
        }

        this.callParent([config]);
    }
});