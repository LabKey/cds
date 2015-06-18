
Ext.define('Connector.component.AdvancedOptionBase', {

    extend: 'Ext.form.FieldSet',

    border: false,
    allowMultiSelect: false,
    isHierarchical: false,

    initComponent : function() {
        this.items = [this.getHiddenField(), this.getDisplayField()];

        this.callParent();

        this.getDisplayField().on('afterrender', this.addClickHandler, this);
    },

    getHiddenField : function() {
        if (!this.hiddenField) {
            this.hiddenField = Ext.create('Ext.form.field.Hidden', {
                name: this.fieldName,
                getValue: function() {
                    return this.value;
                }
            });
        }

        return this.hiddenField;
    },

    getDisplayField : function() {
        if (!this.displayField) {
            this.displayField = Ext.create('Ext.Component', {
                cls: this.isHierarchical ? 'hierarchical' : '',
                tpl: new Ext.XTemplate(
                    '<div class="field-label">' + Ext.String.htmlEncode(this.fieldLabel) + ':</div>',
                    '<div class="field-display">',
                        '<div class="main-label {cls}">{value:htmlEncode}',
                            '<tpl if="subValue != null">',
                                '<span class="sub-value"> ({subValue:htmlEncode})</span>',
                            '</tpl>',
                        '</div>',
                        '<span class="icon">&nbsp;</span>',
                    '</div>'
                )
            });
        }

        return this.displayField;
    },

    setValue : function(value) {
        this.value = value;
        this.getHiddenField().setValue(value);

        var displayValue = null, subDisplayValue = null, cls = '';
        if (Ext.isArray(value) && value.length > 0)
        {
            // TODO: better check for all
            var isAll = this.store.getCount() == value.length && value.length > 1;
            displayValue = isAll ? 'All' : value.join(' or ');
            subDisplayValue = isAll ? value.join(', ') : null;
        }
        else if (Ext.isString(value) && this.getRecordFromStore(value) != null) {
            displayValue = this.getRecordFromStore(value).get('label');
        }
        else
        {
            displayValue = 'Select...';
            cls = 'empty';
        }

        this.getDisplayField().update({value: displayValue, subValue: subDisplayValue, cls: cls});
    },

    getDropdownPanel : function() {
        if (!this.dropdownPanel) {
            var dropdownClassName = 'Connector.panel.AdvancedOptionCheckboxDropdown';
            if (!this.allowMultiSelect) {
                dropdownClassName = 'Connector.panel.AdvancedOptionRadioDropdown';
            }

            this.dropdownPanel = Ext.create(dropdownClassName, {
                name: this.fieldName,
                store: this.store,
                initSelection: this.value
            });

            this.dropdownPanel.on('selectionchange', function(dropdown, newSelection){
                this.setValue(newSelection);
            }, this);

            this.dropdownPanel.on('show', function(panel) {
                panel.getEl().on('mouseleave', function() {
                    panel.hide();
                    this.getDisplayField().removeCls('expanded');
                }, this);
            }, this, {single: true});
        }

        return this.dropdownPanel;
    },

    addClickHandler : function() {
        var displayEl = this.getDisplayField().getEl();
        displayEl.on('click', function(evt, target) {
            if (target.getAttribute('class') != 'field-label')
            {
                var displayLabelEl = displayEl.down('.field-label');
                var displayValueEl = displayEl.down('.field-display');
                var pos = this.getDisplayField().getPosition();

                this.getDropdownPanel().setWidth(displayValueEl.getWidth());
                this.getDropdownPanel().showAt(pos[0] + displayLabelEl.getWidth(), pos[1]);
                this.getDisplayField().addCls('expanded');
            }
        }, this);
    },

    getRecordFromStore : function(value) {
        if (this.store) {
            return this.store.findRecord('value', value, 0, false, true, true);
        }
        return null;
    }
});


Ext.define('Connector.component.AdvancedOptionDimension', {

    extend: 'Connector.component.AdvancedOptionBase',

    constructor : function(config) {
        if (config.dimension == undefined || config.dimension.$className !== 'Connector.model.Measure') {
            console.error('Advanced option dimension field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.fieldName = this.dimension.get('name');
        this.fieldLabel = this.dimension.get('label');
        this.allowMultiSelect = this.dimension.get('allowMultiSelect');
        this.isHierarchical = this.dimension.get('hierarchicalSelectionChild') != undefined;

        this.callParent();
        Connector.getService('Query').getMeasureDistinctValues(this.dimension, this.populateStore, this);
    },

    populateStore : function(distinctValues) {
        this.store = Ext.create('Ext.data.Store', {
            fields : [{name: 'value', convert: function(value, record) { return record.raw; }}],
            data: distinctValues
        });

        this.setInitialValue();
    },

    setInitialValue : function() {
        // set default value based on the dimension's defaultSelection properties
        var defaultSel = this.dimension.get('defaultSelection');

        if (defaultSel.all) {
            this.setValue(this.store.collect('value', true));
        }
        else if (Ext.isDefined(defaultSel.value) && this.getRecordFromStore(defaultSel.value) != null) {
            this.setValue([defaultSel.value]);
        }
        else if (this.store.getCount() > 0) {
            this.setValue([this.store.first().get('value')]);
        }
    },

    setValue : function(value) {
        if (!Ext.isDefined(value)) {
            value = [];
        }
        else if (!Ext.isArray(value)) {
            value = [value];
        }

        this.callParent([value]);
    }
});


Ext.define('Connector.component.AdvancedOptionScale', {

    extend: 'Connector.component.AdvancedOptionBase',

    constructor : function(config) {
        if (config.measure == undefined || config.measure.$className !== 'Connector.model.Measure') {
            console.error('Advanced option scale field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.fieldName = 'scale';
        this.fieldLabel = 'Scale';

        this.store = Ext.create('Ext.data.Store', {
            fields: ['label', 'value'],
            data: [
                {value: 'LINEAR', label: 'Linear'},
                {value: 'LOG', label: 'Log'}
            ]
        });

        this.setValue(this.value || this.measure.get('defaultScale'));

        this.callParent();
    }
});


Ext.define('Connector.panel.AdvancedOptionBaseDropdown', {

    extend: 'Ext.panel.Panel',

    cls: 'advanced-dropdown',

    floating: true,
    shadow: false,
    border: false,

    store: null,
    initSelection: null,

    constructor : function(config) {
        this.callParent([config]);
        this.addEvents('selectionchange');
    },

    initComponent : function() {
        this.items =[
            this.getTransparentBox(),
            Ext.create('Ext.panel.Panel', {
                cls: 'body-panel',
                width: '100%',
                border: false,
                maxHeight: 120,
                autoScroll: true,
                items: this.getDropdownBodyItems()
            })
        ];

        this.callParent();
    },

    getTransparentBox : function() {
        if (!this.transparentBox) {
            this.transparentBox = Ext.create('Ext.Component', {
                html: '<div class="field-display">&nbsp;</div>'
            });
        }

        return this.transparentBox;
    },

    getDropdownBodyItems : function() {
        return [];
    }
});


Ext.define('Connector.panel.AdvancedOptionCheckboxDropdown', {

    extend: 'Connector.panel.AdvancedOptionBaseDropdown',

    getDropdownBodyItems : function() {
        return [
            this.getDropdownSelectAllCb(),
            this.getDropdownCheckboxGroup()
        ]
    },

    getDropdownSelectAllCb : function() {
        if (!this.dropdownSelectAllCb) {
            this.dropdownSelectAllCb = Ext.create('Ext.form.field.Checkbox', {
                cls: 'cb-all-panel',
                name: this.name + '-checkall',
                boxLabel: 'All',
                inputValue: undefined,
                checked: this.store.getCount() == this.initSelection.length,
                listeners: {
                    scope: this,
                    change: function(cb, newValue) {
                        // loop through each checkbox in the group so we can suspend the events while setting the value
                        Ext.each(this.getDropdownCheckboxGroup().getBoxes(), function(checkbox) {
                            checkbox.suspendEvents(false);
                            checkbox.setValue(newValue);
                            checkbox.resumeEvents();
                        }, this);

                        this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()[this.name + '-check']);
                    }
                }
            });
        }

        return this.dropdownSelectAllCb;
    },

    getDropdownCheckboxGroup : function() {
        if (!this.dropdownCheckboxGroup)
        {
            var checkboxItems = [];
            Ext.each(this.store.getRange(), function(record) {
                checkboxItems.push({
                    name: this.name + '-check',
                    boxLabel: record.get('label') || record.get('value'),
                    inputValue: record.get('value'),
                    checked: this.initSelection.indexOf(record.get('value')) > -1,
                    listeners: {
                        scope: this,
                        change: function(cb, newValue) {
                            this.getDropdownSelectAllCb().suspendEvents(false);
                            var checkedCount = this.getDropdownCheckboxGroup().getChecked().length;
                            this.getDropdownSelectAllCb().setValue(this.store.getCount() == checkedCount);
                            this.getDropdownSelectAllCb().resumeEvents();

                            this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()[this.name + '-check']);
                        }
                    }
                });
            }, this);

            this.dropdownCheckboxGroup = Ext.create('Ext.form.CheckboxGroup', {
                cls: 'cb-panel',
                columns: 1,
                items: checkboxItems
            });
        }

        return this.dropdownCheckboxGroup;
    }
});


Ext.define('Connector.panel.AdvancedOptionRadioDropdown', {

    extend: 'Connector.panel.AdvancedOptionBaseDropdown',

    getDropdownBodyItems : function() {
        return [this.getDropdownRadioGroup()]
    },

    getDropdownRadioGroup : function() {
        if (!this.dropdownRadioGroup)
        {
            var radioItems = [];
            Ext.each(this.store.getRange(), function(record) {
                radioItems.push({
                    name: this.name + '-radio',
                    boxLabel: record.get('label') || record.get('value'),
                    inputValue: record.get('value'),
                    checked: this.initSelection.indexOf(record.get('value')) > -1
                });
            }, this);

            this.dropdownRadioGroup = Ext.create('Ext.form.RadioGroup', {
                cls: 'radio-panel',
                columns: 1,
                items: radioItems,
                listeners: {
                    scope: this,
                    change: function(radiogroup, newValue) {
                        this.fireEvent('selectionchange', this, newValue[this.name + '-radio']);
                    }
                }
            });
        }

        return this.dropdownRadioGroup;
    }
});