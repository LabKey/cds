/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.controller.RawData', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['RawData'],

    rawDataView : null,

    measures : [],
    filterMap : {}, // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance.
    idMap : {},     // inverse of the filterMap
    subjectColumn : 'ParticipantId',
    subjectVisitColumn : 'ParticipantVisit',

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
            Ext4.Ajax.request({
                url : LABKEY.ActionURL.buildURL('cds', 'getSourceCounts'),
                method : 'POST',
                jsonData : json,
                success : callback,
                scope : scope
            });
        }
    },

    displayCounts : function(response, sourceCls) {
        var rjson = Ext4.decode(response.responseText);

        if (rjson && rjson.counts) {
            var cell, counts = rjson.counts, style;
            for (var source in counts) {
                if (counts.hasOwnProperty(source)) {
                    cell = Ext4.DomQuery.select('.' + sourceCls + ' .x4-grid-cell-inner:nodeValue(' + source + ')');
                    style = (counts[source] > 0 ? '': 'style="color: #d3d3d3"');
                    if (cell.length > 0) {
                        Ext4.get(cell).update('<span class="upct" ' + style + '><span class="val">' + source + '</span>&nbsp;(' + counts[source] + ')</span>');
                    }
                    else {
                        cell = Ext4.DomQuery.select('.' + sourceCls + ' .x4-grid-cell-inner span.val:nodeValue(' + source + ')');
                        if (cell.length > 0) {
                            cell = Ext4.get(cell[0]).parent('div.x4-grid-cell-inner');
                            cell.update('<span class="upct" ' + style + '><span class="val">' + source + '</span>&nbsp;(' + counts[source] + ')</span>');
                        }
                    }
                }
            }
        }
    },

    onMeasuresSelected: function (recs) {

        var allMeasures = [],
            item,
            sourceMeasuresRequired = {};  //Make sure we select the "source" measure for all datasets that have it


        for (var i=0; i < recs.length; i++) {
            item = Ext4.clone(recs[i].data);
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

        for (var queryName in sourceMeasuresRequired) {
            if (sourceMeasuresRequired.hasOwnProperty(queryName))
            {
                if (sourceMeasuresRequired[queryName]) {
                    var sourceMeasure = this.findSourceMeasure(queryName);
                    if (null != sourceMeasure)
                        allMeasures.push(sourceMeasure);
                }
            }
        }
        this.measures = allMeasures;

        this.updateQuery();
    },

    updateQuery : function () {
        var wrappedMeasures = [];

        for (var i=0; i < this.measures.length; i++) {
            wrappedMeasures.push({measure : this.measures[i], time : 'visit'});
        }

        var sorts = this.getSorts();
        if (sorts.length > 0 && wrappedMeasures.length > 0) {
            Ext4.Ajax.request({
                url     : LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
                method  : 'POST',
                jsonData: {
                    measures : wrappedMeasures,
                    sorts    : sorts,
                    metaDataOnly : true
                },
                success : function(response){
                    var result = Ext4.decode(response.responseText);
                    this.getParticipantIn(function(ptids) {
                        this.rawDataView.refreshGrid(result, this.measures, ptids, this.subjectColumn);
                    });
                },
                failure : this.onFailure,
                scope   : this
            });
            this.refreshRequired = false;
        }
        else {
            this.rawDataView.runUniqueQuery();
        }
    },

    findSourceMeasure : function(datasetName) {
        var allMeasures = this.rawDataView.axisPanel.getMeasurePicker().measuresStoreData.measures;
        for (var i = 0; i < allMeasures.length; i++) {
            var measure = allMeasures[i];
            if (measure.name.toLowerCase() == "source/title" && measure.queryName == datasetName) {
                var sourceMeasure = Ext4.clone(measure);
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
            name       : this.subjectColumn,
            queryName  : first.queryName,
            schemaName : first.schemaName
        },{
            name       : this.subjectVisitColumn + '/VisitDate',
            queryName  : first.queryName,
            schemaName : first.schemaName
        }];
    },

    getColumnName : function(URLParameterName) {
        var param = URLParameterName.replace('query.', '');
        return param.split('~')[0];
    },

    // Listener for Application CDS filters
    onFilterChange : function (appFilters) {

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
            this.rawDataView.removeAppFilter(found);
            if (this.rawDataView.gridLock) {
                this.filterremove = true;
            }
        }
        else {
            this.filterremove = false;
            this.rawDataView.gridLock = false;
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

    onFilterTranslate : function(groups, filterArrays) {

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
                            uname : ['Participant', groups[r][g]]
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
                this.runFilterAnimation(newFilters, this.afterFilterAnimation);
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
                this.getStateManager().removeFilter(names[n], 'Participant');
            }
        }
        else {
            var urlParam;
            for (urlParam in this.filterMap) {
                if (this.filterMap.hasOwnProperty(urlParam)) {
                    if (urlParam.indexOf(fieldKey) > -1) {
                        var id = this.filterMap[urlParam];
                        this.clearFilter(urlParam);
                        this.getStateManager().removeFilter(id, 'Participant');
                    }
                }
            }
        }

    },

    runFilterAnimation : function(filterGroups, callback) {

        var box   = Ext4.get(Ext4.DomQuery.select('.filterpanel')[1]).getBox(); // filter panel on RHS
        var cbox  = this.rawDataView.filterWin.ppx;

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
            var xdom = Ext4.get(dom);
            xdom.appendTo(Ext4.getBody());

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
                        Ext4.removeNode(xdom.dom);
                        me.allowHover = true;
                    }
                }
            });
        }

        if (callback) {
            var task = new Ext4.util.DelayedTask(callback, this, [filterGroups]);
            task.delay(500);
        }
    },

    afterFilterAnimation : function(filterGroups) {

        var filters = [], filterIndexes = [], filter, f, i, g;
        for (f=0; f < filterGroups.length; f++) {

            for (i=0; i < filterGroups[f].filters.length; i++) {

                filter = {
                    hierarchy  : 'Participant',
                    isGrid     : true,
                    gridFilter : filterGroups[f].filters[i],
                    members    : []
                };

                for (g=0; g < filterGroups[f].group.length; g++) {

                    filter.members.push({
                        uname : ['Participant', filterGroups[f].group[g]]
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

    onViewChange : function (xtype)  {
        this.isActiveView = xtype == 'datagrid';
        //Note: When this event fires, animation still seems to be in play and grid doesn't render properly
        //Deferring seems to fix it, but perhaps event should fire later.
        if (this.isActiveView && this.refreshRequired) {
            Ext4.defer(this.updateQuery, 300, this);
        }
    },

    createView : function(xtype, config) {
        if (xtype == 'datagrid') {
            var v = Ext4.create('Connector.view.RawData', {
                id : 'raw-data-view',
                ui : 'custom',
                control : this
            });

            this.rawDataView = v;

            this.rawDataView.on('filtertranslate', this.onFilterTranslate,  this);
            this.rawDataView.on('lookupcolumnchange', this.onLookupColumnChange, this);
            this.rawDataView.on('measureselected', this.onMeasuresSelected, this);
            this.rawDataView.on('removefilter',    this.onRemoveGridFilter, this);

            this.getStateManager().on('filterchange', this.onFilterChange, this);

            this.getViewManager().on('afterchangeview', this.onViewChange, this);
            this.getViewManager().on('afterchangeview', v.onViewChange, v);

            return v;
        }
    },

    updateView : function(xtype, context) { }
});
