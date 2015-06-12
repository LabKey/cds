
Ext.define('Connector.component.AdvancedOption', {
    extend: 'Ext.form.field.Display',

    alias: 'widget.advancedoptionfield',

    anchor: '100%',
    labelWidth: 140,
    submitValue: true, // this makes the value be included in the form.getValues() even though this is a Display field

    constructor : function(config) {
        if (config.dimension == undefined || config.dimension.$className !== 'Connector.model.Measure') {
            console.warn('Advanced option fields should be defined using a Measure record.');
        }
        else
        {
            config.name = config.dimension.get('name');
            config.fieldLabel = Ext.String.htmlEncode(config.dimension.get('label'));

            var isHierarchical = config.dimension.get('hierarchicalSelectionChild') != undefined;
            config.cls = isHierarchical ? 'hierarchical' : '';

            // TODO: query distinct values for this column
            this.store = Ext.create('Ext.data.Store', {
                fields : ['value'],
                data : [
                    {value: 'test1'},
                    {value: 'test2'},
                    {value: 'test3'}
                ]
            });

            // set default value based on the dimension's defaultSelection properties
            var defaultSel = config.dimension.get('defaultSelection');
            if (defaultSel.all) {
                config.value = this.store.collect('value');
            }
            else if (this.store.getCount() > 0) {
                config.value = [this.store.first().get('value')];
            }
        }

        this.callParent([config]);
    },

    getDisplayValue : function() {
        var displayValue = 'Select...', cls = 'label';

        if (Ext.isArray(this.value) && this.value.length > 0)
        {
            // TODO: better check for all
            if (this.store.getCount() == this.value.length)
            {
                displayValue = 'All <span class="sublabel">('
                    + Ext.String.htmlEncode(this.value.join(', '))
                    + ')</span>';
            }
            else {
                displayValue = Ext.String.htmlEncode(this.value.join(' or '));
            }
        }
        else {
            cls += ' empty';
        }

        return '<span class="' + cls + '">' + displayValue + '</span><span class="icon">&nbsp;</span>';
    },

    getValue : function() {
        return { values: this.value };
    }
});