/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.RawData', {

    extend : 'Connector.controller.AbstractViewController',

    views: ['RawData', 'Grid'],

    measures : [],
    filterMap : {}, // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance.
    idMap : {},     // inverse of the filterMap

    init : function() {

        this.control('datagrid', {
            filtertranslate: this.onFilterTranslate,
            lookupcolumnchange: this.onLookupColumnChange,
            measureselected: this.onMeasuresSelected,
            removefilter: this.onRemoveGridFilter,
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
        state.onMDXReady(function(mdx){

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

    displayCounts : function(response, sourceCls) {
        var rjson = Ext.decode(response.responseText);

        if (rjson && rjson.counts) {
            var cell, counts = rjson.counts;
            for (var source in counts) {
                if (counts.hasOwnProperty(source)) {
                    cell = Ext.DomQuery.select('.' + sourceCls + ' .itemrow:nodeValue(' + source + ')');
                    if (cell.length > 0) {
                        if (counts[source] == 0)
                            Ext.get(cell).addCls('itemdisabled');

                        Ext.get(cell).update('<span class="upct"><span class="val">' + source + '</span>&nbsp;(' + counts[source] + ')</span>');
                    }
                }
            }
        }
    },

    onMeasuresSelected : function (view, recs) {

        var allMeasures = [], sourceMeasure,
                item, i,
                sourceMeasuresRequired = {};  //Make sure we select the "source" measure for all datasets that have it


        for (i=0; i < recs.length; i++) {
            item = Ext.clone(recs[i].data);
            if (!(item.queryName in sourceMeasuresRequired))
                sourceMeasuresRequired[item.queryName] = true;

            //We don't want to lose foreign key info -- measure picker follows these by default
            if (item.name.indexOf("/") != -1) {
                if (item.name.toLowerCase() == "source/title") {
                    sourceMeasuresRequired[item.queryName] = false;
                    item.isSourceURI = true;
                }

                item.name = item.name.substring(0, item.name.indexOf("/"));
                item.alias = LABKEY.MeasureUtil.getAlias(item, true); //Since we changed the name need to recompute the alias
            }
            allMeasures.push(item);
        }

        Ext.iterate(sourceMeasuresRequired, function(queryName, value) {
            if (value) {
                sourceMeasure = this.findSourceMeasure(view, queryName);
                if (null != sourceMeasure)
                    allMeasures.push(sourceMeasure);
            }
        }, this);

        this.measures = allMeasures;

        this.updateQuery(view);
    },

    updateQuery : function (view) {
        var wrappedMeasures = [];

        for (var i=0; i < this.measures.length; i++) {
            wrappedMeasures.push({measure : this.measures[i], time : 'visit'});
        }

        var sorts = this.getSorts();
        if (sorts.length > 0 && wrappedMeasures.length > 0) {
            Ext.Ajax.request({
                url     : LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
                method  : 'POST',
                jsonData: {
                    measures : wrappedMeasures,
                    sorts    : sorts,
                    metaDataOnly : true
                },
                success : function(response) {
                    var result = Ext.decode(response.responseText);
                    this.getParticipantIn(function(participants) {
                        if (Ext.isDefined(view) && Ext.isFunction(view.refreshGrid)) {
                            view.refreshGrid(result, this.measures, participants);
                        }
                    });
                },
                failure : this.onFailure,
                scope   : this
            });
            this.refreshRequired = false;
        }
        else {
            view.runUniqueQuery();
        }
    },

    onFailure : function(response) {
        var resp = Ext.decode(response.responseText);
        Ext.Msg.show({
            title: response.status + ': ' + response.statusText,
            msg: resp.exception
        });
    },

    findSourceMeasure : function(view, datasetName) {
        var allMeasures = view.axisPanel.getMeasurePicker().measuresStoreData.measures;
        for (var i = 0; i < allMeasures.length; i++) {
            var measure = allMeasures[i];
            if (measure.name.toLowerCase() == "source/title" && measure.queryName == datasetName) {
                var sourceMeasure = Ext.clone(measure);
                sourceMeasure.name = sourceMeasure.name.substring(0, sourceMeasure.name.indexOf("/")); //Don't want the lookup
                sourceMeasure.hidden = true;
                sourceMeasure.isSourceURI = true;
                sourceMeasure.alias = LABKEY.MeasureUtil.getAlias(sourceMeasure, true); //Can't change the name without changing the alias
                return sourceMeasure;
            }
        }
    },

    getSorts : function() {

        var first = this.measures[0];

        // if we can help it, the sort should use the first non-demographic measure
        for (var i=0; i < this.measures.length; i++) {
            if (!this.measures[i].isDemographic) {
                first = this.measures[i];
                break;
            }
        }

        if (!first) {
            return [];
        }

        return [{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: Connector.studyContext.subjectColumn
        },{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: 'Study' // it is currently hidden by default in the server configuration
        },{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: Connector.studyContext.subjectVisitColumn + '/VisitDate'
        }];
    },

    getColumnName : function(URLParameterName) {
        var param = URLParameterName.replace('query.', '');
        return param.split('~')[0];
    },

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
        var remove = {}, colName, urlParam, found, id, i;
        for (urlParam in this.filterMap) {
            if (this.filterMap.hasOwnProperty(urlParam)) {
                found = false, colName = '';
                for (i=0; i < appFilters.length; i++) {

                    if (appFilters[i].getValue('gridFilter')) {
                        if (appFilters[i].id == this.hasFilter(appFilters[i].getValue('gridFilter'))) {
                            found = true;
                        }
                    }
                }
                if (!found) {
                    remove[urlParam] = {
                        urlParam : urlParam,
                        colName  : this.getColumnName(urlParam)
                    };
                }
            }
        }

        for (id in this.idMap) {
            if (this.idMap.hasOwnProperty(id)) {
                found = false;
                for (i=0; i < appFilters.length; i++) {
                    if (appFilters[i].id == id) {
                        found = true;
                    }
                }
                if (!found) {
                    remove[this.idMap[id]] = {
                        urlParam : this.idMap[id],
                        colName  : this.getColumnName(this.idMap[id])
                    };
                }
            }
        }

        found = [];
        for (urlParam in remove) {
            if (remove.hasOwnProperty(urlParam)) {
                found.push(remove[urlParam]);
            }
        }

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

        if (this.isActiveView) {
            this.updateQuery();
        }
        else {
            this.refreshRequired = true;
        }
    },

    mergeUpdatedFilters : function(filterArrays) {

        var fa = [],
                filter,
                updated = [],
                found, f, g, m,
                matches = {};

        for (f=0; f < filterArrays.length; f++) {
            for (g=0; g < filterArrays[f].length; g++) {

                fa.push(filterArrays[f][g]);
                for (filter in this.filterMap) {
                    if (this.filterMap.hasOwnProperty(filter)) {

                        if (filter.indexOf(filterArrays[f][g].getColumnName()) > -1) {

                            matches[filter] = true;

                        }
                    }
                }
            }
        }

        for (m in matches) {

            if (matches.hasOwnProperty(m)) {

                found = false;
                for (f=0; f < fa.length; f++) {
                    if ((m == this.getFilterId(fa[f])) && !(m.indexOf(fa[f].getColumnName()) > -1))
                        found = true;
                }

                if (!found) {
                    updated.push(this.filterMap[m]);
                    this.clearFilter(m);
                }

            }
        }

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
                            uniqueName: '[Subject].[' + groups[r][g] + ']'
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

        if (this.gridFilter)
            return;

        if (all) {
            var colName, names = [];
            for (colName in this.filterMap) {
                if (this.filterMap.hasOwnProperty(colName)) {
                    names.push(colName);
                }
            }
            this.filterMap = {};

            for (var n=0; n < names.length; n++) {
                this.getStateManager().removeFilter(names[n], 'Subject');
            }
        }
        else {
            var urlParam;
            for (urlParam in this.filterMap) {
                if (this.filterMap.hasOwnProperty(urlParam)) {
                    if (urlParam.indexOf(fieldKey) > -1) {
                        var id = this.filterMap[urlParam];
                        this.getStateManager().removeFilter(id, 'Subject');
                    }
                }
            }
        }

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

        var filters = [], filterIndexes = [], filter, f, i, grp, g, container;
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
                    container = Connector.model.Filter.getContainer(grp[g]);
                    filter.members.push({
                        uniqueName: '[Subject].[' + container + '].[' + grp[g] + ']'
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
     * @param columns {Connector.model.ColumnInfo} - Array of lookup columns from the last modified lookup column
     */
    onLookupColumnChange : function(newColumns, oldColumns) {

        if (oldColumns) {
            for (var f in this.filterMap) {
                if (this.filterMap.hasOwnProperty(f)) {

                    for (var h=0; h < oldColumns.length; h++) {

                        if (f.indexOf(oldColumns[h].data.fieldKeyPath) > -1) {

                            this.onRemoveGridFilter(oldColumns[h].data.fieldKeyPath, false);
                        }
                    }

                }
            }
        }
    },

    onViewChange : function (controller, view)  {
        this.isActiveView = view == 'datagrid';
        //Note: When this event fires, animation still seems to be in play and grid doesn't render properly
        //Deferring seems to fix it, but perhaps event should fire later.
        if (this.isActiveView && this.refreshRequired) {
            Ext.defer(this.updateQuery, 300, this);
        }
    },

    createView : function(xtype, config) {

        var v;

        if (xtype == 'datagrid') {
            v = Ext.create('Connector.view.RawData', {
                id: 'raw-data-view',
                ui: 'custom',
                control: this
            });

            this.getStateManager().on('filterchange', function(appFilters) {
                this.onFilterChange(v, appFilters);
            }, this);

            this.getViewManager().on('afterchangeview', this.onViewChange, this);
            this.getViewManager().on('afterchangeview', v.onViewChange, v);
        }
        else if (xtype == 'groupdatagrid') {
            v = Ext.create('Connector.view.Grid', {
                control: this
            });

            v.on('measureselected', this.onMeasuresSelected, this);

            this.getStateManager().on('filterchange', function(appFilters) {
                this.onFilterChange(v, appFilters);
            }, this);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'datagrid';
    }
});
