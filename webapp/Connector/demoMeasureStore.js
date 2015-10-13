/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function($) {

    // used by utility/Query.js
    Connector = {studyContext: {subjectColumn: 'SubjectId'}};
    Ext = Ext4;

    // set to undefined to use default getData
    var ENDPOINT = LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api');

    // Document Ready
    $(function() {

        console.info('Demo Measure Store! Each request will set the measure store to window.MS and data to window.DATA. Happy Plotting!');

        var PLOTS = {
            plotYMeasureXNone: plotYMeasureXNone,
            plotYMeasureXDemCat: plotYMeasureXDemCat,
            plotYMeasureXDemNum: plotYMeasureXDemNum,
            plotYMeasureXSameAssayCat: plotYMeasureXSameAssayCat,
            plotYMeasureXSameAssayNum: plotYMeasureXSameAssayNum,
            plotYMeasureXSameDiffFilter: plotYMeasureXSameDiffFilter,
            plotYMeasureXSameDiffFilter2: plotYMeasureXSameDiffFilter2,
            plotYMeasureXDiffAssay: plotYMeasureXDiffAssay,
            plotYMeasureXDiffAssay2: plotYMeasureXDiffAssay2,
            plotYMeasureXDiffAssay3: plotYMeasureXDiffAssay3,
            plotYMeasureXWeeksUnaligned: plotYMeasureXWeeksUnaligned,
            plotYMeasureXMonthsAligned: plotYMeasureXMonthsAligned,

            scatterMeasureSameSource: scatterMeasureSameSource,
            categoricalSingleSource: categoricalSingleSource
        };

        var tabsSel = '.demo-measure-store .tab',
            activeCls = 'active-tab';

        $(tabsSel).click(function() {
            $(tabsSel).removeClass(activeCls);
            $(this).addClass(activeCls);
        });

        function onHashChange(initial)
        {
            var hash = location.hash;
            if (initial === true) {
                if (hash) {
                    hash = hash.split('#')[1];
                }
            }
            else {
                hash = hash.split('#')[1];
            }

            if (hash && PLOTS.hasOwnProperty(hash)) {
                PLOTS[hash]();

                if (initial === true) {
                    $(tabsSel + ' a[href="' + '#' + hash + '"]').parent().addClass(activeCls);
                }
            }
        }

        window.addEventListener('hashchange', onHashChange, false);
        onHashChange(true);

        function logStoreData(store, data) {
            window.MS = store;
            window.DATA = data;

            console.log('Rows:', data.length);
        }

        function plotYMeasureXNone()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_cell_type', 'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getBoxPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'No X-Axis Measure'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return '';
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXDemCat()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getDemVisMeasure('Demographics', 'race');

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_cell_type', 'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getBoxPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Categorical X-Axis Measure from Demographic'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'Demographics Race'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.value : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXDemNum()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getVisMeasure('Demographics', 'age_enrollment', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_cell_type', 'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Numeric X-Axis Measure from Demographic'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'Demographics Age Enrollment'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXSameAssayCat()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getVisMeasure('ICS', 'protein_panel', false);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_cell_type', 'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getBoxPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Categorical X-Axis Measure from Same Assay'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'ICS Protein Panel'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.value : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXSameAssayNum()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getVisMeasure('ICS', 'pctpos_neg', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_cell_type', 'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Numeric X-Axis Measure from Same Assay'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'ICS Magnitude Negative (CD4+, Protein Panel)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXSameDiffFilter()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getVisMeasure('ICS', 'pctpos', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+','CD8+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure},
                    { measure: getDemVisMeasure('Demographics', 'race')}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure), {'study_ICS_cell_type': 'CD8+'});
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure), {'study_ICS_cell_type': 'CD4+'});

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_ICS_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_ICS_SequenceNum',
                        'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Same X-Axis Measure with Different Filter'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'ICS Magnitude (CD8+, Protein Panel)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXSameDiffFilter2()
        {
            $('#plot').html('');

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'Container', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'SubjectId', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, 'x', 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD8+'], 'x')},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'], 'x')},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'], 'x')},
                    { measure: getVisMeasure('ICS', 'protein_panel', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'protein', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'specimen_type', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'lab_code', false, undefined, 'x')},
                    { measure: getVisMeasure('ICS', 'pctpos', true, undefined, 'x')},

                    { measure: getVisMeasure('ICS', 'Container', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'SubjectId', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, 'y', 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'], 'y')},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'], 'y')},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'], 'y')},
                    { measure: getVisMeasure('ICS', 'protein_panel', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'protein', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'specimen_type', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'lab_code', false, undefined, 'y')},
                    { measure: getVisMeasure('ICS', 'pctpos', true, undefined, 'y')},

                    { measure: getDemVisMeasure('Demographics', 'race')}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {
                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, 'study_ICS_pctpos', {'http://cpas.labkey.com/Study#Dataset': 'x'});
                    axisMeasureStore.setYMeasure(measureStore, 'study_ICS_pctpos', {'http://cpas.labkey.com/Study#Dataset': 'y'});
                    axisMeasureStore.setZMeasure(measureStore, 'study_Demographics_race');

                    var data = axisMeasureStore.select([
                        QueryUtils.SUBJECT_ALIAS, QueryUtils.SEQUENCENUM_ALIAS,
                        'study_ICS_functional_marker_name', 'study_ICS_summary_level',
                        'study_ICS_protein_panel', 'study_ICS_protein', 'study_ICS_specimen_type',
                        'study_ICS_lab_code', 'study_Demographics_race'
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Same X-Axis Measure with Different Filter (axisName)'},
                        y: {value: 'ICS Magnitude (CD4+, Protein Panel)'},
                        x: {value: 'ICS Magnitude (CD8+, Protein Panel)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        },
                        color: function(row) {
                            if (!row.z.value)
                                return row['study_Demographics_race'];
                            return row.z.value;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXDiffAssay()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ICS', 'pctpos', true);
            var xMeasure = getVisMeasure('NAb', 'titer_ic50', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: yMeasure},
                    { measure: getVisMeasure('NAb', 'SubjectId')},
                    { measure: getVisMeasure('NAb', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('NAb', 'target_cell', false, ['A3R5'])},
                    { measure: getVisMeasure('NAb', 'summary_level', false, ['Virus'])},
                    { measure: getVisMeasure('NAb', 'neutralization_tier')},
                    { measure: getVisMeasure('NAb', 'clade')},
                    { measure: getVisMeasure('NAb', 'antigen')},
                    { measure: getVisMeasure('NAb', 'specimen_type')},
                    { measure: getVisMeasure('NAb', 'lab_code')},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.CONTAINER_ALIAS, QueryUtils.SUBJECT_ALIAS, QueryUtils.SEQUENCENUM_ALIAS
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Numeric X-Axis Measure from Different Assay (1)'},
                        y: {value: 'ICS Magnitude Median Value (CD4+, Protein Panel)'},
                        x: {value: 'NAb IC50 Titer Median Value (A3R5, Virus)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXDiffAssay2()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('ELISPOT', 'mean_sfc', true);
            var xMeasure = getVisMeasure('ICS', 'pctpos', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('ELISPOT', 'SubjectId')},
                    { measure: getVisMeasure('ELISPOT', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ELISPOT', 'functional_marker_name', false, ['IFNg+'])},
                    { measure: getVisMeasure('ELISPOT', 'summary_level', false, ['Peptide Pool'])},
                    { measure: getVisMeasure('ELISPOT', 'protein_panel')},
                    { measure: getVisMeasure('ELISPOT', 'protein')},
                    { measure: getVisMeasure('ELISPOT', 'specimen_type')},
                    { measure: getVisMeasure('ELISPOT', 'lab_code')},
                    { measure: yMeasure},
                    { measure: getVisMeasure('ICS', 'SubjectId')},
                    { measure: getVisMeasure('ICS', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('ICS', 'cell_type', false, ['CD4+', 'CD8+'])},
                    { measure: getVisMeasure('ICS', 'functional_marker_name', false, ['IL2/ifngamma'])},
                    { measure: getVisMeasure('ICS', 'summary_level', false, ['Protein Panel'])},
                    { measure: getVisMeasure('ICS', 'protein_panel')},
                    { measure: getVisMeasure('ICS', 'protein')},
                    { measure: getVisMeasure('ICS', 'specimen_type')},
                    { measure: getVisMeasure('ICS', 'lab_code')},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.CONTAINER_ALIAS, QueryUtils.SUBJECT_ALIAS, QueryUtils.SEQUENCENUM_ALIAS
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Numeric X-Axis Measure from Different Assay (2)'},
                        y: {value: 'ELISPOT Magnitude Median Value (IFNg+, Peptide Pool)'}, //
                        x: {value: 'ICS Magnitude Median Value (CD4+ and CD8+, Protein Panel)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXDiffAssay3()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('NAb', 'titer_ic50', true);
            var xMeasure = getVisMeasure('BAMA', 'mfi_delta', true);

            var config = {
                measures: [
                    { measure: getVisMeasure('NAb', 'SubjectId')},
                    { measure: getVisMeasure('NAb', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('NAb', 'target_cell', false, ['TZM-bl'])},
                    { measure: getVisMeasure('NAb', 'summary_level', false, ['Virus'])},
                    { measure: getVisMeasure('NAb', 'neutralization_tier')},
                    { measure: getVisMeasure('NAb', 'clade')},
                    { measure: getVisMeasure('NAb', 'antigen')},
                    { measure: getVisMeasure('NAb', 'specimen_type')},
                    { measure: getVisMeasure('NAb', 'lab_code')},
                    { measure: yMeasure},
                    { measure: getVisMeasure('BAMA', 'SubjectId')},
                    { measure: getVisMeasure('BAMA', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('BAMA', 'summary_level', false, ['Antigen'])},
                    { measure: getVisMeasure('BAMA', 'antigen')},
                    { measure: getVisMeasure('BAMA', 'dilution', false, [50])},
                    { measure: getVisMeasure('BAMA', 'detection_ligand')},
                    { measure: getVisMeasure('BAMA', 'instrument_code')},
                    { measure: getVisMeasure('BAMA', 'specimen_type')},
                    { measure: getVisMeasure('BAMA', 'lab_code')},
                    { measure: xMeasure}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {

                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();
                    axisMeasureStore.setXMeasure(measureStore, measureToAlias(xMeasure));
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.CONTAINER_ALIAS, QueryUtils.SUBJECT_ALIAS, QueryUtils.SEQUENCENUM_ALIAS
                    ]);

                    var config = getScatterPlotBaseConfig(data);
                    config.labels = {
                        main: {value: 'Numeric X-Axis Measure from Different Assay (3)'},
                        y: {value: 'NAb IC50 Titer Median Value (TZM-bl, Virus)'},
                        x: {value: 'BAMA MFI Delta Median Value (50, Antigen)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.getMedian() : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXWeeksUnaligned()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('NAb', 'titer_ic50', true);
            var xMeasure = getTimeMeasure();

            var config = {
                measures: [
                    { measure: getVisMeasure('NAb', 'SubjectId')},
                    { measure: getVisMeasure('NAb', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('NAb', 'target_cell', false, ['A3R5'])},
                    { measure: getVisMeasure('NAb', 'summary_level', false, ['Virus'])},
                    { measure: getVisMeasure('NAb', 'neutralization_tier')},
                    { measure: getVisMeasure('NAb', 'clade')},
                    { measure: getVisMeasure('NAb', 'antigen')},
                    { measure: getVisMeasure('NAb', 'specimen_type')},
                    { measure: getVisMeasure('NAb', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure, dateOptions: {interval: 'Weeks', zeroDayVisitTag: null}}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {
                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();

                    axisMeasureStore.setXMeasure(measureStore, 'Weeks');
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_NAb_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_NAb_SequenceNum',
                        'study_NAb_target_cell', 'study_NAb_summary_level', 'study_NAb_neutralization_tier',
                        'study_NAb_clade', 'study_NAb_antigen', 'study_NAb_specimen_type', 'study_NAb_lab_code'
                    ]);

                    var config = getScatterPlotBaseConfig(data);

                    config.labels = {
                        main: {value: 'Time Point X-Axis Meaure (Unaligned)'},
                        y: {value: 'NAb IC50 Titer Median Value (A3R5, Virus)'},
                        x: {value: 'Time Points Weeks (Aligned by Day 0)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.value : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function plotYMeasureXMonthsAligned()
        {
            $('#plot').html('');
            var yMeasure = getVisMeasure('NAb', 'titer_ic50', true);
            var xMeasure = getTimeMeasure();

            var config = {
                measures: [
                    { measure: getVisMeasure('NAb', 'SubjectId')},
                    { measure: getVisMeasure('NAb', 'SequenceNum', false, undefined, undefined, 'DOUBLE')},
                    { measure: getVisMeasure('NAb', 'target_cell', false, ['A3R5'])},
                    { measure: getVisMeasure('NAb', 'summary_level', false, ['Virus'])},
                    { measure: getVisMeasure('NAb', 'neutralization_tier')},
                    { measure: getVisMeasure('NAb', 'clade')},
                    { measure: getVisMeasure('NAb', 'antigen')},
                    { measure: getVisMeasure('NAb', 'specimen_type')},
                    { measure: getVisMeasure('NAb', 'lab_code')},
                    { measure: yMeasure},
                    { measure: xMeasure, dateOptions: {interval: 'Months', zeroDayVisitTag: 'Last Vaccination', altQueryName: 'cds.VisitTagAlignment'}}
                ],
                endpoint: ENDPOINT,
                success: function(measureStore) {
                    var axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create();

                    axisMeasureStore.setXMeasure(measureStore, 'Months');
                    axisMeasureStore.setYMeasure(measureStore, measureToAlias(yMeasure));

                    var data = axisMeasureStore.select([
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SUBJECT_ALIAS : 'study_NAb_SubjectId',
                        QueryUtils.USE_NEW_GETDATA ? QueryUtils.SEQUENCENUM_ALIAS : 'study_NAb_SequenceNum',
                        'study_NAb_target_cell', 'study_NAb_summary_level', 'study_NAb_neutralization_tier',
                        'study_NAb_clade', 'study_NAb_antigen', 'study_NAb_specimen_type', 'study_NAb_lab_code'
                    ]);

                    var config = getScatterPlotBaseConfig(data);

                    config.labels = {
                        main: {value: 'Time Point X-Axis Meaure (Aligned)'},
                        y: {value: 'NAb IC50 Titer Median Value (A3R5, Virus)'},
                        x: {value: 'Time Points Months (Last Vaccination)'}
                    };
                    config.aes = {
                        y: function(row) {
                            return row.y ? row.y.getMedian() : null;
                        },
                        x: function(row) {
                            return row.x ? row.x.value : null;
                        }
                    };

                    var plot = new LABKEY.vis.Plot(config);
                    plot.render();

                    logStoreData(measureStore, data);
                },
                failure: onError
            };

            LABKEY.Query.experimental.MeasureStore.getData(config, QueryUtils.getData, QueryUtils);
        }

        function scatterMeasureSameSource()
        {
            $('#plot').html('');

            var subjectMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'SubjectId',
                isDimension: true
            });

            var visitMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'visit_day',
                isDimension: true
            });

            var proteinENVMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'protein',
                values: ["ENV"],
                isDimension: true
            });

            var proteinGAGMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'protein',
                values: ["GAG"],
                isDimension: true
            });

            var antigenMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'antigen',
                isDimension: true
            });

            var mifDeltaMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Binding Ab multiplex assay',
                name: 'mfi_delta',
                isMeasure: true
            });

            LABKEY.Query.experimental.MeasureStore.getData({
                measures: [
                    { measure: subjectMeasure },
                    { measure: visitMeasure },
                    { measure: proteinENVMeasure },
                    { measure: antigenMeasure },
                    { measure: mifDeltaMeasure }
                ],
                endpoint: ENDPOINT,
                success: onSuccessENV,
                failure: onError
            });

            LABKEY.Query.experimental.MeasureStore.getData({
                measures : [
                    { measure: subjectMeasure },
                    { measure: visitMeasure },
                    { measure: proteinGAGMeasure },
                    { measure: antigenMeasure },
                    { measure: mifDeltaMeasure }
                ],
                endpoint: ENDPOINT,
                success: onSuccessGAG,
                failure: onError
            });

            var measureStoreENV = null;
            var measureStoreGAG = null;

            function onSuccessENV(measureStore)
            {
                measureStoreENV = measureStore;
                if (measureStoreENV && measureStoreGAG)
                    plotENVGAG(measureStoreENV, measureStoreGAG);
            }

            function onSuccessGAG(measureStore)
            {
                measureStoreGAG = measureStore;
                if (measureStoreENV && measureStoreGAG)
                    plotENVGAG(measureStoreENV, measureStoreGAG);
            }

            function plotENVGAG(storeENV, storeGAG)
            {
                var subjectColAlias = measureToAlias(subjectMeasure);
                var visitColAlias = measureToAlias(visitMeasure);
                var mfiColAlias = measureToAlias(mifDeltaMeasure);

                var twoAxis = LABKEY.Query.experimental.AxisMeasureStore.create();
                twoAxis.setXMeasure(storeENV, mfiColAlias);
                twoAxis.setYMeasure(storeGAG, mfiColAlias);

                var xy = twoAxis.select([subjectColAlias, visitColAlias]);

                var xFn = function(row) {
                    return row.x ? row.x.getMedian() : null;
                };
                var yFn = function(row) {
                    return row.y ? row.y.getMedian() : null;
                };

                var scatterLayer2 = new LABKEY.vis.Layer({
                    geom: new LABKEY.vis.Geom.Point({
                        color: 'teal',
                        opacity: 0.5,
                        size: 3
                    })
                });

                var scatter = new LABKEY.vis.Plot({
                    renderTo: 'plot',
                    rendererType: 'd3',
                    width: 950,
                    height: 500,
                    labels: {
                        main: {value: 'BAMA MFI Delta'},
                        yLeft: {value: 'GAG'},
                        x: {value: 'ENV'}
                    },
                    data: xy,
                    layers: [scatterLayer2],
                    aes: {
                        yLeft: yFn,
                        x: xFn,
                        hoverText: function(row) {
                            return row[subjectColAlias]
                                    + '\n' + row[visitColAlias]
                                    + '\n' + row.x.getMedian()
                                    + '\n' + row.y.getMedian();
                        },
                        pointClickFn: function(event, data) {
                            console.log(data);
                        }
                    },
                    scales: {
                        x: {
                            scaleType: 'continuous'
                        },
                        yLeft: {
                            scaleType: 'continuous',
                            trans: 'linear'
                        }
                    }
                });

                scatter.render();

                logStoreData(twoAxis, xy);
            }
        }

        function categoricalSingleSource()
        {
            $('#plot').html('');

            var subjectMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Demographics',
                name: 'SubjectId',
                isDimension: true
            });

            var raceMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Demographics',
                name: 'race',
                isDimension: true
            });

            var ageMeasure = new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'Demographics',
                name: 'age_enrollment',
                isMeasure: true
            });

            LABKEY.Query.experimental.MeasureStore.getData({
                measures: [
                    { measure: subjectMeasure },
                    { measure: raceMeasure },
                    { measure: ageMeasure }
                ],
                endpoint: ENDPOINT,
                success: onData,
                failure: onError
            });

            function onData(measureStore) {

                var xMeasureAlias = measureToAlias(raceMeasure);
                var yMeasureAlias = measureToAlias(ageMeasure);

                var boxLayer = new LABKEY.vis.Layer({
                    geom: new LABKEY.vis.Geom.DataspaceBoxPlot(),
                    aes: {
                        hoverText: function(x, stats) {
                            return x + ':\nMin: ' + stats.min + '\nMax: ' + stats.max + '\nQ1: ' + stats.Q1 + '\nQ2: ' + stats.Q2 + '\nQ3: ' + stats.Q3;
                        }
                    }
                });

                var data = measureStore.select([xMeasureAlias, yMeasureAlias]);

                var boxPlot = new LABKEY.vis.Plot({
                    renderTo: 'plot',
                    rendererType: 'd3',
                    clipRect: true,
                    width: 950,
                    height: 500,
                    labels: {
                        main: {value: 'Categorical, Single-Axis'},
                        yLeft: {value: 'Age'},
                        x: {value: 'Race'}
                    },
                    data: data,
                    layers: [boxLayer],
                    aes: {
                        yLeft: function(row) {
                            return row[yMeasureAlias].getMedian();
                        },
                        x: function(row) {
                            return row[xMeasureAlias].getValue();
                        }
                    },
                    scales: {
                        x: {
                            scaleType: 'discrete'
                        },
                        yLeft: {
                            scaleType: 'continuous',
                            trans: 'linear'
                        }
                    },
                    margins: {
                        bottom: 75
                    }
                });
                boxPlot.render();

                logStoreData(measureStore, data);
            }
        }

        function onError(errorInfo)
        {
            alert(errorInfo.exception);
        }

        function getScatterPlotBaseConfig(data)
        {
            return {
                renderTo: 'plot',
                rendererType: 'd3',
                clipRect: true,
                width: 950,
                height: 500,
                data: data,
                layers: [
                    new LABKEY.vis.Layer({
                        geom: new LABKEY.vis.Geom.Point({
                            size: 3,
                            plotNullPoints: true,
                            opacity: 0.5
                        })
                    })
                ],
                scales: {
                    x: {
                        scaleType: 'continuous',
                        trans: 'linear'
                    },
                    y: {
                        scaleType: 'continuous',
                        trans: 'linear'
                    }
                }
            };
        }

        function getBoxPlotBaseConfig(data)
        {
            return {
                renderTo: 'plot',
                rendererType: 'd3',
                clipRect: true,
                width: 950,
                height: 500,
                data: data,
                layers: [
                    new LABKEY.vis.Layer({
                        geom: new LABKEY.vis.Geom.DataspaceBoxPlot({
                            binSize : 3,
                            binRowLimit : 5000
                        }),
                        aes: {
                            hoverText: function(x, stats) {
                                return x + ':\nMin: ' + stats.min + '\nMax: ' + stats.max + '\nQ1: ' + stats.Q1 + '\nQ2: ' + stats.Q2 + '\nQ3: ' + stats.Q3;
                            }
                        }
                    })
                ],
                scales: {
                    x: {
                        scaleType: 'discrete'
                    },
                    y: {
                        scaleType: 'continuous',
                        trans: 'linear'
                    }
                }
            };
        }

        function getVisMeasure(queryName, colName, isMeasure, values, axisName, type)
        {
            return new LABKEY.Query.Visualization.Measure({
                axisName: axisName,
                schemaName:'study',
                queryName: queryName,
                name: colName,
                isMeasure: isMeasure,
                isDimension: !isMeasure,
                type: type ? type : (isMeasure ? 'DOUBLE' : 'VARCHAR'),
                values: values
            });
        }

        function getDemVisMeasure(queryName, colName, axisName, type)
        {
            return new LABKEY.Query.Visualization.Measure({
                axisName: axisName,
                schemaName:'study',
                queryName: queryName,
                name: colName,
                requireLeftJoin: true,
                type: type || 'VARCHAR'
            });
        }

        function getTimeMeasure()
        {
            return new LABKEY.Query.Visualization.Measure({
                schemaName:'study',
                queryName: 'SubjectVisit',
                name: 'Visit/ProtocolDay',
                isMeasure: true,
                allowNullResults: false
            });
        }

        function measureToAlias(measure)
        {
            return [measure.schemaName, measure.queryName, measure.name].join('_');
        }
    });

})(jQuery);
