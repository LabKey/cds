/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'LABKEY.app.model.Filter',

    statics: {
        loaded: false,
        subjectMap: {},

        factory : function(config) {

        },

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

        plotMeasuresEqual : function(measuresA, measuresB){
            var alignmentVisitTagMatch = function(measureAdateOptions, measureBdateOptions) {
                return ((!measureAdateOptions && !measureAdateOptions) ||
                        (measureAdateOptions && measureBdateOptions && measureAdateOptions.zeroDayVisitTag === measureBdateOptions.zeroDayVisitTag));
            };

            var userGroupsMatch = function(measureAvalues, measureBvalues) {
                return ((!measureAvalues && !measureBvalues) ||
                        (measureAvalues && measureBvalues &&
                                measureAvalues.length == measureBvalues.length &&
                                measureAvalues.join() === measureBvalues.join()));
            };

            var antigenValuesMatch = function(measureAoptions, measureBoptions) {
                return ((!measureAoptions && !measureBoptions) ||
                        (measureAoptions && measureAoptions.antigen && measureBoptions && measureBoptions.antigen &&
                                measureAoptions.antigen.values.length == measureBoptions.antigen.values.length &&
                                measureAoptions.antigen.values.join() === measureBoptions.antigen.values.join()));
            };

            var compareMeasures = function(measureA, measureB) {
                if (!measureA && !measureB) {
                    return true;
                } else {
                    if (measureA !== null && measureB !== null && measureA.visit === measureB.visit) {
                        return measureA.hasOwnProperty('measure') && measureB.hasOwnProperty('measure') &&
                                measureA.measure.hasOwnProperty('alias') && measureB.measure.hasOwnProperty('alias') &&
                                measureA.measure.alias === measureB.measure.alias &&
                                alignmentVisitTagMatch(measureA.dateOptions, measureB.dateOptions) &&
                                userGroupsMatch(measureA.measure.values, measureB.measure.values) &&
                                antigenValuesMatch(measureA.measure.options, measureB.measure.options);
                    }
                }

                return false;
            };

            if (measuresA.length === measuresB.length) {
                return compareMeasures(measuresA[0], measuresB[0]) &&
                        compareMeasures(measuresA[1], measuresB[1]) &&
                        compareMeasures(measuresA[2], measuresB[2]);
            }

            return false;
        }
    }
});
