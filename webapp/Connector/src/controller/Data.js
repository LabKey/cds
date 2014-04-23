/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Data', {

    extend : 'Connector.controller.AbstractViewController',

    views: ['Grid'],

    measures : [],
    filterMap : {}, // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance.
    idMap : {},     // inverse of the filterMap

    init : function() {

        this.control('groupdatagrid', {
            filtertranslate: this.onFilterTranslate,
            lookupcolumnchange: this.onLookupColumnChange,
            removefilter: this.onRemoveGridFilter,
            updatecolumnmodel: this.onUpdateColumnModel,
            scope: this
        });

        this.callParent();
    },

    /**
     * Return a filter object that can be used on the grid
     * @param callback
     */
    getParticipantIn : function (callback) {

        var state = this.getStateManager();

        var filters = state.getFilters(), nonGridFilters = [];
        for (var f=0; f < filters.length; f++) {
            if (!filters[f].data.isGrid) {
                nonGridFilters.push(filters[f]);
            }
        }

        var me = this;
        state.onMDXReady(function(mdx) {

            state.addPrivateSelection(filters, 'gridselection');

            mdx.queryParticipantList({
                useNamedFilters : ['gridselection'],
                success : function(cs) {
                    var ptids = [];
                    var pos = cs.axes[1].positions;
                    for (var a=0; a < pos.length; a++) {
                        ptids.push(pos[a][0].name);
                    }
                    state.removePrivateSelection('gridselection');

                    if (callback) {
                        callback.call(me, ptids);
                    }
                },
                scope : me
            });

        });
    },

    requestCounts : function(sources, members, callback, scope) {
        var json = {
            members : members || [],
            sources : sources || []
        };

        if (json.sources.length > 0) {
            Ext.Ajax.request({
                url : LABKEY.ActionURL.buildURL('cds', 'getSourceCounts'),
                method : 'POST',
                jsonData : json,
                success : callback,
                scope : scope
            });
        }
    },

    // TODO: Move this to the measure picker or somewhere where other classes can access this method
    displayCounts : function(response, sourceCls) {
        var rjson = Ext.decode(response.responseText);

        if (rjson && rjson.counts) {
            var cell, counts = rjson.counts;
            Ext.iterate(counts, function(source, count) {
                cell = Ext.DomQuery.select('.' + sourceCls + ' .itemrow:nodeValue(' + source + ')');
                if (cell.length > 0) {
                    if (counts[source] == 0)
                        Ext.get(cell).addCls('itemdisabled');

                    Ext.get(cell).update('<span class="upct"><span class="val">' + source + '</span>&nbsp;(' + count + ')</span>');
                }
            });
        }
    },

    // Deprecated: will be removed
    updateQuery : function () {
        var view = this.getViewManager().getViewInstance('groupdatagrid');

        if (view) {
            var appFilters = this.getStateManager().getFilters();
            var gridFilters = [];
            Ext.iterate(this.idMap, function(id, urlParam) {
                for (var i=0; i < appFilters.length; i++) {
                    if (appFilters[i].id == id) {
                        var gf = appFilters[i].getValue('gridFilter');
                        if (Ext.isArray(gf)) {
                            Ext.each(gf, function(_gf) {
                                gridFilters.push(_gf);
                            });
                        }
                        else {
                            gridFilters.push(gf);
                        }
                    }
                }
            }, this);

            view.applyFilters(gridFilters);
            view.initializeGrid();
        }

        this.refreshRequired = false;
    },

    onFailure : function(response) {
        var resp = Ext.decode(response.responseText);
        Ext.Msg.show({
            title: response.status + ': ' + response.statusText,
            msg: resp.exception
        });
    },

    getColumnName : function(URLParameterName) {
        var param = URLParameterName.replace('query.', '');
        return param.split('~')[0];
    },

    // TODO: Push all of this down into the Connector.grid.Model
    // Listener for Application CDS filters
    onFilterChange : function (view, appFilters) {

        // 16099: Home page - rendering issues on Firefox (at least)
        // Transitions between views can cause filters to update, however, this can be too early
        // resulting in the raw data view updating the query when the the view might be hidden right after
        if (this.getViewManager().inTransition)
            return;

        if (this.gridFilter) {
            this.filterremove = false;
            return;
        }

        // ensure the filterMap is not out of sync with the app filters
        var remove = {}, colName, found, gFilter;
        Ext.iterate(this.filterMap, function(urlParam, id) {
            found = false, colName = '';
            Ext.each(appFilters, function(appFilter) {
                gFilter = appFilter.getValue('gridFilter');
                if (Ext.isArray(gFilter)) {
                    Ext.each(gFilter, function(f) {
                        if (appFilter.id == this.hasFilter(f)) {
                            found = true;
                        }
                    }, this);
                }
                else if (gFilter) {
                    if (appFilter.id == this.hasFilter(gFilter)) {
                        found = true;
                    }
                }
            }, this);

            if (!found) {
                remove[urlParam] = {
                    urlParam: urlParam,
                    colName: this.getColumnName(urlParam)
                };
            }
        }, this);

        // Examine each app filter to see if new grid filters are present
        Ext.each(appFilters, function(appFilter) {
            gFilter = appFilter.getValue('gridFilter');
            if (Ext.isArray(gFilter)) {
                Ext.each(gFilter, function(f) {
                    if (!this.hasFilter(f)) {
                        this.addToFilters(f, appFilter.id);
                    }
                }, this);
            }
            else if (gFilter) {
                if (!this.hasFilter(gFilter)) {
                    this.addToFilters(gFilter, appFilter.id);
                }
            }
        }, this);

        Ext.iterate(this.idMap, function(id, urlParam) {
            found = false;
            for (var i=0; i < appFilters.length; i++) {
                if (appFilters[i].id == id) {
                    found = true;
                }
            }
            if (!found) {
                remove[urlParam] = {
                    urlParam: urlParam,
                    colName: this.getColumnName(urlParam)
                };
            }
        }, this);

        found = [];
        Ext.iterate(remove, function(urlParam, obj) {
            found.push(obj);
        });

        if (found.length > 0) {
            for (var r=0; r < found.length; r++) {
                this.clearFilter(found[r].urlParam);
            }
            view.removeAppFilter(found);
            if (view.gridLock) {
                this.filterremove = true;
            }
        }
        else {
            this.filterremove = false;
            view.gridLock = false;
        }

        if (this.isActiveView)
        {
            this.updateQuery();
        }
        else
        {
            this.refreshRequired = true;
        }
    },

    mergeUpdatedFilters : function(filterArrays) {

        var fa = [],
                filter,
                updated = [],
                found, f, g,
                matches = {};

        Ext.each(filterArrays, function(first) {
            Ext.each(first, function(second) {
                fa.push(second);
                Ext.iterate(this.filterMap, function(urlParam, id) {
                    if (urlParam.indexOf(second.getColumnName()) > -1) {
                        matches[urlParam] = true;
                    }
                });
            });
        });

        Ext.iterate(matches, function(m) {
            found = false;
            for (f=0; f < fa.length; f++) {
                if ((m == this.getFilterId(fa[f])) && !(m.indexOf(fa[f].getColumnName()) > -1))
                    found = true;
            }

            if (!found) {
                updated.push(this.filterMap[m]);
                this.clearFilter(m);
            }
        }, this);

        matches = [];
        if (updated.length > 0) {
            filter = this.getStateManager().getFilters();

            for (f=0; f < filter.length; f++) {

                found = false;
                for (g=0; g < updated.length; g++) {
                    if (filter[f].id == updated[g])
                        found = true;
                }

                if (!found) {
                    matches.push(filter[f]);
                }
            }

            this.getStateManager().filters = matches;
        }
    },

    onFilterTranslate : function(view, groups, filterArrays) {

        var animate = true;
        if (this.filterremove) {
            animate = false;
            this.filterremove = false;
        }

        if (this.gridFilter) {
            return;
        }

        this.mergeUpdatedFilters(filterArrays);

        var fa, group, found, newFilters = [];
        for (var r=0; r < groups.length; r++) {

            fa = filterArrays[r];
            group = groups[r];

            if (fa.length == 0) {
                this.onRemoveGridFilter(null, true);
                return;
            }

            found = false;
            for (var f=0; f < fa.length; f++) {
                if (!this.hasFilter(fa[f])) {
                    found = true;
                    fa[f].isNew = true;
                }
                else
                {
                    var members = [];
                    for (var g=0; g < groups[r].length; g++) {
                        members.push({
                            uniqueName: Connector.model.Filter.getSubjectUniqueName(groups[r][g])
                        });
                    }
                    this.getStateManager().updateFilterMembers(this.filterMap[this.getFilterId(fa[f])], members);
                }
            }

            if (found) {
                newFilters.push({
                    group   : group,
                    filters : fa
                });
            }

        }

        if (newFilters.length > 0) {
            if (!animate) {
                this.afterFilterAnimation(newFilters);
            }
            else {
                this.runFilterAnimation(view, newFilters, this.afterFilterAnimation);
            }
        }
    },

    // This fires when a user removes a filter from the grid interface
    // See: this.onFilterChange for when a filter is removed from app interface
    onRemoveGridFilter : function(fieldKey, all) {

        if (this.gridFilter) {
            return;
        }

        Ext.iterate(this.filterMap, function(urlParam, id) {
            if (all || urlParam.indexOf(fieldKey) > -1 ) {
                this.getStateManager().removeFilter(id, 'Subject');
            }
        }, this);

        if (all) {
            this.filterMap = {};
        }

    },

    onUpdateColumnModel : function(view, schema, query, columnSet) {
//        this.getStateManager().setCustomState({
//            view: 'groupdatagrid',
//            key: 'queryState'
//        }, {
//            schema: schema,
//            query: query,
//            columnSet: columnSet
//        });
//        this.getStateManager().updateState();
    },

    runFilterAnimation : function(view, filterGroups, callback) {

        var box   = Ext.get(Ext.DomQuery.select('.filterpanel')[0]).getBox(); // filter panel on RHS
        var cbox  = view.filterWin.ppx;

        if (cbox) {
            // Create DOM Element replicate
            var dom = document.createElement('span');
            dom.innerHTML = 'Apply Filter';
            dom.setAttribute('class', 'barlabel selected');
            dom.setAttribute('style', 'width: ' + (200) + 'px; left: ' + cbox[0] + 'px; top: ' + cbox[1] + 'px;');

            // check if selection is visible
            var yoffset = 50;
            if (this.getStateManager().getSelections().length == 0)
                yoffset = 0;

            // Append to Body
            var xdom = Ext.get(dom);
            xdom.appendTo(Ext.getBody());

            var me = this;

            xdom.animate({
                to : {
                    x: box.x,
                    y: (box.y-yoffset),
                    opacity: 0.2
                },
                duration: 1000, // Issue: 15220
                listeners : {
                    afteranimate : function() {
                        Ext.removeNode(xdom.dom);
                        me.allowHover = true;
                    }
                }
            });
        }

        if (callback) {
            var task = new Ext.util.DelayedTask(callback, this, [filterGroups]);
            task.delay(500);
        }
    },

    afterFilterAnimation : function(filterGroups) {

        var filters = [], filterIndexes = [], filter, f, i, grp, g;
        for (f=0; f < filterGroups.length; f++) {

            for (i=0; i < filterGroups[f].filters.length; i++) {

                filter = {
                    hierarchy  : 'Subject',
                    isGrid     : true,
                    gridFilter : filterGroups[f].filters[i],
                    members    : []
                };

                grp = filterGroups[f].group;
                for (g=0; g < grp.length; g++) {
                    filter.members.push({
                        uniqueName: Connector.model.Filter.getSubjectUniqueName(grp[g])
                    });

                }

                filters.push(filter);
                filterIndexes.push([f,i]);
            }
        }

        this.gridFilter = true; // start lock

        // filters are added to applicaton
        var newFilters = this.getStateManager().addFilters(filters);

        // filters are tracked
        // retrieve the ID of the last filter so we can track it for removal -- addFilter should possibly return this
        for (f=0; f < newFilters.length; f++) {
            this.addToFilters(filterGroups[filterIndexes[f][0]].filters[filterIndexes[f][1]], newFilters[f].id);
        }

        this.gridFilter = false; // end lock
        this.filterremove = false;
    },

    getFilterId : function(filter) {
        return filter.getURLParameterName() + '=' + filter.getValue();
    },

    hasFilter : function(filter) {
        return this.filterMap[this.getFilterId(filter)];
    },

    addToFilters : function(filter, id) {
        var key = this.getFilterId(filter);
        this.filterMap[key] = id;
        this.idMap[id] = key;
    },

    clearFilter : function(urlParam) {
        if (this.filterMap[urlParam]) {
            var id = this.filterMap[urlParam];
            delete this.filterMap[urlParam];
            delete this.idMap[id];
        }
    },

    /**
     * Called on 'lookupcolumnchange' event from the grid view.
     * This occurs whenver lookup columns are added/removed to/from the grid.
     * @param newColumns {Connector.model.ColumnInfo} - Array of current lookup columns
     * @param oldColumns {Connector.model.ColumnInfo} - Array of old lookup columns
     */
    onLookupColumnChange : function(newColumns, oldColumns) {

        if (Ext.isArray(oldColumns) && oldColumns.length > 0) {

            Ext.iterate(this.filterMap, function(urlParam, id) {

                Ext.each(oldColumns, function(col) {
                    if (urlParam.indexOf(col.data.fieldKeyPath) > -1) {
                        this.onRemoveGridFilter(col.data.fieldKeyPath, false);
                    }
                }, this);

            }, this);

        }
    },

    onViewChange : function (controller, view)  {
        this.isActiveView = view == 'groupdatagrid';
        //Note: When this event fires, animation still seems to be in play and grid doesn't render properly
        //Deferring seems to fix it, but perhaps event should fire later.
        if (this.isActiveView && this.refreshRequired) {
            Ext.defer(this.updateQuery, 300, this);
        }
    },

    createView : function(xtype, context) {

        var v;

        if (xtype == 'groupdatagrid') {

            // When this is enabled, columns can be loaded from the saved view state
            var queryState = undefined; //this.getStateManager().getCustomState('groupdatagrid', 'queryState');
            var model;

            // Optionally, load the model from state persistence
            if (Ext.isDefined(queryState)) {
                model = Ext.create('Connector.model.Grid', {
                    schemaName: queryState['schema'],
                    queryName: queryState['query'],
                    columnSet: queryState['columnSet']
                });
            }

            v = Ext.create('Connector.view.Grid', {
                model: model,
                control: this
            });

            this.getStateManager().on('filterchange', function(appFilters) {
                this.onFilterChange(v, appFilters);
            }, this);

            // TODO: Push this down into the views onViewChange
            this.getViewManager().on('afterchangeview', this.onViewChange, this);
            this.getViewManager().on('afterchangeview', v.onViewChange, v);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'groupdatagrid';
    }
});
