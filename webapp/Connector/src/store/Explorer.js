Ext.define('Connector.store.Explorer', {

    extend: 'Ext.data.Store',

    model: 'Connector.model.Explorer',

    requires: 'Connector.model.Explorer',

    enableSelection: true,

    collapseTrack: {},

    totals: {},

    groupField: 'level',

    constructor : function(config) {

        this.locked = false;

        this.callParent([config]);

        this.addEvents('selectrequest', 'subselect', 'totalcount');
    },

    load : function(dimension, hIndex, useSelection, showEmpty) {

        if (!this.state) {
            console.error('Explorer must initialize State object.');
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
                // reset selection ignoring inflight requests
                this.mflight = 0;
            }
            this.loadDimension(useSelection);
        }
        else {
            // mark as stale, processed once previous request is unlocked
            this.stale = {
                dimension: dimension,
                hIndex: hIndex,
                useSelection: useSelection,
                showEmpty: showEmpty
            };
        }
    },

    clearSelection : function() {
        if (this.enableSelection) {
            this.suspendEvents();
            var recs = this.queryBy(function(rec, id){
                rec.set('subcount', 0);
                return true;
            }, this);
            this.resumeEvents();
            this.fireEvent('subselect', recs.items);
        }
    },

    loadSelection : function(useLast) {
        if (this.enableSelection) {
            // asks for the subselected portion
            var me = this;

            me.suspendEvents();

            me.mflight++;
            me.mdx.query({
                onRows : [{
                    hierarchy : me.dim.getHierarchies()[this.hIndex].getName(),
                    members   : 'members'
                }],
                useNamedFilters : ['stateSelectionFilter', 'hoverSelectionFilter', 'statefilter'],
                mflight : me.mflight,
                showEmpty : me.showEmpty,
                success: this.selectionSuccess,
                scope : this
            });
        }
    },

    selectionSuccess : function(cellset, mdx, x) {
        var me = this;
        if (x.mflight != me.mflight) {
            // There is a more recent selection request -- discard
            return;
        }

        if ((!me.mdx._filter['stateSelectionFilter'] || me.mdx._filter['stateSelectionFilter'].length == 0) &&
                (!me.mdx._filter['hoverSelectionFilter'] || me.mdx._filter['hoverSelectionFilter'].length == 0))
        {
            me.clearSelection();
            return false;
        }

        var recs = me.queryBy(function(rec, id) {

            var updated = false, cellspan_value = 0, label; // to update rows not returned by the query
            for (var c=0; c < cellset.cells.length; c++)
            {
                label = (rec.data.label == 'Unknown' ? '#null' : rec.data.label);
                if (label == cellset.cells[c][0].positions[1][0].name)
                {
                    updated = true;
                    rec.set('subcount', cellset.cells[c][0].value);
                }
                else
                {
                    if(cellset.cells[c][0].value > 0) {
                        cellspan_value++;
                    }
                }
            }
            if (!updated)
            {
                rec.set('subcount', 0);
            }
            return true;

        });

        me.resumeEvents();
        me.fireEvent('subselect', recs.items ? recs.items : []);
    },

    loadDimension : function(useSelection) {
        var hierarchies = this.dim.getHierarchies();
        if (hierarchies.length > 0) {
            var hierarchy = hierarchies[this.hIndex];
            var me = this;

            if (!this.totals[hierarchy.getName()]) {
                // Asks for Total Count
                this.state.onMDXReady(function(mdx) {
                    me.mdx = mdx;
                    mdx.query({
                        onRows: [{hierarchy: hierarchy.getName(), members:'members'}],
                        showEmpty: me.showEmpty,
                        success: function(qr) {
                            me.totals[hierarchy.getName()] = me.processTotalCount.call(me, qr);
                            me.requestDimension(hierarchy, useSelection);
                        }
                    });

                }, this);
            }
            else {
                me.requestDimension(hierarchy, useSelection);
            }
        }
    },

    requestDimension : function(hierarchy, useSelection) {
        // Asks for the Gray area
        this.flight++;
        this.state.onMDXReady(function(mdx){
            var me = this;
            mdx.query({
                onRows : [{hierarchy: hierarchy.getName(), members:'members'}],
                useNamedFilters : ['statefilter'],
                showEmpty : me.showEmpty,
                success: function(qr) {
                    me.baseResult = qr;
                    me.requestsComplete(useSelection);
                }
            });
        }, this);
    },

    processTotalCount : function(qr) {
        var t = -1, x=1;
        for (; x < qr.axes[1].positions.length; x++) {
            if (qr.cells[x][0].value > t) {
                t = qr.cells[x][0].value;
            }
        }
        return t;
    },

    requestsComplete : function(useSelection) {
        this.flight--;
        if (this.flight == 0) {

            // unlock for requests for other dimensions
            this.locked = false;

            // first check for 'stale'
            if (Ext.isObject(this.stale)) {
                this.load(this.stale.dimension, this.stale.hIndex, this.stale.useSelection, this.stale.showEmpty);
                return;
            }

            var hierarchy = this.dim.getHierarchies()[this.hIndex];
            var set = this.baseResult;

            var targetLevels = set.metadata.cube.dimensions[1].hierarchies[0].levels;

            var recs = [],
                    totalCount = this.totals[hierarchy.getName()],
                    target,
                    pos = set.axes[1].positions,
                    activeGroup = '',
                    isGroup = false,
                    groupTarget;

            // skip (All)
            for (var x=1; x < pos.length; x++)
            {
                if (!this.showEmpty && set.cells[x][0].value == 0) {
                    continue;
                }

                // Subjects should not be listed so do not roll up
                if (hierarchy.getName().indexOf('Participant.') != -1)
                {
                    activeGroup = '';
                    isGroup = false;
                    if (pos[x][0].level.id != targetLevels[1].id) {
                        continue;
                    }
                }
                else if (targetLevels.length > 2 && pos[x][0].level.id == targetLevels[1].id) {
                    activeGroup = pos[x][0].name;
                    isGroup = true;
                }

                target = {
                    label: pos[x][0].name == '#null' ? 'Unknown' : pos[x][0].name,
                    count: set.cells[x][0].value,
                    value: pos[x][0].name,
                    hierarchy: hierarchy.getName(),
                    isGroup: isGroup,
                    level: pos[x][0].name,
                    collapsed: activeGroup && pos.length > 15 ? true : false,
                    btnShown: false
                };

                if (!target.isGroup) {
                    target.level = activeGroup;
                }

                if (target.isGroup) {
                    groupTarget = target;
                }

                target.collapsed = this.checkCollapse(target);
                if (groupTarget) {
                    groupTarget.collapsed = target.collapsed;
                }

                recs.push(target);

                isGroup = false;
            }

            var groupOnly = true;
            for (var r=0; r < recs.length; r++) {
                if (!recs[r].isGroup) {
                    groupOnly = false;
                }
            }

            if (!groupOnly) {
                // This must be called before any events are fired -- eventSuspended
                this.loadData(recs);
            }
            else {
                totalCount = 0;
                this.removeAll();
            }

            this.group(this.groupField);

            this.fireEvent('totalcount', totalCount);

            if (useSelection) {
                this.fireEvent('selectrequest');
            }
        }
    },

    loadRecords: function(records, options) {
        options = options || {};


        if (!options.addRecords) {
            delete this.snapshot;
            this.clearData();
        }

        this.data.addAll(records);

        for (var i=0; i < records.length; i++) {
            if (options.start !== undefined) {
                records[i].index = options.start + i;

            }
            records[i].join(this);
        }
    },

    checkCollapse : function(target) {

        var check = this.collapseTrack['' + target.hierarchy + '-' + target.level + '-' + target.value];
        if (check === true || check === false)
            return check;
        return target.collapsed;
    },

    setCollapse : function(record, collapsed) {
        this.collapseTrack['' + record.data.hierarchy + '-' + record.data.level + '-' + record.data.value] = collapsed;
    },

    setEnableSelection : function(enableSelection) {
        this.enableSelection = enableSelection;
    }
});
