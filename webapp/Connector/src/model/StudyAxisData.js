/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.StudyAxisData', {

    extend : 'Ext.data.Model',

    fields : [
        /* values passed in from Chart.js */
        {name : 'measure', defaultValue: {}}, // x-axis timepoint measure
        {name : 'records', defaultValue: []}, // filtered set of StudyVisitTag model records
        {name : 'studyVisitMap', defaultValue: {}}, // a set of studyVisits that has data in plot
        {name : 'studyGroupVisitMap', defaultValue: {}}, // a set of studyGroupVisits that has data in plot

        /* generated properties based on the processing of the above records */
        {name : 'data', defaultValue: []},
        {name : 'range', defaultValue: {min: null, max: null}},
        {name : 'visitTags', defaultValue: []}
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

    getData : function() {
        return this.get('data');
    },

    getRange : function() {
        return this.get('range');
    },

    getAllVisitTags : function() {
        return this.get('visitTags');
    },

    getVisitTag : function(studyName, groupName, tagLabel, groupDesc)
    {
        return {
            study: studyName,
            group: groupName,
            tag: tagLabel,
            desc: groupDesc ? groupDesc : ''
        }
    },

    _genVisit : function(visitConfig)
    {
        var visit = Ext.applyIf(visitConfig, {
            studyLabel: undefined,
            label: undefined,
            groupName: undefined,
            groupLabel: undefined,
            sequenceNumMin: undefined,
            sequenceNumMax: undefined,
            alignedDay: undefined,
            protocolDay: undefined,
            isChallenge: false,
            isVaccination: false,
            imgSize: 8,
            visitTags: []
        });

        if (visit.visitTagCaption)
        {
            // determine which visit tag/milestone glyph to display
            if (visit.isVaccination || visit.isChallenge)
            {
                visit.imgSize = 14;
            }
        }

        return visit;
    },

    processStudyAxisData : function()
    {
        var records = this.getRecords(),
            measure = this.getMeasure(),
            studyMap = {},
            range = {min: null, max: null},
            interval, studyLabel, data = [],
            study, studyContainer, studyKeys, visit, visitId, visitKeys, visitKey, visitLabel, seqMin,
            seqMax, protocolDay, alignedDay, timepointType, groupName, visitTagCaption, visitTagLabel, isVaccination, isChallenge,
            shiftVal, i, j, k, alignmentVisitTag, visitTagName,
            groupKeys, groupVisit, groupVisits, group, groups, groupLabel, groupDesc, uniqueAlignedDays = {};

        if (Ext.isDefined(measure.interval))
        {
            interval = measure.interval;
        }

        if (Ext.isObject(measure.options) && measure.options.alignmentVisitTag)
        {
            alignmentVisitTag = measure.options.alignmentVisitTag;
        }

        Ext.each(records, function(record)
        {
            studyContainer = record.get('container_id');
            visitTagName = record.get('visit_tag_name');
            groupLabel = record.get('group_label');
            protocolDay = record.get('protocol_day');
            seqMin = record.get('sequence_num_min');
            seqMax = record.get('sequence_num_max');

            // check study mapping
            if (!studyMap[studyContainer])
            {
                studyMap[studyContainer] = {
                    name: record.get('study_label'),
                    timepointType: record.get('timepoint_type'),
                    alignShiftValue: 0,
                    visits: {},
                    groups: {},
                    description: record.get('study_description')
                };
            }

            study = studyMap[studyContainer];

            // check group mapping
            if (!study.groups[groupLabel])
            {
                if (groupLabel)
                {
                    study.groups[groupLabel] = {
                        study: study.name,
                        name: groupLabel,
                        hasAlignment: !Ext.isDefined(alignmentVisitTag),
                        alignShiftValue: 0,
                        timepointType: study.timepointType,
                        description: StudyUtils.getTreatmentArmDescription(groupLabel),
                        visits: {}
                    }
                }
                else
                {
                    console.warn('StudyVisitTagInfo contains undefined group for study:', record.get('study_label'));
                    return;
                }
            }

            if (alignmentVisitTag && visitTagName === alignmentVisitTag)
            {
                study.groups[groupLabel].hasAlignment = true;
                study.groups[groupLabel].alignShiftValue = protocolDay;

                // sets the maximum left-alignment for this study based on the highest protocolDay
                // found for a group with the aligning tag
                if (protocolDay > study.alignShiftValue)
                {
                    study.alignShiftValue = protocolDay;
                }
            }
        }, this);

        // loop through the StudyVisitTag records to gather data about each visit
        Ext.each(records, function(record)
        {
            studyContainer = record.get('container_id');
            study = studyMap[studyContainer];
            studyLabel = study.name;

            groupLabel = record.get('group_label');
            group = study.groups[groupLabel];

            shiftVal = study.alignShiftValue;
            visitId = record.get('visit_row_id');
            visitLabel = record.get('visit_label');
            seqMin = record.get('sequence_num_min');
            seqMax = record.get('sequence_num_max');
            protocolDay = record.get('protocol_day');
            timepointType = record.get('timepoint_type');
            groupName = record.get('group_name');
            groupDesc = record.get('detail_label');
            visitTagCaption = record.get('visit_tag_caption');
            visitTagLabel = record.get('visit_tag_label');
            isVaccination = record.get('is_vaccination');
            isChallenge = record.get('is_challenge');

            // don't show study axis icon for Placeholder visit tag
            if (visitTagLabel == 'Placeholder')
                return true; // continue

            if (group)
            {
                shiftVal -= (study.alignShiftValue - group.alignShiftValue);
            }

            alignedDay = this.convertInterval(protocolDay - shiftVal, interval);
            uniqueAlignedDays[alignedDay] = true;

            if (timepointType !== 'VISIT')
            {
                seqMin = this.convertInterval(seqMin - shiftVal, interval);
                seqMax = this.convertInterval(seqMax - shiftVal, interval);
            }

            // track each unique visit in a study by rowId
            if (Ext.isNumber(visitId))
            {
                var tagKey = ChartUtils.studyAxisKeyDelimiter + alignedDay + ChartUtils.studyAxisKeyDelimiter + studyLabel;
                var hasDataInPlot = this.get('studyVisitMap')[tagKey] === true;
                visit = this._genVisit({
                    studyLabel: studyLabel,
                    sequenceNumMin: seqMin,
                    sequenceNumMax: seqMax,
                    alignedDay: alignedDay,
                    protocolDay: protocolDay,
                    visitTagCaption: visitTagCaption,
                    visitTagLabel: visitTagLabel,
                    isVaccination: isVaccination,
                    isChallenge: isChallenge,
                    visitRowId: visitId,
                    isTagActive: hasDataInPlot
                });

                // check visit mapping
                if (!study.visits[alignedDay])
                {
                    study.visits[alignedDay] = visit;
                }
                else if (this.hasTagPriority(visit, study.visits[alignedDay]))
                {
                    // copy processed visit tags
                    visit.visitTags = study.visits[alignedDay].visitTags;
                    study.visits[alignedDay] = visit;
                }

                visit = study.visits[alignedDay];

                if (visitTagLabel)
                {
                    visit.visitTags.push(this.getVisitTag(study.name, groupLabel, visitTagLabel, groupDesc));
                }

                // turning off pre-enrollment until it is established what determines
                // where pre-enrollment begins for a study (first data point? tagged visit?)
                //if (this.hasPreEnrollment(visitTagCaption))
                //{
                //    study.enrollment = alignedDay;
                //}

                if (range.min == null || range.min > alignedDay)
                {
                    range.min = alignedDay;
                }
                if (range.max == null || range.max < alignedDay)
                {
                    range.max = alignedDay;
                }

                if (groupLabel)
                {
                    if (!study.groups[groupLabel].visits[alignedDay])
                    {
                        var tagKey = ChartUtils.studyAxisKeyDelimiter + alignedDay;
                        tagKey +=  ChartUtils.studyAxisKeyDelimiter + studyLabel + ChartUtils.studyAxisKeyDelimiter + groupLabel;
                        var hasDataInPlot = this.get('studyGroupVisitMap')[tagKey] === true;
                        study.groups[groupLabel].visits[alignedDay] = this._genVisit({
                            studyLabel: studyLabel,
                            groupName: groupName,
                            groupLabel: groupLabel,
                            label: visitLabel,
                            sequenceNumMin: seqMin,
                            sequenceNumMax: seqMax,
                            alignedDay: alignedDay,
                            protocolDay: protocolDay,
                            visitTagCaption: visitTagCaption,
                            visitTagLabel: visitTagLabel,
                            isVaccination: isVaccination,
                            isChallenge: isChallenge,
                            visitRowId: visitId,
                            isTagActive: hasDataInPlot
                        });
                    }

                    groupVisit = study.groups[groupLabel].visits[alignedDay];
                    if (visitTagLabel)
                    {
                        groupVisit.visitTags.push(this.getVisitTag(study.name, groupLabel, visitTagLabel, groupDesc));
                    }

                    // turning off pre-enrollment until it is established what determines
                    // where pre-enrollment begins for a study (first data point? tagged visit?)
                    //if (this.hasPreEnrollment(visitTagCaption))
                    //{
                    //    study.groups[groupLabel].enrollment = alignedDay;
                    //}
                }
            }
        }, this);

        // Convert study map, group map and visit maps into arrays.
        studyKeys = Ext.Object.getKeys(studyMap);
        for (i = 0; i < studyKeys.length; i++)
        {
            study = studyMap[studyKeys[i]];
            groupKeys = Ext.Object.getKeys(study.groups);
            groups = [];
            for (j = 0; j < groupKeys.length; j++)
            {
                group = study.groups[groupKeys[j]];

                if (!group.hasAlignment)
                {
                    console.warn('"' + group.study + ': ' + group.name + '" does not have a tag for the current alignment.');
                }

                visitKeys = Ext.Object.getKeys(group.visits).sort();
                groupVisits = [];
                for (k = 0; k < visitKeys.length; k++)
                {
                    visitKey = visitKeys[k];
                    groupVisits.push(group.visits[visitKey]);
                }
                group.visits = groupVisits.sort(this.visitSortFn);
                groups.push(group);
            }

            // sort groups separately (e.g. 'Group 1 Vaccine, Group 2 Vaccine, Group 10 Vaccine, etc'
            study.groups = groups.sort(this._naturalSortHelper);
            study.visits = Ext.Object.getValues(study.visits).sort(this.visitSortFn);

            data.push(study);
        }

        // sort by study label
        data.sort(this._naturalSortHelper);

        var allTags = [];
        for (var tag in uniqueAlignedDays) {
            if(uniqueAlignedDays.hasOwnProperty(tag)) {
                allTags.push(tag);
            }
        }

        allTags = allTags.sort(function(a, b){
            return a - b;
        });

        this.set({
            data: data,
            range: range,
            visitTags: allTags
        });
    },

    visitSortFn: function(visit1, visit2)
    {
        if (visit1.isTagActive && !visit2.isTagActive)
            return 1;
        else if (!visit1.isTagActive && visit2.isTagActive)
            return -1;
        else
            return visit1.protocolDay - visit2.protocolDay;
    },

    hasPreEnrollment : function(visitTagCaption)
    {
        return visitTagCaption && visitTagCaption == 'Enrollment';
    },

    hasTagPriority : function(visitA, visitB)
    {
        // either is a vaccination
        if (visitB.isVaccination || visitA.isVaccination)
        {
            return visitB.isVaccination ? false : true;
        }

        // either is a challenge
        if (visitB.isChallenge || visitA.isChallenge)
        {
            return visitB.isChallenge ? false : true;
        }

        // both dots
        return false;
    },

    _naturalSortHelper : function(a, b)
    {
        return Connector.model.Filter.sorters.natural(a.name, b.name);
    },

    convertInterval : function(d, interval)
    {
        var denom = QueryUtils.getIntervalDenominator(interval);
        return denom > 1 ? Math.floor(d / denom) : d;
    }
});