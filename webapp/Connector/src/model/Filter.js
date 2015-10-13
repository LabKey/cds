/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'LABKEY.app.model.Filter',

    statics: {
        loaded: false,
        subjectMap: {},
        getSubjectUniqueName : function(subjectID) {
            return '[Subject].[' + Connector.model.Filter.getContainer(subjectID) + '].[' + subjectID + ']';
        },
        getContainer : function(subjectID) {
            return Connector.model.Filter.subjectMap[subjectID];
        },
        loadSubjectContainer : function(mdx) {

            if (!Connector.model.Filter.loaded) {
                // load from mdx
                var level = mdx.getDimension('Subject').getHierarchies()[0].levelMap['Subject'];
                var members = level.members;

                Ext.each(members, function(member) {
                    if (Connector.model.Filter.subjectMap[member.name]) {
                        var msg = 'Unable to process the same subject identifier in multiple studies.';
                        if (LABKEY.devMode) {
                            msg += " ID: " + member.name;
                        }
                        console.error(msg);
                    }
                    else {
                        var uniqueName = member.uniqueName.split('].');
                        var containerID = uniqueName[1].replace('[', '');
                        Connector.model.Filter.subjectMap[member.name] = containerID;
                    }
                });

                Connector.model.Filter.loaded = true;
            }
        },

        getGridLabel : function(gf) {
            if (gf.getFilterType().getURLSuffix() === 'dategte' || gf.getFilterType().getURLSuffix() === 'datelte') {
                return LABKEY.app.model.Filter.getShortFilter(gf.getFilterType().getDisplayText()) + ' ' + ChartUtils.tickFormat.date(gf.getValue());
            }
            return LABKEY.app.model.Filter.getGridLabel(gf);
        },

        getFilterValuesAsArray : function(gf) {
            var values = [];
            Ext.each(gf.getValue(), function(value) {
                Ext.each(value.split(';'), function(v) {
                    values.push(Ext.htmlEncode(v == '' ? ChartUtils.emptyTxt : v));
                });
            });

            return values;
        }
    }
});
