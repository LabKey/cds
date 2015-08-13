Ext.define('Connector.panel.AntigenSelection', {

    extend: 'Ext.form.Panel',

    cls: 'content',

    border: false,

    totalColumnWidth: 340,
    subjectColumnWidth: 83,

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('selectionchange');

        this.hierarchyMeasures = this.dimension.getHierarchicalMeasures();

        Connector.getService('Query').getMeasureValueSubjectCount(
            this.hierarchyMeasures[this.hierarchyMeasures.length - 1],
            this.measureSetStore.measureSet,
            this.filterOptionValues,
            this.loadDistinctValuesStore,
            this
        );
    },

    initCheckboxColumns : function() {
        var checkboxItems = [], prevRecord, columnValueCounts = {}, hasSubjectCount = false,
            fields = Ext.Array.pluck(Ext.Array.pluck(this.hierarchyMeasures, 'data'), 'alias');

        // add a column header for each hierarchical measure and the subject counts
        Ext.each(this.hierarchyMeasures, function(measure) {
            checkboxItems.push(this.createColumnHeaderCmp(measure, null, Math.floor(this.totalColumnWidth / this.hierarchyMeasures.length)));
        }, this);
        checkboxItems.push(this.createColumnHeaderCmp('Subject count', 'col-count-title', this.subjectColumnWidth));

        // add 'All' checkbox for each hierarchical measure
        Ext.each(this.hierarchyMeasures, function(measure) {
            checkboxItems.push(this.createAllCheckboxCmp(measure));
        }, this);
        checkboxItems.push(this.createSpacerCmp()); // this will eventually be the "hide empty" button

        // create checkbox item tree and add placeholder space in parent columns for layout
        prevRecord = null;
        Ext.each(this.uniqueValuesStore.getRange(), function(record) {
            var concatValue = '', sep = '', addCls;

            for (var i = 0; i < fields.length; i++) {
                concatValue += sep + record.get(fields[i]);
                sep = '|';

                if (!Ext.isDefined(columnValueCounts[concatValue])) {
                    columnValueCounts[concatValue] = 0;
                }
                columnValueCounts[concatValue] += record.get('subjectCount');

                if (prevRecord == null || !this.hierarchicalRecordEqual(prevRecord, record, fields, i)) {

                    // add border line above checkbox for parent columns or first row in last column for a given group
                    addCls = '';
                    if (prevRecord == null || i < fields.length - 1 || !this.hierarchicalRecordEqual(prevRecord, record, fields, i-1)) {
                        addCls = 'col-line';
                    }

                    checkboxItems.push(this.createCheckboxCmp(record, fields, i, concatValue, addCls));
                }
                else {
                    checkboxItems.push(this.createSpacerCmp());
                }
            }

            checkboxItems.push(this.createSubjectCountCmp(record, addCls));

            prevRecord = record;
        }, this);

        // mark those checkboxes with no subject count so they look disabled
        Ext.each(checkboxItems, function(cb) {
            hasSubjectCount = Ext.isDefined(cb.inputValue) && Ext.isDefined(columnValueCounts[cb.inputValue]);
            if (hasSubjectCount && columnValueCounts[cb.inputValue] == 0) {
                cb.addCls('col-disable');
            }
        }, this);

        this.add(this.createCheckboxGroupCmp(checkboxItems, fields));
    },

    loadDistinctValuesStore : function(subjectCountMap) {
        var rows = [], fields = [], sorters = [], filterColumnAlias, filterColumnValue;

        Ext.each(this.hierarchyMeasures, function(measure) {
            fields.push(measure.get('alias'));
            sorters.push({property: measure.get('alias')});

            if (Ext.isDefined(measure.get('distinctValueFilterColumnAlias')) && Ext.isDefined(measure.get('distinctValueFilterColumnValue'))) {
                filterColumnAlias = measure.get('distinctValueFilterColumnAlias');
                filterColumnValue = measure.get('distinctValueFilterColumnValue');
            }
        }, this);

        this.uniqueValuesStore = Ext.create('Ext.data.ArrayStore', {
            model: Ext.define('UniqueValueModel' + Ext.id(), {
                extend: 'Ext.data.Model',
                fields: ['key', 'subjectCount'].concat(fields),
                idProperty: 'key'
            }),
            sorters: sorters
        });

        // filter on the data summary column for its distinct values and create a key so we don't load duplicates into the store
        Ext.each(this.measureSetStore.query(filterColumnAlias, filterColumnValue, false, true, true).items, function(record) {
            var data = Ext.clone(record.data);
            data.key = this.getConcatKeyForRecord(record, fields);
            data.subjectCount = subjectCountMap[data.key] || 0;

            rows.push(data);
        }, this);

        this.uniqueValuesStore.loadData(rows);

        this.initCheckboxColumns();
    },

    getConcatKeyForRecord : function(record, fields) {
        var key = '', sep = '';
        Ext.each(fields, function(field) {
            key += sep + record.get(field);
            sep = '|';
        });
        return key;
    },

    createColumnHeaderCmp : function(measure, cls, width) {
        return Ext.create('Ext.Component', {
            cls: 'col-title ' + (Ext.isString(cls) ? cls : ''),
            width: width,
            html: Ext.htmlEncode(Ext.isObject(measure) ? measure.get('label') : measure)
        });
    },

    createSpacerCmp : function() {
        return Ext.create('Ext.Component', {
            cls: 'col-spacer'
        });
    },

    createSubjectCountCmp : function(record, addCls) {
        var value = record.get('subjectCount'), cls = 'col-count';

        if (value == 0) {
            value = '0';
            cls += ' col-disable';
        }

        if (Ext.isString(addCls)) {
            cls += ' ' + addCls;
        }

        return Ext.create('Ext.Component', {
            cls: cls,
            width: this.subjectColumnWidth,
            html: value
        });
    },

    createAllCheckboxCmp : function(measure) {
        return Ext.create('Ext.form.field.Checkbox', {
            name: measure.get('alias') + '-checkall',
            boxLabel: 'All',
            cls: 'checkbox2 col-check',
            boxLabelAttrTpl: 'test-data-value=' + measure.get('name') + '-all',
            fieldAlias: measure.get('alias'),
            listeners: {
                scope: this,
                change: function(cb, newValue) {
                    // the 'All' checkboxes for any column will result in everything being checked/unchecked
                    Ext.each(this.query('checkbox'), function(relatedCb) {
                        this.setCheckboxValue(relatedCb, newValue, true);
                    }, this);

                    var selectedValues = this.getSelectedValues();
                    this.fireEvent('selectionchange', selectedValues, this.uniqueValuesStore.getCount() == selectedValues.length);
                }
            }
        });
    },

    createCheckboxCmp : function(record, fields, index, value, addCls) {
        var checkbox = Ext.create('Ext.form.field.Checkbox', {
            name: fields[index] + '-check',
            boxLabel: record.get(fields[index]) || '[Blank]',
            cls: 'checkbox2 col-check ' + addCls,
            boxLabelAttrTpl: 'test-data-value=' + fields[index] + '-' + value.replace(/\|/g, '-').replace(/ /g, '_'),
            parentFieldAlias: index > 0 ? fields[index - 1] : null,
            fieldAlias: fields[index],
            fieldValue: record.get(fields[index]),
            inputValue: value,
            checked: this.initSelection && this.initSelection.indexOf(value) > -1, // this will set only the leaf checkboxes as checked
            width: Math.floor(this.totalColumnWidth / this.hierarchyMeasures.length),
            listeners: {
                scope: this,
                change: function(cb, newValue) {
                    this.checkboxSelectionChange(cb, newValue, fields);

                    var selectedValues = this.getSelectedValues();
                    this.fireEvent('selectionchange', selectedValues, this.uniqueValuesStore.getCount() == selectedValues.length);
                }
            }
        });

        // add the parent values to this checkbox for reference for the change listeners (see checkboxSelectionChange)
        for (var j = 0; j < index; j++) {
            checkbox[fields[j]] = record.get(fields[j]);
        }

        return checkbox;
    },

    createCheckboxGroupCmp : function(items, fields) {
        var checkboxGroup = Ext.create('Ext.form.CheckboxGroup', {
            columns: this.hierarchyMeasures.length + 1,
            items: items
        });

        // before render, update the leaf checkbox parents and all checkbox accordingly
        checkboxGroup.on('beforerender', function(cbGroup) {
            Ext.each(this.initSelection, function(selectValue) {
                var cb = cbGroup.down('checkbox[inputValue=' + selectValue + ']');
                if (cb) {
                    this.checkboxSelectionChange(cb, true, fields, true);
                }
            }, this);
        }, this);

        return checkboxGroup;
    },

    getSelectedValues : function() {
        // use the last hierarchyMeasure as the inputValues are concatenated from the parent column values
        var values = this.getValues()[this.hierarchyMeasures[this.hierarchyMeasures.length - 1].get('alias') + '-check'];
        if (!Ext.isDefined(values)) {
            values = [];
        }
        else if (!Ext.isArray(values)) {
            values = [values];
        }
        return values;
    },

    hierarchicalRecordEqual : function(prev, current, fields, lastFieldIndex) {
        for (var i = 0; i <= lastFieldIndex; i++) {
            if (prev.get(fields[i]) != current.get(fields[i])) {
                return false;
            }
        }
        return true;
    },

    checkboxSelectionChange : function(cb, newValue, fields, skipChildren) {
        var me = this, selection, parentSelection, siblingCbs, toCheck, parentParentSelection, parentCb, allCb;

        // update child checkboxes
        selection = '[' + cb.fieldAlias + '=' + cb.fieldValue + ']';
        parentSelection = me.getParentSelectorStr(cb, fields);
        if (!skipChildren) {
            Ext.each(me.query('checkbox' + selection + parentSelection), function(relatedCb) {
                me.setCheckboxValue(relatedCb, newValue, false);
            });
        }

        // update the related column's 'All' checkbox
        siblingCbs = me.query('checkbox[fieldAlias=' + cb.fieldAlias + '][boxLabel!=All]');
        toCheck = Ext.Array.min(Ext.Array.pluck(siblingCbs, 'checked')); //array max works like 'are all checked' for boolean array
        allCb = me.down('checkbox[boxLabel=All][fieldAlias=' + cb.fieldAlias + ']');
        me.setCheckboxValue(allCb, toCheck, true);

        // finally, update parent checkbox
        if (cb.parentFieldAlias && parentSelection != '') {
            siblingCbs = me.query('checkbox[fieldAlias=' + cb.fieldAlias + ']' + parentSelection);
            toCheck = Ext.Array.max(Ext.Array.pluck(siblingCbs, 'checked')); //array max works like 'is any checked' for boolean array
            parentParentSelection = me.getParentSelectorStr(cb, fields, cb.parentFieldAlias);
            parentCb = me.down('checkbox[fieldAlias=' + cb.parentFieldAlias + '][fieldValue=' + cb[cb.parentFieldAlias] + ']' + parentParentSelection);
            if (parentCb) {
                me.setCheckboxValue(parentCb, toCheck, true);
                me.checkboxSelectionChange(parentCb, toCheck, fields, true);
            }
        }
    },

    getParentSelectorStr : function(cb, fields, excludingFieldAlias) {
        var parentSelection = '',
                field;

        for (var j = 0; j < fields.length; j++) {
            field = fields[j];
            if (Ext.isDefined(cb[field]) && excludingFieldAlias != field) {
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