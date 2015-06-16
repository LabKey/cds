
Ext.define('Connector.component.AdvancedOption', {

    extend: 'Ext.form.FieldSet',

    alias: 'widget.advancedoptionfield',

    border: false,

    constructor : function(config) {
        if (config.dimension == undefined || config.dimension.$className !== 'Connector.model.Measure') {
            console.error('Advanced option field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.items = [this.getHiddenField(), this.getDisplayField()];

        Connector.getService('Query').getMeasureDistinctValues(this.dimension, this.populateStore, this);

        this.callParent();

        this.getDisplayField().on('afterrender', this.addClickHandler, this);
    },

    getHiddenField : function() {
        if (!this.hiddenField) {
            this.hiddenField = Ext.create('Ext.form.field.Hidden', {
                name: this.dimension.get('name'),
                getValue: function() {
                    return this.value;
                }
            });
        }

        return this.hiddenField;
    },

    getDisplayField : function() {
        if (!this.displayField) {
            var isHierarchical = this.dimension.get('hierarchicalSelectionChild') != undefined;

            this.displayField = Ext.create('Ext.Component', {
                cls: isHierarchical ? 'hierarchical' : '',
                tpl: new Ext.XTemplate(
                    '<div class="field-label">' + Ext.String.htmlEncode(this.dimension.get('label')) + ':</div>',
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
        else if (Ext.isDefined(defaultSel.value) && this.store.find('value', defaultSel.value, 0, false, true, true) != -1) {
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

        this.value = value;
        this.getHiddenField().setValue(value);

        var displayValue = null, subDisplayValue = null, cls = '';
        if (value.length > 0)
        {
            // TODO: better check for all
            var isAll = this.store.getCount() == value.length && value.length > 1;
            displayValue = isAll ? 'All' : value.join(' or ');
            subDisplayValue = isAll ? value.join(', ') : null;
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
            var dropdownClassName = 'Connector.component.AdvancedOptionCheckboxDropdown';
            if (!this.dimension.get('allowMultiSelect')) {
                dropdownClassName = 'Connector.component.AdvancedOptionRadioDropdown';
            }

            this.dropdownPanel = Ext.create(dropdownClassName, {
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
    }
});


Ext.define('Connector.component.AdvancedOptionBaseDropdown', {

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


Ext.define('Connector.component.AdvancedOptionCheckboxDropdown', {

    extend: 'Connector.component.AdvancedOptionBaseDropdown',

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
                name: 'cb-all',
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

                        this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()['cb-group']);
                    }
                }
            });
        }

        return this.dropdownSelectAllCb;
    },

    getDropdownCheckboxGroup : function() {
        if (!this.dropdownCheckboxGroup) {
            var checkboxItems = this.store.collect('value', true);

            for (var i = 0; i < checkboxItems.length; i++)
            {
                checkboxItems[i] = {
                    name: 'cb-group',
                    boxLabel: checkboxItems[i],
                    inputValue: checkboxItems[i],
                    checked: this.initSelection.indexOf(checkboxItems[i]) > -1,
                    listeners: {
                        scope: this,
                        change: function(cb, newValue) {
                            this.getDropdownSelectAllCb().suspendEvents(false);
                            var checkedCount = this.getDropdownCheckboxGroup().getChecked().length;
                            this.getDropdownSelectAllCb().setValue(this.store.getCount() == checkedCount);
                            this.getDropdownSelectAllCb().resumeEvents();

                            this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()['cb-group']);
                        }
                    }
                };
            }

            this.dropdownCheckboxGroup = Ext.create('Ext.form.CheckboxGroup', {
                cls: 'cb-panel',
                columns: 1,
                items: checkboxItems
            });
        }

        return this.dropdownCheckboxGroup;
    }
});


Ext.define('Connector.component.AdvancedOptionRadioDropdown', {

    extend: 'Connector.component.AdvancedOptionBaseDropdown',

    getDropdownBodyItems : function() {
        return [this.getDropdownRadioGroup()]
    },

    getDropdownRadioGroup : function() {
        if (!this.dropdownRadioGroup) {
            var radioItems = this.store.collect('value', true);

            for (var i = 0; i < radioItems.length; i++)
            {
                radioItems[i] = {
                    name: 'radio-group',
                    boxLabel: radioItems[i],
                    inputValue: radioItems[i],
                    checked: this.initSelection.indexOf(radioItems[i]) > -1
                };
            }

            this.dropdownRadioGroup = Ext.create('Ext.form.RadioGroup', {
                cls: 'radio-panel',
                columns: 1,
                items: radioItems,
                listeners: {
                    scope: this,
                    change: function(radiogroup, newValue) {
                        this.fireEvent('selectionchange', this, newValue['radio-group']);
                    }
                }
            });
        }

        return this.dropdownRadioGroup;
    }
});