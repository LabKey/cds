/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Explorer', {

    extend: 'Ext.data.Store',

    allRecordTree: null,

    collapseTrack: {},

    enableSelection: true,

    KEYED_LOAD: false,

    locked: false,

    maxCount: 0,

    model: 'Connector.model.Explorer',

    olapProvider: null,

    perspective: undefined,

    subjectName: 'Subject',

    totals: {},

    statics: {
        /**
         * These sort functions assume sorting an Array of Connector.model.Explorer nodes
         */
        nodeSorters: {
            /**
             * A valid Array.sort() function that sorts an array of LABKEY.app.model.OlapExplorer instances
             * alphanumerically according to the 'label' field.
             * @param recA
             * @param recB
             * @returns {number}
             */
            sortAlphaNum : function(recA, recB) {
                return Connector.model.Filter.sorters.alphaNum(recA.record.get('label'), recB.record.get('label'));
            },

            /**
             * An valid Array.sort() function that sorts an array of LABKEY.app.model.OlapExplorer instances
             * alphanumerically according to the 'label' field. The 'Range' feature is meant to split on values that
             * are indicative of a range (e.g. 10-20, 32.1-98.2). In these cases, the sort will only occur on the value
             * before the '-' character.
             * @param recA
             * @param recB
             * @returns {number}
             */
            sortAlphaNumRange : function(recA, recB) {
                return Connector.model.Filter.sorters.alphaNum(recA.record.get('label').split('-')[0], recB.record.get('label').split('-')[0]);
            },

            /**
             * A valid Array.sort() function that sorts an array of LABKEY.app.model.OlapExplorer instances
             * using natural sort according to the instance's 'label' field.
             * @param recA
             * @param recB
             * @returns {number}
             */
            sortNatural : function(recA, recB) {
                return Connector.model.Filter.sorters.natural(recA.record.get('label'), recB.record.get('label'));
            }
        }
    },

    constructor : function(config) {

        // initialize flight locks
        this.flight = 0; // -- records
        this.mflight = 0; // -- selections

        this.callParent([config]);

        this.addEvents('selectrequest', 'subselect');
    },

    /**
     * The purpose of this method is to do a two-level sort where the groups are sorted first, followed
     * by the associated children being sorted in turn.
     */
    _applySort : function(sortStrategy, groupRecords, childRecords, groupMap) {
        var sorted = [], children;
        var sortFn = this._resolveSortFunction(sortStrategy);

        if (Ext.isEmpty(groupRecords)) {
            if (sortFn) {
                childRecords.sort(sortFn);
            }
            sorted = childRecords;
        }
        else {
            if (sortFn) {
                groupRecords.sort(sortFn);
            }
            Ext.each(groupRecords, function(group) {
                sorted.push(group);
                children = groupMap[group.get('level')];
                if (!Ext.isEmpty(children)) {
                    if (sortFn) {
                        children.sort(sortFn);
                    }
                    sorted = sorted.concat(children);
                }
            });
        }

        return sorted;
    },

    _calculateSubcount : function(cellset, uniqueName) {
        var cells = cellset.cells, cs, sc = 0;
        for (var c=0; c < cells.length; c++) {
            cs = cells[c][0];
            if (uniqueName === cs.positions[1][0].uniqueName) {
                sc = cs.value;
            }
        }
        return sc;
    },

    /**
     * Resolve the sorting function to use based on the given 'strategy' parameter. Currently, supports
     * 'ALPHANUM', 'ALPHANUM-RANGE', 'NATURAL', and 'SERVER'. This function can return the boolean 'false' in the case of no-op
     * strategy or if the strategy is not found.
     * @param strategy
     * @returns {*}
     * @private
     */
    _resolveSortFunction : function(strategy) {
        switch (strategy) {
            case 'ALPHANUM':
                return LABKEY.olapStore2.nodeSorters.sortAlphaNum;
            case 'ALPHANUM-RANGE':
                return LABKEY.olapStore2.nodeSorters.sortAlphaNumRange;
            case 'NATURAL':
                return LABKEY.olapStore2.nodeSorters.sortNatural;
            case 'SERVER':
            default:
                return false;
        }
    },

    appendAdditionalQueryConfig : function(config) {
        // overrides can add additional properties (ex. joinLevel and whereFilter)
        return config;
    },

    checkCollapse : function(data) {
        var check = this.collapseTrack[this.getCollapseKey(data)];
        if (!Ext.isBoolean(check)) {
            check = data.collapsed;
        }
        return check;
    },

    clearSelection : function() {
        if (this.enableSelection) {
            this.suspendEvents(true);
            this.queryBy(function(rec) {
                rec.set({
                    subcount: 0,
                    hasSelect: false,
                    isSelected: false
                });
                return true;
            }, this);
            this.resumeEvents();
            this.fireEvent('subselect', this);
        }
    },

    getCollapseKey : function(data) {
        return '' + data.hierarchy + '-' + data.level + '-' + data.value;
    },

    getCustomGroups : function() {
        return this.customGroups;
    },

    /**
     * Determine if a level is considered selected based on current active selections.
     * This is intended to be override by subclass to provide a concrete implementation.
     * @param uniqueName
     * @returns {boolean}
     */
    isRecordSelected : function(uniqueName) {
        return false;
    },

    load : function(dimension, hIndex, selections, showEmpty, altRequestDimNamedFilters) {
        this.KEYED_LOAD = true;

        if (!this.olapProvider) {
            console.error('Explorer must initialize olapProvider object.');
            return;
        }

        if (!this.locked) {
            this.locked = true;
            this.stale = undefined;

            this.dim = dimension;
            this.flight = 0;
            this.showEmpty = (showEmpty ? true : false);
            this.hIndex = hIndex || 0;

            if (this.enableSelection) {
                // reset selection ignoring in-flight requests
                this.mflight = 0;
            }
            this.loadDimension(selections, altRequestDimNamedFilters);
        }
        else {
            // mark as stale, processed once previous request is unlocked
            this.stale = {
                dimension: dimension,
                hIndex: hIndex,
                selections: selections,
                showEmpty: showEmpty
            };
        }
    },

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
                            me.setTotalHierarchyMembers(uniqueName, qr);
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

    loadSelection : function() {
        if (this.enableSelection) {
            // asks for the sub-selected portion
            this.mflight++;
            this.requestSelection(this.mflight, this.onLoadSelection, this);
        }
    },

    onLoadSelection : function(cellset, mdx, x) {
        var me = this;
        if (x.mflight === me.mflight) {

            var ssf = mdx._filter['stateSelectionFilter'];
            var hsf = mdx._filter['hoverSelectionFilter'];

            if ((!ssf || ssf.length === 0) && (!hsf || hsf.length === 0)) {
                me.clearSelection();
            }
            else {
                this.suspendEvents(true);
                me.queryBy(function(rec) {
                    return this.setLoadSelection(rec, cellset);
                }, this);
                this.resumeEvents();
            }

            this.fireEvent('subselect', this);
        }
    },

    processMaxCount : function(qr) {
        var t = -1, x=1;
        for (; x < qr.axes[1].positions.length; x++) {
            if (qr.cells[x][0].value > t) {
                t = qr.cells[x][0].value;
            }
        }
        return t;
    },

    requestDimension : function(hierarchy, selections, distinctLevel, altRequestDimNamedFilters) {
        // Asks for the Gray area
        this.flight++;
        var hasSelection = Ext.isArray(selections) && selections.length > 0;
        if (hasSelection) {
            this.mflight++;
        }
        this.olapProvider.onMDXReady(function(mdx){
            var me = this;

            var scoped = {
                baseResult: undefined,
                selectionResult: undefined,
                useSelection: hasSelection,
                mdx: mdx
            };

            var check = function() {
                if (Ext.isDefined(scoped.baseResult)) {
                    if (hasSelection) {
                        if (Ext.isDefined(scoped.selectionResult)) {
                            me.requestsComplete(scoped);
                        }
                    }
                    else {
                        me.requestsComplete(scoped);
                    }
                }
            };

            var queryConfig = {
                onRows : [{
                    hierarchy: hierarchy.getUniqueName(),
                    members: 'members'
                }],
                useNamedFilters: altRequestDimNamedFilters || ['statefilter'],
                showEmpty: me.showEmpty,
                qFlight: this.flight,
                success: function(qr, _mdx, x) {
                    if (this.flight === x.qFlight) {
                        scoped.baseResult = qr;
                        check();
                    }
                },
                scope: this
            };

            if (Ext.isString(this.perspective)) {
                queryConfig.perspective = this.perspective;
            }

            if (Ext.isDefined(distinctLevel)) {
                queryConfig.countDistinctLevel = distinctLevel;
            }

            var config = this.appendAdditionalQueryConfig(queryConfig);
            mdx.query(config);

            if (hasSelection) {
                me.requestSelection(this.mflight, function(qr, _mdx, x) {
                    if (this.mflight === x.mflight) {
                        scoped.selectionResult = qr;
                        check();
                    }
                }, this);
            }
        }, this);
    },

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
        var sortFn = this._resolveSortFunction(sortStrategy);

        if (!pos || pos.length === 0) {
            this.removeAll();
            return;
        }

        // use (All) as root
        var rootPosition = pos[0][0];
        var nodeName = rootPosition.uniqueName.replace(rootPosition.name, '').replace('.[]', '');
        var rootNode = Ext.create('LABKEY.app.util.OlapExplorerNode', {data: {uniqueName: nodeName, lvlDepth: 0}});
        this.allRecordTree = Ext.create('LABKEY.app.util.OlapExplorerTree', rootNode);

        var groupOnly = true;

        for (var x=1; x < pos.length; x++) {
            subPosition = pos[x][0];

            // Subjects should not be listed so do not roll up
            if ((!this.showEmpty && baseResult.cells[x][0].value === 0)
                    || (subPosition.level.name === this.subjectName)) {
                continue;
            }

            if (!this.shouldIncludeMember(hierarchy, subPosition))
                continue;

            isGroup = false;
            if (hasGrpLevel && subPosition.level.id == grpLevelID) {
                activeGroup = subPosition.name;
                isGroup = true;
            }

            target = {
                label: Connector.model.Filter.getMemberLabel(subPosition.name),
                uniqueName: subPosition.uniqueName,
                count: baseResult.cells[x][0].value,
                maxcount: max,
                value: subPosition.name,
                hierarchy: hierarchy.getUniqueName(),
                isGroup: isGroup,
                level: subPosition.name,
                lvlDepth: (subPosition.uniqueName.match(/\].\[/g) || []).length,
                ordinal: subPosition.ordinal,
                levelUniqueName: subPosition.level.uniqueName,
                collapsed: activeGroup && pos.length > 15 ? true : false,
                btnShown: false,
                hasSelect: response.useSelection === true,
                isSelected: this.isRecordSelected(subPosition.uniqueName)
            };

            if (response.useSelection) {
                target.subcount = this._calculateSubcount(selectionResult, target.uniqueName);
            }

            var instance = Ext.create('Connector.model.Explorer', target);

            if (target.isGroup) {
                groupTarget = instance;
                if (!customGroups[target.level]) {
                    customGroups[target.level] = [];
                }
            }
            else {
                instance.set('level', activeGroup);
                if (!customGroups[activeGroup]) {
                    customGroups[activeGroup] = [];
                }
                customGroups[activeGroup].push(instance);
                groupOnly = false;
            }

            this.allRecordTree.add(instance, sortFn);

            var collapse = this.checkCollapse(instance.data);
            instance.set('collapsed', collapse);

            if (groupTarget) {
                groupTarget.set('collapsed', collapse);
            }
        }

        this.allRecordTree.updateLeafNodes(this.shouldCollapseDescendantsWithSameValue());
        var allRecords = this.allRecordTree.getAllRecords();
        var allInstances = [];
        Ext.each(allRecords, function(rec){
            allInstances.push(rec.record);
        }, this);


        if (groupOnly) {
            max = 0;
            this.removeAll();
        }
        else {
            this.loadRecords(allInstances);
        }

        this.customGroups = customGroups;
        this.maxCount = max;

        if (response.useSelection) {
            this.fireEvent('selectrequest');
        }
    },

    requestSelection : function(mflight, callback, scope) {

        if (Ext.isDefined(this.dim)) {
            var queryConfig = {
                onRows : [{
                    hierarchy: this.dim.getHierarchies()[this.hIndex].getUniqueName(),
                    members: 'members'
                }],
                useNamedFilters: ['stateSelectionFilter', 'hoverSelectionFilter', 'statefilter'],
                mflight: mflight,
                showEmpty: this.showEmpty,
                success: callback,
                scope : scope
            };

            if (Ext.isString(this.perspective)) {
                queryConfig.perspective = this.perspective;
            }

            if (Ext.isDefined(this.dim.distinctLevel)) {
                queryConfig.countDistinctLevel = this.dim.distinctLevel;
            }

            this.mdx.query(this.appendAdditionalQueryConfig(queryConfig));
        }
    },

    setCollapse : function(data, collapsed) {
        this.collapseTrack[this.getCollapseKey(data)] = collapsed;
    },

    setEnableSelection : function(enableSelection) {
        this.enableSelection = enableSelection;
    },

    setLoadSelection : function(rec, cellset) {
        rec.set({
            subcount: this._calculateSubcount(cellset, rec.get('uniqueName')),
            hasSelect: true,
            isSelected: this.isRecordSelected(rec.get('uniqueName'))
        });
        return true;
    },

    /**
     * A function to allow preprocessing the requested hierarchy with its full cube members.
     * @param hierarchyUniqueName
     * @param cubeResult The query result of the hierarchy with no filters passed in (except container filter)
     */
    setTotalHierarchyMembers : function(hierarchyUniqueName, cubeResult) {
        Connector.getQueryService().setUserHierarchyMembers(hierarchyUniqueName, cubeResult);
    },

    /**
     * Determine if node's descendants should be pruned off when all descendants have the same value as current node.
     * e.g. when a first level node is of value "#null", then it will have exact one child with "#null", for N levels, return true to hide all child levels of the node.
     * @returns {boolean}
     */
    shouldCollapseDescendantsWithSameValue : function() {
        return true;
    },

    /**
     * Determine if a member should be included or filtered out. False return value will skip the member.
     * @param hierarchyUniqName
     * @param levelUniquName
     * @param memberName
     * @returns {boolean}
     */
    shouldIncludeMember : function(hierarchy, subPosition) {
        var hierarchyUniqName = hierarchy.getUniqueName(), levelUniquName = subPosition.level.uniqueName, memberName = subPosition.uniqueName;
        return Connector.getQueryService().isUserLevelAccessible(hierarchyUniqName, levelUniquName, memberName);
    }
});

Ext.define('LABKEY.app.util.OlapExplorerTree', {

    root: null,

    constructor: function(root) {
        if (root) {
            this.root = root;
        }
    },

    add: function(data, sortFn) {
        var child = new LABKEY.app.util.OlapExplorerNode(data),
                parent = this.findNode(this.root, child, function(node, newChild){
                    return node.isDirectParentOf(newChild);
                });

        if (parent) {
            parent.childrenNodes.push(child);
            if (sortFn) {
                parent.childrenNodes = parent.childrenNodes.sort(sortFn);
            }
            child.parent = parent;
        } else {
            console.log('Parent node not found.');
        }
    },

    findNode: function(currentNode, uniqueName, matchFn) {
        if (matchFn.call(this, currentNode, uniqueName))
            return currentNode;
        for (var i = 0, length = currentNode.childrenNodes.length; i < length; i++) {
            var found = this.findNode(currentNode.childrenNodes[i], uniqueName, matchFn);
            if (found) {
                return found;
            }
        }
        return null;
    },

    getAllRecords: function() {
        return this.preOrderTraversal(this.root, [], true);
    },

    /**
     * collapseSameDescendants: true to trim node whose all descendants have the same value as current node
     * Determine if a node is a leaf node
     */
    updateLeafNodes: function(collapseSameDescendants) {
        this.updateLeafNodesInfo(this.root, collapseSameDescendants);
    },

    updateLeafNodesInfo: function(parentNode, prune) {
        for (var i = 0, length = parentNode.childrenNodes.length; i < length; i++) {
            var curNode = parentNode.childrenNodes[i];
            if (curNode.childrenNodes.length === 0) {
                if (curNode.record.data) {
                    curNode.record.data.isLeafNode = true;
                }
            }
            // if prune, and if all descendants have only one child, don't show full lineage
            else if (curNode.childrenNodes.length === 1 && prune && !this.hasDifferentDescendantValues(curNode)) {
                curNode.childrenNodes = [];
                if (curNode.record.data) {
                    curNode.record.data.isLeafNode = true;
                }
            }
            else {
                this.updateLeafNodesInfo(curNode, prune);
            }
        }
    },

    // check if node has any offspring with different value than current node
    hasDifferentDescendantValues: function(node) {
        var hasDiff = false;
        while (node.childrenNodes.length > 0 && !hasDiff) {
            if (node.childrenNodes.length > 1) {
                hasDiff = true;
            }
            else {
                if (node.record.data.uniqueName !== node.childrenNodes[0].record.data.uniqueName) {
                    hasDiff = true;
                }
                else {
                    node = node.childrenNodes[0];
                }
            }
        }
        return hasDiff;
    },

    preOrderTraversal: function(currentNode, results, isRoot) {
        if (!isRoot) {
            results.push(currentNode);
        }
        for (var i = 0, length = currentNode.childrenNodes.length; i < length; i++) {
            this.preOrderTraversal(currentNode.childrenNodes[i], results, false);
        }
        return results;
    },
    /**
     * Get all descendant groups for a ancestor, excluding the line that's directly related to the disownedDescendant
     * @param {string} ancestor The uniqueName of the ancestor node
     * @param {string} disownedDescendant The uniqueName of the descendant node whose line will be pruned
     * @returns {string[]} an array of uniqueNames/members after the pruning
     */
    dissolve: function(ancestor, disownedDescendant) {
        var ancestorNode = this.findNode(this.root, ancestor, function(node, uniqueName){
            return node.record.data.uniqueName === uniqueName;
        });
        if (ancestorNode) {
            return this.getDescendantGroups(ancestorNode, disownedDescendant, [], true)
        } else {
            console.log('Ancestor node not found.');
        }
    },
    getDescendantGroups: function(currentNode, disownedDescendant, results, isRoot) {
        if (disownedDescendant === currentNode.record.data.uniqueName) {
            return results;
        }
        if (disownedDescendant.indexOf(currentNode.record.data.uniqueName) === 0) {
            for (var i = 0, length = currentNode.childrenNodes.length; i < length; i++) {
                this.getDescendantGroups(currentNode.childrenNodes[i], disownedDescendant, results, false);
            }
        }
        else {
            if (!isRoot) {
                results.push({
                    uniqueName: currentNode.record.data.uniqueName
                });
            }
        }
        return results;
    }
});

Ext.define('LABKEY.app.util.OlapExplorerNode', {
    record: null,
    parent: null,
    childrenNodes: [],

    constructor: function(data) {
        if (data) {
            this.record = data;
            this.parent = null;
            this.childrenNodes = [];
        }
    },

    isDirectParentOf : function(node) {
        return node.record.data.lvlDepth - this.record.data.lvlDepth == 1 && node.record.data.uniqueName.indexOf(this.record.data.uniqueName) == 0;
    }
});
