
Ext.define('Connector.component.AdvancedOptionBase', {

    extend: 'Ext.form.FieldSet',

    border: false,
    allowMultiSelect: false,
    isHierarchical: false,
    storeValueField: 'value',
    storeLabelField: 'label',

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
                    '<div class="field-label">' + Ext.htmlEncode(this.fieldLabel) + ':</div>',
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

    setValue : function(value, allChecked) {
        this.value = value;

        // if multiselect with all checked, set the value as null so we don't apply an unnecessary filter
        this.getHiddenField().setValue(this.allowMultiSelect && allChecked ? null : value);

        this.getDisplayField().update(this.getLabelDisplayValue(value));
    },

    getLabelDisplayValue : function(value) {
        var displayValue = null, subDisplayValue = null, cls = '';
        if (Ext.isArray(value) && value.length > 0) {
            var isAll = Ext.Array.equals(value, this.store.collect(this.storeValueField, true));
            displayValue = this.allowMultiSelect && isAll ? 'All' : value.join(' or ');
            subDisplayValue = this.allowMultiSelect && isAll ? value.join(', ') : null;
        }
        else if (Ext.isString(value) && this.getRecordFromStore(value) != null) {
            displayValue = this.getRecordFromStore(value).get(this.storeLabelField);
        }
        else {
            displayValue = 'Select...';
            cls = 'empty';
        }

        return {
            value: displayValue,
            subValue: subDisplayValue,
            cls: cls
        };
    },

    getDropdownPanelConfig : function() {
        return {
            name: this.fieldName,
            store: this.store,
            initSelection: this.value,
            valueField: this.storeValueField,
            labelField: this.storeLabelField
        };
    },

    getDropdownPanel : function() {
        if (!this.dropdownPanel) {
            var dropdownClassName = 'Connector.panel.AdvancedOptionCheckboxDropdown';
            if (!this.allowMultiSelect) {
                dropdownClassName = 'Connector.panel.AdvancedOptionRadioDropdown';
            }

            this.dropdownPanel = Ext.create(dropdownClassName, this.getDropdownPanelConfig());

            this.dropdownPanel.on('selectionchange', function(dropdown, newSelection, allChecked) {
                this.setValue(newSelection, allChecked);
            }, this);

            this.dropdownPanel.on('show', function(panel) {
                panel.getEl().on('mouseleave', function() {
                    panel.hide();
                    this.getDisplayField().removeCls('expanded');
                }, this);

                panel.getEl().down('.field-display').on('click', function() {
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

                var dropdownPanel = this.getDropdownPanel();
                if (dropdownPanel != null) {
                    this.getDropdownPanel().setWidth(displayValueEl.getWidth());
                    this.getDropdownPanel().showAt(pos[0] + displayLabelEl.getWidth(), pos[1]);
                    this.getDisplayField().addCls('expanded');
                }

                this.fireEvent('click', this, this.isHierarchical);
            }
        }, this);
    },

    getRecordFromStore : function(value) {
        if (this.store) {
            return this.store.findRecord(this.storeValueField, value, 0, false /*anyMatch*/, false /*caseSensitive*/, true /*exactMatch*/);
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
        this.isHierarchical = Ext.isDefined(this.dimension.get('hierarchicalSelectionChild'));

        this.callParent();
        Connector.getService('Query').getMeasureSetDistinctValues(this.dimension, this.populateStore, this);
    },

    populateStore : function(distinctValuesArr) {
        var distinctValues = Ext.Array.pluck(distinctValuesArr, this.dimension.get('name'));
        if (distinctValues.indexOf(null) > -1) {
            distinctValues.splice(distinctValues.indexOf(null), 1);
        }

        this.store = Ext.create('Ext.data.Store', {
            fields : [{name: this.storeValueField, convert: function(value, record) { return record.raw; }}],
            data: distinctValues
        });

        this.setInitialValue();
    },

    setInitialValue : function() {
        // set default value based on the dimension's defaultSelection properties
        var defaultSel = this.dimension.get('defaultSelection');

        if (Ext.isDefined(this.value) && this.value != null) {
            // this.value == null, means select all
            this.setValue(this.value, Ext.Array.equals(this.value, this.store.collect(this.storeValueField, true)));
        }
        else if (defaultSel.all) {
            this.setValue(this.store.collect(this.storeValueField, true), true);
        }
        else if (Ext.isDefined(defaultSel.value) && this.getRecordFromStore(defaultSel.value) != null) {
            this.setValue([defaultSel.value], false);
        }
        else if (this.store.getCount() > 0) {
            this.setValue([this.store.first().get(this.storeValueField)], false);
        }
        else {
            this.setValue([], false);
        }
    },

    setValue : function(value, allChecked) {
        if (!Ext.isDefined(value)) {
            value = [];
        }
        else if (!Ext.isArray(value)) {
            value = [value];
        }

        this.callParent([value, allChecked]);
    },

    getDropdownPanel : function() {
        return this.isHierarchical ? null : this.callParent();
    }
});


Ext.define('Connector.component.AdvancedOptionScale', {

    extend: 'Connector.component.AdvancedOptionBase',

    fieldName: 'scale',
    fieldLabel: 'Scale',

    constructor : function(config) {
        if (config.measure == undefined || config.measure.$className !== 'Connector.model.Measure') {
            console.error('Advanced option scale field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.store = Ext.create('Ext.data.Store', {
            fields: [this.storeValueField, this.storeLabelField],
            data: [
                {value: 'LINEAR', label: 'Linear'},
                {value: 'LOG', label: 'Log'}
            ]
        });

        this.setValue(this.value || this.measure.get('defaultScale'), false);

        this.callParent();
    }
});


Ext.define('Connector.component.AdvancedOptionTime', {

    extend: 'Connector.component.AdvancedOptionBase',

    value: null,
    fieldName: null,
    fieldLabel: null,
    singleUseOnly: true,
    storeValueField: 'Name',
    storeLabelField: 'Caption',

    constructor : function(config) {
        if (config.measure == undefined || config.measure.$className !== 'Connector.model.Measure') {
            console.error('Advanced option scale field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.allowMultiSelect = !this.singleUseOnly;

        this.store = Connector.getApplication().getStore(this.singleUseOnly ? 'VisitTagSingleUse' : 'VisitTagMultiUse');
        if (this.store.isLoading()) {
            this.store.on('load', this.setInitialValue, this);
        }
        else {
            this.setInitialValue();
        }

        this.callParent();
    },

    setInitialValue : function() {
        // if the passed in initial value doesn't exist in the store, clear it out
        if (!Ext.isDefined(this.value) || (this.value != null && this.getRecordFromStore(this.value) == null)) {
            this.value = null;
        }

        // TODO: default to align by Day0 if no initial value present
        this.setValue(this.value, false);
    },

    getLabelDisplayValue : function(value) {
        var displayValue = 'Unaligned';
        if (value && this.getRecordFromStore(value)) {
            displayValue = this.getRecordFromStore(value).get(this.storeLabelField);
        }

        return {value: displayValue};
    },

    getDropdownPanelConfig : function() {
        var config = this.callParent();

        // for 'Align by' time option, append the 'Unaligned' radio item
        if (this.singleUseOnly) {
            config.additionalItems = [{
                boxLabel: 'Unaligned',
                inputValue: null,
                checked: this.value == null
            }];
        }

        return config;
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
    additionalItems: [],

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
                cls: 'cb-all-panel checkbox2',
                name: this.name + '-checkall',
                boxLabel: 'All',
                inputValue: undefined,
                checked: this.initSelection && Ext.Array.equals(this.initSelection, this.store.collect(this.valueField, true)),
                listeners: {
                    scope: this,
                    change: function(cb, newValue) {
                        // loop through each checkbox in the group so we can suspend the events while setting the value
                        Ext.each(this.getDropdownCheckboxGroup().getBoxes(), function(checkbox) {
                            checkbox.suspendEvents(false);
                            checkbox.setValue(newValue);
                            checkbox.resumeEvents();
                        }, this);

                        this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()[this.name + '-check'], newValue);
                    }
                }
            });
        }

        return this.dropdownSelectAllCb;
    },

    getDropdownCheckboxGroup : function() {
        if (!this.dropdownCheckboxGroup) {
            var checkboxItems = Ext.clone(this.additionalItems) || [];
            Ext.each(this.store.getRange(), function(record) {
                checkboxItems.push({
                    cls: 'checkbox2',
                    boxLabel: record.get(this.labelField) || record.get(this.valueField),
                    inputValue: record.get(this.valueField),
                    checked: this.initSelection && this.initSelection.indexOf(record.get(this.valueField)) > -1,
                    listeners: {
                        scope: this,
                        change: function(cb, newValue) {
                            var selectAllCb = this.getDropdownSelectAllCb(),
                                checkAll = this.store.getCount() == this.dropdownCheckboxGroup.getChecked().length;

                            selectAllCb.suspendEvents(false);
                            selectAllCb.setValue(checkAll);
                            selectAllCb.resumeEvents();

                            this.fireEvent('selectionchange', this, this.dropdownCheckboxGroup.getValue()[this.name + '-check'], checkAll);
                        }
                    }
                });
            }, this);

            // set the 'name' property for all items in this checkbox group
            Ext.each(checkboxItems, function(item) {
                item.name = this.name + '-check';
            }, this);

            this.dropdownCheckboxGroup = Ext.create('Ext.form.CheckboxGroup', {
                cls: 'cb-panel',
                columns: 1,
                validateOnChange: false,
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
        if (!this.dropdownRadioGroup) {
            var radioItems = Ext.clone(this.additionalItems) || [];
            Ext.each(this.store.getRange(), function(record) {
                radioItems.push({
                    boxLabel: record.get(this.labelField) || record.get(this.valueField),
                    inputValue: record.get(this.valueField),
                    checked: this.initSelection && this.initSelection.indexOf(record.get(this.valueField)) > -1
                });
            }, this);

            // set the 'name' property for all items in this radio group
            Ext.each(radioItems, function(item) {
                item.name = this.name + '-radio';
            }, this);

            this.dropdownRadioGroup = Ext.create('Ext.form.RadioGroup', {
                cls: 'radio-panel',
                columns: 1,
                items: radioItems,
                validateOnChange: false,
                listeners: {
                    scope: this,
                    change: function(radiogroup, newValue) {
                        this.fireEvent('selectionchange', this, newValue[this.name + '-radio'], false);
                    }
                }
            });
        }

        return this.dropdownRadioGroup;
    }
});


Ext.define('Connector.panel.HierarchicalSelectionPanel', {

    extend: 'Ext.form.Panel',

    cls: 'hierarchy-selection content',

    border: false,

    constructor : function(config) {
        this.queryService = Connector.getService('Query');

        this.callParent([config]);

        // traverse the dimension hierarchical selection child lookups to get the full tree set
        this.hierarchyMeasures = [this.dimension];
        var childAlias = this.dimension.get('hierarchicalSelectionChild');
        while (childAlias) {
            var childMeasure = this.queryService.getMeasureRecordByAlias(childAlias);
            if (childMeasure) {
                this.hierarchyMeasures.push(childMeasure);
                childAlias = childMeasure.get('hierarchicalSelectionChild');
            }
            else {
                childAlias = null;
            }
        }

        this.queryService.getMeasureSetDistinctValues(this.hierarchyMeasures, this.loadDistinctValuesStore, this);
    },

    loadDistinctValuesStore : function(rows) {

        var fieldNames = Ext.Array.pluck(Ext.Array.pluck(this.hierarchyMeasures, 'data'), 'name');
        var uniqueValuesStore = Ext.create('Ext.data.Store', {
            fields: fieldNames,
            data: rows
        });

        // add a column header for each hierarchical measure
        var checkboxItems = [];
        Ext.each(this.hierarchyMeasures, function(measure) {
            checkboxItems.push({
                xtype: 'component',
                cls: 'col-title',
                html: Ext.htmlEncode(measure.get('label'))
            });
        });

        // add 'All' checkbox for each column
        for (var i = 0; i < fieldNames.length; i++) {
            checkboxItems.push({
                xtype: 'checkboxfield',
                cls: 'checkbox2 col-check',
                name: fieldNames[i] + '-checkall',
                boxLabel: 'All',
                inputValue: undefined,
                fieldName: fieldNames[i],
                checked: true,
                listeners: {
                    scope: this,
                    change: function(cb, newValue) {
                        // the 'All' checkboxes for any column will result in everything being checked/unchecked
                        Ext.each(this.query('checkbox'), function(relatedCb) {
                            this.setCheckboxValue(relatedCb, newValue, true);
                        }, this);
                    }
                }
            });
        }

        // create checkbox item tree and add placeholder space in parent columns for layout
        var prevRecord = null;
        Ext.each(uniqueValuesStore.getRange(), function(record) {
            for (var i = 0; i < fieldNames.length; i++) {

                if (prevRecord == null || !this.hierarchicalRecordEqual(prevRecord, record, fieldNames, i)) {

                    // add border line above checkbox for parent columns or first row in last column for a given group
                    var addCls = '';
                    if (prevRecord == null || i < fieldNames.length - 1 || !this.hierarchicalRecordEqual(prevRecord, record, fieldNames, i-1)) {
                        addCls = 'col-line';
                    }

                    var checkbox = {
                        xtype: 'checkboxfield',
                        cls: 'checkbox2 col-check ' + addCls,
                        name: fieldNames[i] + '-check',
                        boxLabel: record.get(fieldNames[i]) || '[Blank]',
                        inputValue: record.get(fieldNames[i]),
                        fieldName: fieldNames[i],
                        parentFieldName: i > 0 ? fieldNames[i-1] : null,
                        checked: true,
                        width: 440 / this.hierarchyMeasures.length,
                        listeners: {
                            scope: this,
                            change: function(cb, newValue) {
                                this.checkboxSelectionChange(cb, newValue, fieldNames);
                            }
                        }
                    };

                    // add the parent values to this checkbox for reference for the change listeners (see checkboxSelectionChange)
                    for (var j = 0; j < i; j++) {
                        checkbox[fieldNames[j]] = record.get(fieldNames[j]);
                    }

                    checkboxItems.push(checkbox);
                }
                else {
                    checkboxItems.push({
                        xtype: 'component',
                        cls: 'col-spacer'
                    });
                }
            }

            prevRecord = record;
        }, this);

        this.add(Ext.create('Ext.form.CheckboxGroup', {
            columns: this.hierarchyMeasures.length,
            items: checkboxItems
        }));
    },

    hierarchicalRecordEqual : function(prev, current, fieldNames, lastFieldIndex) {
        for (var i = 0; i <= lastFieldIndex; i++) {
            if (prev.get(fieldNames[i]) != current.get(fieldNames[i])) {
                return false;
            }
        }
        return true;
    },

    checkboxSelectionChange : function(cb, newValue, fieldNames, skipChildren) {
        var me = this, selection, parentSelection, siblingCbs, toCheck, parentParentSelection, parentCb, allCb;

        // update child checkboxes
        selection = '[' + cb.fieldName + '=' + cb.inputValue + ']';
        parentSelection = me.getParentSelectorStr(cb, fieldNames);
        if (!skipChildren) {
            Ext.each(me.query('checkbox' + selection + parentSelection), function(relatedCb) {
                me.setCheckboxValue(relatedCb, newValue, false);
            });
        }

        // update the related column's 'All' checkbox
        siblingCbs = me.query('checkbox[fieldName=' + cb.fieldName + '][boxLabel!=All]');
        toCheck = Ext.Array.min(Ext.Array.pluck(siblingCbs, 'checked')); //array max works like 'are all checked' for boolean array
        allCb = me.down('checkbox[boxLabel=All][fieldName=' + cb.fieldName + ']');
        me.setCheckboxValue(allCb, toCheck, true);

        // finally, update parent checkbox
        if (cb.parentFieldName && parentSelection != '') {
            siblingCbs = me.query('checkbox[fieldName=' + cb.fieldName + ']' + parentSelection);
            toCheck = Ext.Array.max(Ext.Array.pluck(siblingCbs, 'checked')); //array max works like 'is any checked' for boolean array
            parentParentSelection = me.getParentSelectorStr(cb, fieldNames, cb.parentFieldName);
            parentCb = me.down('checkbox[fieldName=' + cb.parentFieldName + '][inputValue=' + cb[cb.parentFieldName] + ']' + parentParentSelection);
            if (parentCb) {
                me.setCheckboxValue(parentCb, toCheck, true);
                me.checkboxSelectionChange(parentCb, toCheck, fieldNames, true);
            }
        }
    },

    getParentSelectorStr : function(cb, fieldNames, excludingFieldName) {
        var parentSelection = '',
            field;

        for (var j = 0; j < fieldNames.length; j++) {
            field = fieldNames[j];
            if (Ext.isDefined(cb[field]) && excludingFieldName != field) {
                parentSelection += '[' + field + '=' + cb[field] + ']';
            }
        }
        return parentSelection;
    },

    setCheckboxValue : function(cb, value, suspendEvents) {
        if (suspendEvents) {
            cb.suspendEvents(false);
        }

        cb.setValue(value);

        if (suspendEvents) {
            cb.resumeEvents();
        }
    }
});