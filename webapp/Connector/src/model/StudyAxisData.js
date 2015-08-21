/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.StudyAxisData', {

    extend : 'Ext.data.Model',

    fields : [
        /* values passed in from Chart.js */
        {name : 'measure', defaultValue: {}}, // x-axis timepoint measure
        {name : 'containerAlignmentDayMap', defaultValue: {}},
        {name : 'records', defaultValue: []}, // filtered set of StudyVisitTag model records

        /* generated properties based on the processing of the above records */
        {name : 'data', defaultValue: []},
        {name : 'range', defaultValue: {min: null, max: null}}
    ],

    constructor : function(config) {
        this.callParent([config]);

        this.processStudyAxisData();
    },

    getRecords : function() {
        return this.get('records');
    },

    getMeasure : function(index) {
        return this.get('measure');
    },

    getContainerAlignmentDayMap : function() {
        return this.get('containerAlignmentDayMap');
    },

    getData : function() {
        return this.get('data');
    },

    getRange : function() {
        return this.get('range');
    },

    getVisit : function(studyLabel, groupName, groupLabel, visitLabel, seqMin, seqMax, protocolDay, alignedDay) {
        return {
            studyLabel: studyLabel,
            groupName: groupName,
            groupLabel: groupLabel,
            label: visitLabel,
            sequenceNumMin: seqMin,
            sequenceNumMax: seqMax,
            protocolDay: protocolDay,
            alignedDay: alignedDay,
            imgSrc: 'nonvaccination_normal.svg',
            visitTags: []
        };
    },

    setType : function(visit, visitTagCaption, isVaccination) {
        if (visitTagCaption !== null) {
            // determine which visit tag/milestone glyph to display
            // TODO: why is is_vaccination always coming back as false?
            if (isVaccination || visitTagCaption == 'Vaccination')
            {
                visit.imgSrc = 'vaccination_normal.svg';
                visit.imgSize = 14;
            }
        }
        return visit;
    },

    setPreenrollment : function(study, visitTagCaption, protocolDay, alignedDay) {

        if(visitTagCaption !== null) {
            if (visitTagCaption == 'Enrollment') {
                study.enrollment = alignedDay;
            }
        }
        return study
    },

    processStudyAxisData : function() {
        var records = this.getRecords(), measure = this.getMeasure(),
                containerAlignmentDayMap = this.getContainerAlignmentDayMap(),
                interval, studyMap = {}, studyLabel, data = [], range = {min: null, max: null},
                study, studyContainer, studyKeys, visit, studyVisits, visitId, visitKeys, visitKey, visitLabel, seqMin,
                seqMax, protocolDay, alignedDay, timepointType, groupName, visitTagCaption, isVaccination,
                shiftVal, i, j, k, alignmentVisitTag, visitTagName, row, groupKeys, groupVisit, groupVisits, group, groups,
                groupLabel, groupDesc;

        if (Ext.isDefined(measure.interval)) {
            interval = measure.interval.toLowerCase();
        }

        // first we have to loop through the study axis visit information to find the alignment visit for each container
        alignmentVisitTag = Ext.isObject(measure.options) ? measure.options.alignmentVisitTag : null;
        if (alignmentVisitTag != null)
        {
            Ext.each(records, function(record){
                studyContainer = record.get('container_id');
                visitTagName = record.get('visit_tag_name');
                if (visitTagName == alignmentVisitTag)
                    containerAlignmentDayMap[studyContainer] = record.get('protocol_day');
            }, this);
        }

        // track each unique study by container id
        studyKeys = Object.keys(containerAlignmentDayMap);
        for (i = 0; i < studyKeys.length; i++) {
            studyMap[studyKeys[i]] = {
                alignShiftValue: containerAlignmentDayMap[studyKeys[i]],
                name: '',
                visits: {},
                groups: {}
            };
        }

        // loop through the StudyVisitTag records to gather data about each visit
        Ext.each(records, function(record){
            studyLabel = record.get('study_label');
            studyContainer = record.get('container_id');
            shiftVal = studyMap[studyContainer].alignShiftValue;
            visitId = record.get('visit_row_id');
            visitLabel = record.get('visit_label');
            seqMin = record.get('sequence_num_min');
            seqMax = record.get('sequence_num_max');
            protocolDay = record.get('protocol_day');
            alignedDay = this.convertInterval(record.get('protocol_day') - shiftVal, interval);
            timepointType = record.get('timepoint_type');
            groupName = record.get('group_name');
            groupLabel = record.get('group_label');
            groupDesc = record.get('group_description');
            visitTagCaption = record.get('visit_tag_caption');
            isVaccination = record.get('is_vaccination');

            if (timepointType !== 'VISIT') {
                seqMin = this.convertInterval(seqMin - shiftVal, interval);
                seqMax = this.convertInterval(seqMax - shiftVal, interval);
            }

            study = studyMap[studyContainer];
            study.name = studyLabel;
            study.timepointType = timepointType;

            // track each unique visit in a study by rowId
            if (visitId != null) {
                if (!study.visits.hasOwnProperty(visitId))
                    study.visits[visitId] = this.getVisit(studyLabel, null, null, visitLabel, seqMin, seqMax, protocolDay, alignedDay);

                visit = this.setType(study.visits[visitId], visitTagCaption, isVaccination);
                if(visitTagCaption !== null) {
                    visit.visitTags.push({
                        study: study.name,
                        group: groupLabel,
                        tag: visitTagCaption + ((isVaccination || visitTagCaption == 'Vaccination') ? ' - ' + groupDesc : '')
                    });
                }
                study = this.setPreenrollment(study, visitTagCaption, protocolDay, alignedDay);

                if (range.min == null || range.min > alignedDay)
                    range.min = alignedDay;
                if (range.max == null || range.max < alignedDay)
                    range.max = alignedDay;

                if (groupLabel != null) {
                    if (!study.groups.hasOwnProperty(groupLabel)) {
                        study.groups[groupLabel] = {
                            study: study.name,
                            name: groupLabel,
                            alignShiftValue: 0,
                            timepointType: timepointType,
                            visits: {}
                        };
                    }

                    if (!study.groups[groupLabel].visits.hasOwnProperty(visitId))
                        study.groups[groupLabel].visits[visitId] = this.getVisit(studyLabel, groupName, groupLabel, visitLabel, seqMin, seqMax, protocolDay, alignedDay);

                    groupVisit = this.setType(study.groups[groupLabel].visits[visitId], visitTagCaption, isVaccination);
                    if(visitTagCaption !== null) {
                        groupVisit.visitTags.push({
                            study: study.name,
                            group: groupLabel,
                            tag: visitTagCaption + ((isVaccination || visitTagCaption == 'Vaccination') ? ' - ' + groupDesc : '')
                        });
                    }
                    study.groups[groupLabel] = this.setPreenrollment(study.groups[groupLabel], visitTagCaption, protocolDay, alignedDay);
                }
            }
        }, this);

        // Convert study map, group map and visit maps into arrays.
        studyKeys = Object.keys(studyMap);
        for (i = 0; i < studyKeys.length; i++) {
            study = studyMap[studyKeys[i]];
            visitKeys = Object.keys(study.visits).sort();
            studyVisits = [];
            for (j = 0; j < visitKeys.length; j++) {
                visitKey = visitKeys[j];
                studyVisits.push(study.visits[visitKey]);
            }
            groupKeys = Object.keys(study.groups);
            groups = [];
            for (j = 0; j < groupKeys.length; j++) {
                group = study.groups[groupKeys[j]];
                visitKeys = Object.keys(group.visits).sort();
                groupVisits = [];
                for (k = 0; k < visitKeys.length; k++) {
                    visitKey = visitKeys[k];
                    groupVisits.push(group.visits[visitKey]);
                }
                group.visits = groupVisits;
                groups.push(group);
            }
            study.groups = groups;
            study.visits = studyVisits;
            data.push(study);
        }

        // sort by study label
        data.sort(function(a, b) {
            if (a.label < b.label)
                return -1;
            if (a.label > b.label)
                return 1;
            return 0;
        });

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