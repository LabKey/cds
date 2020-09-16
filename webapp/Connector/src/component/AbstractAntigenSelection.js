/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.AbstractAntigenSelection', {

    extend: 'Ext.form.Panel',

    cls: 'content antigen-selection-panel',

    border: false,

    subjectNoun: 'Subject',

    totalColumnWidth: 374,
    subjectColumnWidth: 80,

    initCheckboxColumns : function() {
        var checkboxItems = [], prevRecord, columnValueCounts = {}, hasSubjectCount = false,
                fields = this.getFields();

        this.createFieldColumnHeaders(checkboxItems);
        checkboxItems.push(this.createColumnHeaderCmp(this.subjectNoun + ' count', 'col-count-title'));

        this.createAllCheckboxes(checkboxItems);
        checkboxItems.push(this.createSpacerCmp()); // this will eventually be the "hide empty" button

        // create checkbox item tree and add placeholder space in parent columns for layout
        prevRecord = null;
        Ext.each(this.uniqueValuesStore.getRange(), function(record) {
            var concatValue = '', sep = '', addCls;

            for (var i = 0; i < fields.length; i++) {
                concatValue += sep + (record.get(fields[i]) || 'null');
                sep = ChartUtils.ANTIGEN_LEVEL_DELIMITER;

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

                    var alias = fields[i];
                    var dataValue = alias + '-' + concatValue.replace(ChartUtils.ANTIGEN_LEVEL_DELIMITER_REGEX, '-').replace(/ /g, '_');
                    var virusLabel = undefined;

                    //use virus full names for tooltips
                    if (alias === 'study_NAb_virus') {
                        virusLabel = record.raw.study_NAb_virus_full_name;
                    }
                    else if (alias === 'virus') {
                        virusLabel = record.raw.virus_full_name;
                    }
                    checkboxItems.push(this.createCheckboxCmp(alias, record.get(alias), dataValue, record, fields, i, concatValue, addCls, virusLabel));
                }
                else {
                    checkboxItems.push(this.createSpacerCmp());
                }
            }

            checkboxItems.push(this.createSubjectCountCmp(record.get('subjectCount'), record.internalId.replace(ChartUtils.ANTIGEN_LEVEL_DELIMITER_REGEX, '-').replace(/ /g, '_') + '-count', addCls));

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

    getConcatKeyForRecord : function(record, fields) {
        var key = '', sep = '';
        Ext.each(fields, function(field) {
            key += sep + (record.get(field) || 'null');
            sep = ChartUtils.ANTIGEN_LEVEL_DELIMITER;
        });
        return key;
    },

    createColumnHeaderCmp : function(measureLabel, cls, width) {
        return Ext.create('Ext.Component', {
            cls: 'col-title ' + (Ext.isString(cls) ? cls : ''),
            width: width,
            html: Ext.htmlEncode(measureLabel)
        });
    },

    createSpacerCmp : function() {
        return Ext.create('Ext.Component', {
            cls: 'col-spacer'
        });
    },

    createSubjectCountCmp : function(value, testDataValue, addCls) {
        var cls = 'col-count';

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
            tpl: new Ext.XTemplate('<div test-data-value="' + testDataValue + '">{.}</div>'),
            data: value
        });
    },

    createAllCheckboxCmp : function(alias, name) {
        return Ext.create('Ext.form.field.Checkbox', {
            name: alias + '-checkall',
            boxLabel: 'All',
            cls: 'checkbox2 col-check',
            boxLabelAttrTpl: 'test-data-value=' + name + '-all',
            fieldAlias: alias,
            listeners: {
                scope: this,
                change: function(cb, newValue) {
                    // the 'All' checkboxes for any column will result in everything being checked/unchecked
                    Ext.each(this.query('checkbox'), function(relatedCb) {
                        this.setCheckboxValue(relatedCb, newValue, true);
                    }, this);

                    this.onSelectionChange();
                }
            }
        });
    },

    createCheckboxCmp : function(alias, labelraw, dataValue, record, fields, index, value, addCls, virusLabel) {
        var label = labelraw || '[Blank]';

        var checkbox = Ext.create('Ext.form.field.Checkbox', {
            name: alias + '-check',
            boxLabel: label,
            cls: 'checkbox2 col-check ' + addCls,
            boxLabelAttrTpl: 'test-data-value="' + dataValue + '" title="' + (virusLabel ? virusLabel : label) + '"',
            parentFieldAlias: index > 0 ? fields[index - 1] : null,
            fieldAlias: alias,
            fieldValue: labelraw || 'null',
            inputValue: value,
            checked: this.initSelection && this.initSelection.indexOf(value) > -1, // this will set only the leaf checkboxes as checked
            width: this.measureColumnWidth,
            listeners: {
                scope: this,
                change: function(cb, newValue) {
                    this.checkboxSelectionChange(cb, newValue, fields);
                    this.onSelectionChange();
                }
            }
        });

        // add the parent values to this checkbox for reference for the change listeners (see checkboxSelectionChange)
        for (var j = 0; j < index; j++) {
            checkbox[fields[j]] = record.get(fields[j]) || 'null';
        }

        return checkbox;
    },

    createCheckboxGroupCmp : function(items, fields) {
        var checkboxGroup = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'table',
                columns: this.getColumnSize()
            },
            border: false,
            items: items,
            cls: 'antigen-cb-group'
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
        var values = this.getConcatFieldValues();
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


