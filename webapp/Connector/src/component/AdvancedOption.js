/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.AdvancedOptionBase', {

    extend: 'Ext.form.FieldSet',

    border: false,
    allowMultiSelect: false,
    isHierarchical: false,
    storeValueField: 'value',
    storeLabelField: 'label',
    testCls: undefined,
    measureSet: [],

    initComponent : function() {
        if (!Ext.isEmpty(this.testCls)) {
            this.addCls(this.testCls);
        }

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
            // compare arrays, sorting the distinct value collection from the store
            var isAll = Ext.Array.equals(value.sort(), this.store.collect(this.storeValueField, true).sort());

            displayValue = this.allowMultiSelect && isAll ? 'All' : this.getRecordsDisplayValue(value, ' or ');
            subDisplayValue = this.allowMultiSelect && isAll ? this.getRecordsDisplayValue(value, ', ') : null;
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

    getRecordsDisplayValue : function(valueArr, sepVal) {
        var displayVal = '', sep = '';
        Ext.each(valueArr, function(value) {
            var record = this.getRecordFromStore(value);
            if (record) {
                displayVal += sep + this.getRecordFromStore(value).get(this.storeLabelField);
                sep = sepVal;
            }
        }, this);

        return displayVal;
    },

    getDropdownPanelConfig : function() {
        return {
            testCls: this.testCls + '-dropdown',
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
        // only add the click handler if the display field has rendered and the store has been created
        if (Ext.isDefined(this.store) && this.getDisplayField().rendered) {

            // hide the advanced option fields that have no dropdown entries, change those
            // with just a single entry to display only (currently only for summary level),
            // or add the click handler for the dropdown
            var storeCount = this.store.getCount();
            if (storeCount == 0) {
                this.hide();
            }
            else if (this.fieldName.indexOf('_summary_level') > 0 && storeCount == 1) {
                this.getDisplayField().addCls('display-option-only');
            }
            else {
                var displayEl = this.getDisplayField().getEl();
                displayEl.on('click', function(evt, target) {
                    if (target.getAttribute('class') != 'field-label') {
                        this.onDisplayFieldClick();
                    }
                }, this);
            }
        }
    },

    onDisplayFieldClick : function() {
        this.fireEvent('click', this, this.isHierarchical);
    },

    showDropdownPanel : function(filterOptionValues, selectorMeasure, plotAxis) {
        var dropdownPanel = this.getDropdownPanel(),
            displayEl = this.getDisplayField().getEl(),
            displayLabelEl, displayValueEl, pos;

        if (dropdownPanel != null) {
            if (Ext.isDefined(filterOptionValues)) {
                Connector.getService('Query').getMeasureValueSubjectCount(
                    this.dimension,
                    selectorMeasure,
                    this.store.measureSet,
                    filterOptionValues,
                    plotAxis,
                    this.loadValueSubjectCounts,
                    this
                );
            }

            displayLabelEl = displayEl.down('.field-label');
            displayValueEl = displayEl.down('.field-display');
            pos = this.getDisplayField().getPosition();

            this.getDropdownPanel().setWidth(displayValueEl.getWidth());
            this.getDropdownPanel().showAt(pos[0] + displayLabelEl.getWidth(), pos[1]);
            this.getDisplayField().addCls('expanded');
        }
    },

    loadValueSubjectCounts : function(subjectCountMap) {
        Ext.each(this.store.getRange(), function(record) {
            record.set('subjectCount', subjectCountMap[record.get(this.storeValueField)] || 0);

            // update the display cls of the checkbox/radio
            this.updateOptionDisplayCls(record.get(this.storeValueField), record.get('subjectCount'));
        }, this);
    },

    updateOptionDisplayCls : function(inputValue, subjectCount) {
        var dropdownPanel = this.getDropdownPanel(), childEl;

        // look for the matching checkbox or radio based on the input value
        childEl = dropdownPanel.down((this.allowMultiSelect ? 'checkbox' : 'radio') + '[inputValue=' + inputValue + ']');
        if (childEl) {
            if (subjectCount == 0) {
                childEl.addCls('look-disabled');
            }
            else {
                childEl.removeCls('look-disabled');
            }
        }
    },

    getRecordFromStore : function(value) {
        if (this.store) {
            return this.store.findRecord(this.storeValueField, value, 0, false /*anyMatch*/, false /*caseSensitive*/, true /*exactMatch*/);
        }
        return null;
    },

    getMeasureSet : function() {
        return this.measureSet;
    }
});


Ext.define('Connector.component.AdvancedOptionDimension', {

    extend: 'Connector.component.AdvancedOptionBase',

    alias: 'widget.advancedoptiondimension',

    constructor : function(config) {
        if (config.dimension == undefined || config.dimension.$className !== 'Connector.model.Measure') {
            console.error('Advanced option dimension field must be defined using a Measure record.');
        }

        this.callParent([config]);

        this.addEvents('change');
    },

    initComponent : function() {
        this.fieldName = this.dimension.get('alias');
        this.fieldLabel = this.dimension.get('label');
        this.allowMultiSelect = this.dimension.get('allowMultiSelect');
        this.isHierarchical = Ext.isDefined(this.dimension.get('hierarchicalSelectionParent'));

        // for hierarchical dimensions, use the last one as the label
        this.measureSet = [this.dimension];
        if (this.isHierarchical) {
            this.measureSet = this.dimension.getHierarchicalMeasures();
            this.fieldLabel = this.measureSet[this.measureSet.length - 1].get('label');
        }

        // pull distinctValueFilterColumnAlias property up out of dimension.data so we can query for components easier (see Selector.js bindDimensions)
        if (Ext.isDefined(this.dimension.get('distinctValueFilterColumnAlias'))) {
            this.distinctValueFilterColumnAlias = this.dimension.get('distinctValueFilterColumnAlias');
        }

        this.callParent();
    },

    getHiddenField : function() {
        if (!this.hiddenField) {
            this.hiddenField = Ext.create('Ext.form.field.Hidden', {
                // hierarchical dimensions can have use an alternate column for filtering
                name: this.dimension.getFilterMeasure().get('alias'),
                getValue: function() {
                    return this.value;
                }
            });
        }

        return this.hiddenField;
    },

    populateStore : function(distinctValuesArr, measureSet) {
        var data = [];
        Ext.each(distinctValuesArr, function(value) {
            if (value != null) {
                var valueObj = {subjectCount: -1};
                valueObj[this.storeValueField] = value;
                valueObj[this.storeLabelField] = value.toString().replace(ChartUtils.ANTIGEN_LEVEL_DELIMITER_REGEX, ' ').replace(/null/g, '[Blank]');
                data.push(valueObj);
            }
        }, this);

        this.store = Ext.create('Ext.data.Store', {
            measureSet: measureSet,
            fields: [this.storeValueField, this.storeLabelField, 'subjectCount'],
            sorters: [{property: this.storeLabelField}],
            data: data
        });

        this.addClickHandler();

        this.setInitialValue();
    },

    setInitialValue : function() {
        // set default value based on the dimension's defaultSelection properties
        var defaultSel = this.dimension.get('defaultSelection');

        if (Ext.isDefined(this.value) && this.value != null) {
            this.setValue(this.value, Ext.Array.equals(this.value, this.store.collect(this.storeValueField, true)));
        }
        else if (defaultSel.all || (Ext.isDefined(this.value) && this.value == null)) {
            // this.value == null, means select all
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

        this.fireEvent('change', this);
    },

    clearValue : function() {
        this.value = null;
        this.setInitialValue();
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

        this.setValue(this.measure.get('defaultScale') || this.value, false);

        this.callParent();
    },

    onDisplayFieldClick : function() {
        this.showDropdownPanel();
    }
});

Ext.define('Connector.component.AdvancedOptionTimeAxisType', {

    extend: 'Connector.component.AdvancedOptionBase',

    fieldName: 'timeAxisType',
    fieldLabel: 'Axis type',

    constructor : function(config) {
        if (config.measure == undefined || config.measure.$className !== 'Connector.model.Measure') {
            console.error('Advanced option axis type field must be defined using a Measure record.');
        }

        this.callParent([config]);
    },

    initComponent : function() {
        this.store = Ext.create('Ext.data.Store', {
            fields: [this.storeValueField, this.storeLabelField],
            data: [
                {value: 'Continuous', label: 'Continuous'},
                {value: 'Categorical', label: 'Categorical'}
            ]
        });

        this.setValue(this.value, false);

        this.callParent();
    },

    onDisplayFieldClick : function() {
        this.showDropdownPanel();
    }
});

Ext.define('Connector.component.AdvancedOptionTimeAlignedBy', {

    extend: 'Connector.component.AdvancedOptionBase',

    fieldName: 'alignmentVisitTag',
    fieldLabel: 'Aligned by',
    singleUseOnly: true,
    storeValueField: 'Name',
    storeLabelField: 'Caption',
    value: null,

    constructor : function(config) {
        if (config.measure == undefined || config.measure.$className !== 'Connector.model.Measure') {
            console.error('Advanced option aligned by field must be defined using a Measure record.');
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

    onDisplayFieldClick : function() {
        this.showDropdownPanel();
    },

    setInitialValue : function() {
        // if the passed in initial value doesn't exist in the store, clear it out
        if (!Ext.isDefined(this.value) || (this.value != null && this.getRecordFromStore(this.value) == null)) {
            this.value = null;
        }

        this.setValue(this.value, false);
    },

    getLabelDisplayValue : function(value) {
        var displayValue = 'Aligned by Day 0';
        if (value && this.getRecordFromStore(value)) {
            displayValue = this.getRecordFromStore(value).get(this.storeLabelField);
        }

        return {value: displayValue};
    },

    getDropdownPanelConfig : function() {
        var config = this.callParent();

        // for 'Align by' time option, append the 'Aligned by Day 0' radio item
        if (this.singleUseOnly) {
            config.additionalItems = [{
                boxLabel: 'Aligned by Day 0',
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
        if (!Ext.isEmpty(this.testCls)) {
            this.addCls(this.testCls);
        }

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
                checked: Ext.isArray(this.initSelection) && Ext.Array.equals(this.initSelection.sort(), this.store.collect(this.valueField, true).sort()),
                listeners: {
                    scope: this,
                    change: function(cb, newValue) {
                        // loop through each checkbox in the group so we can suspend the events while setting the value
                        Ext.each(this.getDropdownCheckboxGroup().getBoxes(), function(checkbox) {
                            checkbox.suspendEvents(false);
                            checkbox.setValue(newValue);
                            checkbox.resumeEvents();
                        }, this);

                        this.fireEvent('selectionchange', this, this.getDropdownCheckboxGroup().getValue()[this.cbItemId], newValue);
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
                    cls: 'checkbox2 ' + (record.get('subjectCount') == 0 ? 'look-disabled' : ''),
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

                            this.fireEvent('selectionchange', this, this.dropdownCheckboxGroup.getValue()[this.cbItemId], checkAll);
                        }
                    }
                });
            }, this);

            // issue: 23836 set the 'name' property for all items in this checkbox group using a unique value
            this.cbItemId = Ext.id();
            Ext.each(checkboxItems, function(item) {
                item.name = this.cbItemId;
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

            // issue: 23836 set the 'name' property for all items in this radio group using a unique value
            var id = Ext.id();
            Ext.each(radioItems, function(item) {
                item.name = id;
            }, this);

            this.dropdownRadioGroup = Ext.create('Ext.form.RadioGroup', {
                cls: 'radio-panel',
                columns: 1,
                items: radioItems,
                validateOnChange: false,
                listeners: {
                    scope: this,
                    change: function(radiogroup, newValue) {
                        this.fireEvent('selectionchange', this, newValue[id], false);
                    }
                }
            });
        }

        return this.dropdownRadioGroup;
    }
});
