/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Group', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid',

    itemPluralName: 'Groups',

    showLoadingMask: true,

    id: 'learn-group-grid-id',

    features: [{
        ftype: 'grouping',
        groupHeaderTpl: [
            '<div id={name}>{name:this.formatName}</div>',
            {
                formatName: function(name) {
                    if (name.indexOf('1_my_saved_groups') > -1) {
                        return 'My saved groups';
                    }
                    else if (name.indexOf('2_curated_groups') > -1) {
                        return 'Curated groups';
                    }
                }
            }
        ],

        groupCls: 'learn-grid-group-hd',
        eventSelector: '.learn-grid-group-hd',

        collapsedCls: 'learn-grid-group-collapsed',
        hdCollapsedCls: 'learn-grid-group-hd-collapsed',
        collapsibleCls: 'learn-grid-group-hd-collapsible',
        collapsible: true,

        // groupTpl below is similar to groupTpl in ext-all-dev.js, line 158286 (or ext-all-debug.js, line 111454),
        // below we've added customizations around the group header title and collapsible buttons
        groupTpl: [
            '{%',
                'var me = this.groupingFeature;',

                'if (me.disabled) {',
                    'values.needsWrap = false;',
                '} else {',
                    'me.setupRowData(values.record, values.recordIndex, values);',
                    'values.needsWrap = !me.disabled && (values.isFirstRow || values.summaryRecord);',
                '}',
            '%}',
            '<tpl if="needsWrap">',
                '<tr data-boundView="{view.id}" data-recordId="{record.internalId}" data-recordIndex="{[values.isCollapsedGroup ? -1 : values.recordIndex]}"',
                    'class="{[values.itemClasses.join(" ")]} ' + Ext.baseCSSPrefix + 'grid-wrap-row<tpl if="!summaryRecord"> ' + Ext.baseCSSPrefix + 'grid-group-row</tpl>">',
                    '<td class="' + Ext.baseCSSPrefix + 'group-hd-container" colspan="{columns.length}">',
                        '<tpl if="isFirstRow">',
                            '{%',
                                'var groupTitleStyle = (!values.view.lockingPartner || (values.view.ownerCt === values.view.ownerCt.ownerLockable.lockedGrid) || (values.view.lockingPartner.headerCt.getVisibleGridColumns().length === 0)) ? "" : "visibility:hidden";',
                            '%}',
                            '<tpl if="groupId.indexOf(\'saved_groups\') !== -1">',
                                '<div id="{groupId}" class="learn-grid-group-hd learn-grid-group-hd-collapsible" tabIndex="0">',
                                    '<div class="learn-grid-group-title" style="{[groupTitleStyle]} background-position: 140px center">',
                                        '{[values.groupHeaderTpl.apply(values.groupInfo, parent) || "&#160;"]}',
                                    '</div>',
                                '</div>',
                            '<tpl elseif="groupId.indexOf(\'curated_groups\') !== -1">',
                                '<div id="{groupId}" class="learn-grid-group-hd learn-grid-group-hd-collapsible" tabIndex="0">',
                                    '<div class="learn-grid-group-title" style="{[groupTitleStyle]}; background-position: 130px center">',
                                        '{[values.groupHeaderTpl.apply(values.groupInfo, parent) || "&#160;"]}',
                                    '</div>',
                                '</div>',
                            '</tpl>',
                        '</tpl>',

                        '<tpl if="summaryRecord || !isCollapsedGroup">',
                            '<table class="', Ext.baseCSSPrefix, '{view.id}-table ', Ext.baseCSSPrefix, 'grid-table',
                                '<tpl if="summaryRecord"> ', Ext.baseCSSPrefix, 'grid-table-summary</tpl>"',
                                'border="0" cellspacing="0" cellpadding="0" style="width:100%">',
                                '{[values.view.renderColumnSizer(out)]}',

                                '<tpl if="!isCollapsedGroup">',
                                    '{%',
                                        'values.itemClasses.length = 0;',
                                        'this.nextTpl.applyOut(values, out, parent);',
                                    '%}',
                                '</tpl>',
                                '<tpl if="summaryRecord">',
                                    '{%me.outputSummaryRecord(values.summaryRecord, values, out);%}',
                                '</tpl>',
                            '</table>',
                        '</tpl>',
                    '</td>',
                '</tr>',
            '<tpl else>',
                '{%this.nextTpl.applyOut(values, out, parent);%}',
            '</tpl>', {
                priority: 200,

                syncRowHeights: function(firstRow, secondRow) {
                    firstRow = Ext.fly(firstRow, 'syncDest');
                    secondRow = Ext.fly(secondRow, 'sycSrc');
                    var owner = this.owner,
                        firstHd = firstRow.down(owner.eventSelector, true),
                        secondHd,
                        firstSummaryRow = firstRow.down(owner.summaryRowSelector, true),
                        secondSummaryRow,
                        firstHeight, secondHeight;


                    if (firstHd && (secondHd = secondRow.down(owner.eventSelector, true))) {
                        firstHd.style.height = secondHd.style.height = '';
                        if ((firstHeight = firstHd.offsetHeight) > (secondHeight = secondHd.offsetHeight)) {
                            Ext.fly(secondHd).setHeight(firstHeight);
                        }
                        else if (secondHeight > firstHeight) {
                            Ext.fly(firstHd).setHeight(secondHeight);
                        }
                    }


                    if (firstSummaryRow && (secondSummaryRow = secondRow.down(owner.summaryRowSelector, true))) {
                        firstSummaryRow.style.height = secondSummaryRow.style.height = '';
                        if ((firstHeight = firstSummaryRow.offsetHeight) > (secondHeight = secondSummaryRow.offsetHeight)) {
                            Ext.fly(secondSummaryRow).setHeight(firstHeight);
                        }
                        else if (secondHeight > firstHeight) {
                            Ext.fly(firstSummaryRow).setHeight(secondHeight);
                        }
                    }
                },

                syncContent: function(destRow, sourceRow) {
                    destRow = Ext.fly(destRow, 'syncDest');
                    sourceRow = Ext.fly(sourceRow, 'sycSrc');
                    var owner = this.owner,
                        destHd = destRow.down(owner.eventSelector, true),
                        sourceHd = sourceRow.down(owner.eventSelector, true),
                        destSummaryRow = destRow.down(owner.summaryRowSelector, true),
                        sourceSummaryRow = sourceRow.down(owner.summaryRowSelector, true);


                    if (destHd && sourceHd) {
                        Ext.fly(destHd).syncContent(sourceHd);
                    }


                    if (destSummaryRow && sourceSummaryRow) {
                        Ext.fly(destSummaryRow).syncContent(sourceSummaryRow);
                    }
                }
            }
        ],
    }],

    statics: {
        searchFields: ['group_name', 'description',
            {field: 'studies', value: 'study_label', emptyText: 'No related products'},
            {field: 'species', value: 'species', emptyText: 'No related species'},
            {field: 'products', value: 'product_name', emptyText: 'No related products'},
            {field: 'assays', value: 'assay_identifier', emptyText: 'No related assays'}
        ]
    },

    columns: [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'group_name',
        filterConfigSet: [{
            filterField: 'group_name',
            valueType: 'string',
            title: 'Group Name'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-description">',
                    '<h2>{group_name:htmlEncode}</h2>',
                    '<div class="detail-description-text">',
                    '<p class="block-with-text">{description:htmlEncode}</p>',
                '</div>',
        ),
    }, {
        text: 'Studies',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'study_names_to_sort_on',
        filterConfigSet: [{
            filterField: 'study_names',
            valueType: 'string',
            title: 'Studies'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="studies.length &gt; 0">',
                            '<tpl for="studies">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{study_label:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<li class="detail-gray-text">No related studies</li>',
                        '</tpl>',
                    '</ul>',
                '</div>'
        )
    }, {
        text: 'Species',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'species_to_sort_on',
        filterConfigSet: [{
            filterField: 'species_names',
            valueType: 'string',
            title: 'Species'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="studySpecies.length &gt; 0">',
                            '<tpl for="studySpecies">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{species:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<li class="detail-gray-text">No related species</li>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }, {
        text: 'Products',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'product_to_sort_on',
        filterConfigSet: [{
            filterField: 'product_names',
            valueType: 'string',
            title: 'Products'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="products.length &gt; 0">',
                            '<tpl for="products">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{product_name:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                        '<li class="detail-gray-text">No related products</li>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }, {
        text: 'Assays',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'assay_to_sort_on',
        filterConfigSet: [{
            filterField: 'assay_names',
            valueType: 'string',
            title: 'Assays'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="assays.length &gt; 0">',
                            '<tpl for="assays">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{assay_identifier:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }]
});