/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.StudyAxisData', {

    extend : 'Ext.data.Model',

    fields : [
        // TODO: verify how these are used and if they are needed anymore
        {name : 'measures', defaultValue: [null, null, null]}, // Array [x, y, color]
        {name : 'visitMap', defaultValue: {}},
        {name : 'containerAlignmentDayMap', defaultValue: {}},

        /* from the selectRows call to StudyVisitTagInfo */
        {name : 'schemaName'},
        {name : 'queryName'},
        {name : 'rows', defaultValue: []},

        /* generated properties based on the processing of the above rows */
        {name : 'data', defaultValue: []},
        {name : 'range', defaultValue: {min: null, max: null}}
    ],

    constructor : function(config) {
        this.callParent([config]);

        this.processStudyAxisData();
    },

    getDataRows : function() {
        return this.get('rows');
    },

    getMeasure : function(index) {
        return this.get('measures')[index];
    },

    getContainerAlignmentDayMap : function() {
        return this.get('containerAlignmentDayMap');
    },

    getVisitMap : function() {
        return this.get('visitMap');
    },

    getData : function() {
        return this.get('data');
    },

    getRange : function() {
        return this.get('range');
    },

    processStudyAxisData : function(mappings) {
        var rows = this.getDataRows(), visitMap = this.getVisitMap(), containerAlignmentDayMap = this.getContainerAlignmentDayMap(),
                interval, studyMap = {}, studyLabel, data = [], range = {min: null, max: null},
                study, studyContainer, studyKeys, visit, visits, visitId, visitKeys, visitKey, visitLabel, seqMin,
                seqMax, protocolDay, timepointType, groupName, visitTagCaption, isVaccination,
                shiftVal, i, j, alignmentVisitTag, visitTagName, _row;

        if (this.getMeasure(0).interval) {
            interval = this.getMeasure(0).interval.toLowerCase();
        }

        // first we have to loop through the study axis visit information to find the alignment visit for each container
        alignmentVisitTag = this.getMeasure(0).options ? this.getMeasure(0).options.alignmentVisitTag : null;
        if (alignmentVisitTag != null)
        {
            for (j = 0; j < rows.length; j++)
            {
                studyContainer = rows[j].StudyContainer.value;
                visitTagName = rows[j].VisitTagName.value;
                if (visitTagName == alignmentVisitTag)
                    containerAlignmentDayMap[studyContainer] = rows[j].ProtocolDay.value;
            }
        }

        for (j = 0; j < rows.length; j++) {
            _row = rows[j];

            studyLabel = _row['study_label'];
            studyContainer = _row['container_id'];
            shiftVal = containerAlignmentDayMap[studyContainer];
            visitId = _row['visit_row_id'];
            visitLabel = _row['visit_label'];
            seqMin = _row['sequence_num_min'];
            seqMax = _row['sequence_num_max'];
            protocolDay = this.convertInterval(_row['protocol_day'] - shiftVal, interval);
            timepointType = _row['timepoint_type'];
            groupName = _row['group_name'];
            visitTagCaption = _row['visit_tag_caption'];
            isVaccination = _row['is_vaccination'];

            if (!visitMap[visitId] && !visitTagCaption) {
                continue;
            }

            if (timepointType !== 'VISIT') {
                seqMin = this.convertInterval(seqMin - shiftVal, interval);
                seqMax = this.convertInterval(seqMax - shiftVal, interval);
            }

            if (!studyMap.hasOwnProperty(studyLabel)) {
                studyMap[studyLabel] = {
                    label : studyLabel,
                    timepointType : timepointType,
                    visits: {}
                };
            }

            study = studyMap[studyLabel];

            if (!study.visits.hasOwnProperty(visitId)) {
                study.visits[visitId] = {
                    studyLabel: studyLabel,
                    label: visitLabel,
                    sequenceNumMin: seqMin,
                    sequenceNumMax: seqMax,
                    protocolDay: protocolDay,
                    hasPlotData: visitMap[visitId] != undefined,
                    imgSrc: 'nonvaccination_normal.svg',
                    imgSize: 8,
                    visitTags: []
                };
            }

            visit = study.visits[visitId];

            // TODO: why is is_vaccination always coming back as false?
            if (isVaccination || visitTagCaption == 'Vaccination') {
                visit.imgSrc = 'vaccination_normal.svg';
                visit.imgSize = 16;
            }

            if (visitTagCaption !== null) {
                visit.visitTags.push({group: groupName, tag: visitTagCaption});
            }

            if (range.min == null || range.min > protocolDay)
                range.min = protocolDay;
            if (range.max == null || range.max < protocolDay)
                range.max = protocolDay;
        }

        // Convert study map and visit maps into arrays.
        studyKeys = Object.keys(studyMap).sort();

        for (i = 0; i < studyKeys.length; i++) {
            study = studyMap[studyKeys[i]];
            visitKeys = Object.keys(study.visits).sort();
            visits = [];
            for (j = 0; j < visitKeys.length; j++) {
                visitKey = visitKeys[j];
                visits.push(study.visits[visitKey]);
            }

            study.visits = visits;
            data.push(study);
        }

        this.set({
            data: data,
            range: range
        });
    },

    convertInterval : function(d, interval) {
        // Conversion methods here taken from VisualizationIntervalColumn.java line ~30
        if (interval == 'days') {
            return d;
        }
        else if (interval == 'weeks') {
            return Math.floor(d / 7);
        }
        else if (interval == 'months') {
            return Math.floor(d / (365.25/12));
        }

        throw 'Invalid interval supplied! Expected "days", "weeks", or "months"';
    }
});