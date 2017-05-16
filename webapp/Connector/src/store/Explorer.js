/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Explorer', {

    extend: 'LABKEY.app.store.OlapExplorer',

    subjectName: 'Subject',

    //Override: Mostly the same as OlapExplorer, see code inside //DataSpace override for actual overrides
    loadDimension : function(selections, altRequestDimNamedFilters) {
        var hierarchies = this.dim.getHierarchies();
        var distinctLevel = this.dim.distinctLevel;

        if (hierarchies.length > 0) {
            var hierarchy = hierarchies[this.hIndex];
            var uniqueName = hierarchy.getUniqueName();
            var me = this;
            if (!this.totals[uniqueName]) {
                // Asks for Total Count
                this.olapProvider.onMDXReady(function(mdx) {
                    me.mdx = mdx;

                    var queryConfig = {
                        onRows: [{hierarchy: uniqueName, members:'members'}],
                        showEmpty: me.showEmpty,
                        success: function(qr) {

                            //DataSpace override to user accessible members
                            Connector.getQueryService().setUserHierarchyMembers(uniqueName, qr);
                            // End DataSpace override

                            me.totals[uniqueName] = me.processMaxCount.call(me, qr);
                            me.requestDimension(hierarchy, selections, distinctLevel, altRequestDimNamedFilters);
                        }
                    };

                    if (Ext.isString(this.perspective)) {
                        queryConfig.perspective = this.perspective;
                    }

                    if (Ext.isDefined(distinctLevel)) {
                        queryConfig.countDistinctLevel = distinctLevel;
                    }

                    mdx.query(queryConfig);

                }, this);
            }
            else {
                me.requestDimension(hierarchy, selections, distinctLevel, altRequestDimNamedFilters);
            }
        }
    },

    //Override: Mostly the same as OlapExplorer, see code inside //DataSpace override for actual overrides
    requestsComplete : function(response) {

        // unlock for requests for other dimensions
        this.locked = false;
        if (this.eventsSuspended) {
            this.resumeEvents();
        }

        // first check for 'stale'
        if (Ext.isObject(this.stale)) {
            this.load(this.stale.dimension, this.stale.hIndex, this.stale.selections, this.stale.showEmpty);
            return;
        }

        var hierarchy = this.dim.getHierarchies()[this.hIndex],
                baseResult = response.baseResult,
                dims = baseResult.metadata.cube.dimensions,
                selectionResult = response.selectionResult,
                targetLevels = dims.length > 1 ? dims[1].hierarchies[0].levels : hierarchy.levels,
                max = this.totals[hierarchy.getUniqueName()],
                target,
                pos = baseResult.axes[1].positions,
                activeGroup = '',
                isGroup = false,
                groupTarget,
                hasSubjectLevel = targetLevels[targetLevels.length-1].name === this.subjectName,
                hasGrpLevel = targetLevels.length > (hasSubjectLevel ? 3 : 2),
                grpLevelID = targetLevels[1] ? targetLevels[1].id : null,
                subPosition,
                customGroups = {},
                groupRecords = [],
                childRecords = [],
                //
                // Support for 'sortStrategy' being declared on the MDX.Level. See this app's cube metadata documentation
                // to see if this app supports the 'sortStrategy' be declared.
                //
                sortStrategy = 'SERVER',
                sortLevelUniqueName,
                sortLevel;

        if (hasGrpLevel) {
            Ext.each(targetLevels, function(level) {
                if (level.id === grpLevelID) {
                    sortLevelUniqueName = level.uniqueName;
                    return false;
                }
            });
        }
        else {
            sortLevelUniqueName = targetLevels[targetLevels.length-1].uniqueName;
        }

        sortLevel = response.mdx.getLevel(sortLevelUniqueName);
        if (sortLevel && !Ext.isEmpty(sortLevel.sortStrategy)) {
            sortStrategy = sortLevel.sortStrategy;
        }

        // skip (All)
        for (var x=1; x < pos.length; x++) {
            subPosition = pos[x][0];

            // Subjects should not be listed so do not roll up
            if ((!this.showEmpty && baseResult.cells[x][0].value === 0) || (subPosition.level.name === this.subjectName)) {
                continue;
            }

            isGroup = false;
            if (hasGrpLevel && subPosition.level.id == grpLevelID) {
                activeGroup = subPosition.name;
                isGroup = true;
            }

            //DataSpace override to check user accessibility
            if (!Connector.getQueryService().isUserLevelAccessible(hierarchy.getUniqueName(), subPosition.level.uniqueName, subPosition.uniqueName))
                continue;
            // End DataSpace override

            target = {
                label: LABKEY.app.model.Filter.getMemberLabel(subPosition.name),
                uniqueName: subPosition.uniqueName,
                count: baseResult.cells[x][0].value,
                maxcount: max,
                value: subPosition.name,
                hierarchy: hierarchy.getUniqueName(),
                isGroup: isGroup,
                level: subPosition.name,
                ordinal: subPosition.ordinal,
                levelUniqueName: subPosition.level.uniqueName,
                collapsed: activeGroup && pos.length > 15 ? true : false,
                btnShown: false,
                hasSelect: response.useSelection === true
            };

            if (response.useSelection) {
                target.subcount = this._calculateSubcount(selectionResult, target.uniqueName);
            }

            var instance = Ext.create('LABKEY.app.model.OlapExplorer', target);

            if (target.isGroup) {
                groupTarget = instance;
                if (!customGroups[target.level]) {
                    customGroups[target.level] = [];
                }
                groupRecords.push(instance);
            }
            else {
                instance.set('level', activeGroup);
                if (!customGroups[activeGroup]) {
                    customGroups[activeGroup] = [];
                }
                customGroups[activeGroup].push(instance);
                childRecords.push(instance);
            }

            var collapse = this.checkCollapse(instance.data);
            instance.set('collapsed', collapse);

            if (groupTarget) {
                groupTarget.set('collapsed', collapse);
            }
        }

        var groupOnly = true;
        for (var i=0; i < childRecords.length; i++) {
            if (!childRecords[i].get('isGroup')) {
                groupOnly = false;
                break;
            }
        }

        if (groupOnly) {
            max = 0;
            this.removeAll();
        }
        else {
            this.loadRecords(this._applySort(sortStrategy, groupRecords, childRecords, customGroups));
        }

        this.customGroups = customGroups;
        this.maxCount = max;

        if (response.useSelection) {
            this.fireEvent('selectrequest');
        }
    }

});
