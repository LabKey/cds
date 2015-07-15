(function($) {

    // Document Ready
    $(function() {

        var participantColumnName = 'ptid';
        var visitColumnName = 'visit';
        var antigenColumnName = 'antigen';
        var populationColumnName = 'population';
        var countColumnName = 'count';

        var measureStoreENV = null;
        var measureStoreGAG = null;

        var measureStoreFlow1 = null;
        var measureStoreFlow2 = null;

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
            var pCol = 'study_Binding Ab multiplex assay_SubjectId';
            var vCol = 'study_Binding Ab multiplex assay_visit_day';
            var analyteCol = 'study_Binding Ab multiplex assay_protein';
            var antigenCol = 'study_Binding Ab multiplex assay_antigen';
            var magCol = 'study_Binding Ab multiplex assay_mfi_delta';

            var twoAxis = LABKEY.Query.experimental.AxisMeasureStore.create();
            twoAxis.setXMeasure(storeENV, magCol);
            twoAxis.setYMeasure(storeGAG, magCol);

            var xy = twoAxis.select([pCol,vCol]);
            //var xy = twoAxis.select([pCol, vCol, antigenCol]);

            var xFn = function(row){
                return row.x ? row.x.getMean() : null;
            };
            var yFn = function(row){
                return row.y ? row.y.getMean() : null;
            };
            var colorFn = function(row) {
                return row[antigenCol];
            };

            var scatterLayer2 = new LABKEY.vis.Layer({
                geom: new LABKEY.vis.Geom.Point({
                    color: 'teal',
                    opacity: 0.5,
                    size: 3
                })
            });

            var scatter = new LABKEY.vis.Plot({
                renderTo: 'plotENVGAG',
                rendererType: 'd3',
                width: 900,
                height: 600,
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
                    //color: colorFn,
                    hoverText: function(row) {
                        return row[pCol]
                                + '\n' + row[vCol]
                                + '\n' + row.x.getMean()
                                + '\n' + row.y.getMean();
                    },
                    pointClickFn: function(event, data){
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
        }

        function plotFlow(store1, store2)
        {
            // ONE AXIS
            var measureStore = store1;

            var icsData = measureStore.select([participantColumnName, visitColumnName, antigenColumnName, populationColumnName]);

            var countFn = function(row){
                return row[countColumnName].getMean();
            };
            var antigenFn = function(row) {
                return row[antigenColumnName].getValue();
            };

            var scatterLayer = new LABKEY.vis.Layer({
                geom: new LABKEY.vis.Geom.Point({
                    position: 'jitter',
                    size: 3
                })
            });

            var discreteScatter1 = new LABKEY.vis.Plot({
                renderTo: 'discreteScatter2',
                rendererType: 'd3',
                width: 900,
                height: 300,
                labels: {
                    main: {value: 'Scatterplot With Jitter'},
                    yLeft: {value: 'Count'},
                    x: {value: antigenColumnName}
                },
                data: icsData,
                layers: [scatterLayer],
                aes: {
                    yLeft: countFn,
                    x: antigenFn,
                    color: antigenFn,
                    hoverText: function(row) {
                        return row[antigenColumnName].getValue()
                                + '\n' + row[populationColumnName].getValue()
                                + '\n' + row[countColumnName].getMean();
                    },
                    pointClickFn: function(event, data){
                        console.log(data);
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
                }
            });

            discreteScatter1.render();

            // TWO AXIS

            var twoAxis = LABKEY.Query.experimental.AxisMeasureStore.create();
            twoAxis.setXMeasure(store1, 'count');
            twoAxis.setYMeasure(store2, 'count');

            var xy = twoAxis.select([participantColumnName, visitColumnName, populationColumnName]);
            console.log(xy);

            var scatterLayer2 = new LABKEY.vis.Layer({
                geom: new LABKEY.vis.Geom.Point({
                    color: 'teal',
                    size: 3
                })
            });

            var discreteScatter2 = new LABKEY.vis.Plot({
                renderTo: 'discreteScatter2',
                rendererType: 'd3',
                width: 900,
                height: 300,
                labels: {
                    main: {value: 'Scatterplot'},
                    yLeft: {value: 'A2'},
                    x: {value: 'A1'}
                },
                data: xy,
                layers: [scatterLayer2],
                aes: {
                    yLeft: function(row) {
                        return row.y.getMean();
                    },
                    x: function(row) {
                        return row.x.getMean();
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

            discreteScatter1.render();
            discreteScatter2.render();
        }

        function onError(errorInfo)
        {
            alert(errorInfo.exception);
        }

        //function onSuccessFlow1(measureStore)
        //{
        //    measureStoreFlow1 = measureStore;
        //    if (measureStoreFlow1 && measureStoreFlow2)
        //        plotFlow(measureStoreFlow1, measureStoreFlow2);
        //}
        //
        //function onSuccessFlow2(measureStore)
        //{
        //    measureStoreFlow2 = measureStore;
        //    if (measureStoreFlow1 && measureStoreFlow2)
        //        plotFlow(measureStoreFlow1, measureStoreFlow2);
        //}

        //LABKEY.Query.experimental.MeasureStore.executeSql({
        //    measures: [countColumnName],
        //    containerPath: '/Shared/_junit/',
        //    schemaName: 'vis_junit',
        //    sql: "SELECT * FROM vis_junit.flow WHERE Antigen='A1'",
        //    success: onSuccessFlow1,
        //    failure: onError
        //});
        //
        //LABKEY.Query.experimental.MeasureStore.executeSql({
        //    measures: [countColumnName],
        //    containerPath: '/Shared/_junit/',
        //    schemaName: 'vis_junit',
        //    sql: "SELECT * FROM vis_junit.flow WHERE Antigen='A2'",
        //    success: onSuccessFlow2,
        //    failure: onError
        //});

        LABKEY.Query.experimental.MeasureStore.getData({
            measures: [
                {
                    measure: { schemaName:'study', queryName: 'Binding Ab multiplex assay', name: "SubjectId", isDimension:true},
                    time:'date'
                },
                {
                    measure: { schemaName:'study', queryName: 'Binding Ab multiplex assay', name: "visit_day", isDimension:true},
                    time:'date'
                },
                {
                    measure: { schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'protein', values: ["ENV"], isDimension:true},
                    time:'date'
                },
                {
                    measure: { schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'antigen', isDimension:true},
                    time:'date'
                },
                {
                    measure: { schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'mfi_delta', isMeasure:true},
                    time:'date'
                }
            ],
            endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
            containerPath: LABKEY.container.path,
            success: onSuccessENV,
            failure: onError
        });

        LABKEY.Query.experimental.MeasureStore.getData({
            measures : [
                {
                    measure:{ schemaName:'study', queryName: 'Binding Ab multiplex assay', name: "SubjectId", isDimension:true},
                    time:'date'
                },
                {
                    measure:{ schemaName:'study', queryName: 'Binding Ab multiplex assay', name: "visit_day", isDimension:true},
                    time:'date'
                },
                {
                    measure:{ schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'protein', values: ["GAG"], isDimension:true},
                    time:'date'
                },
                {
                    measure:{ schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'antigen', isDimension:true},
                    time:'date'
                },
                {
                    measure:{ schemaName:'study', queryName: 'Binding Ab multiplex assay', name: 'mfi_delta', isMeasure:true},
                    time:'date'
                }
            ],
            endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
            containerPath: LABKEY.container.path,
            success: onSuccessGAG,
            failure: onError
        });

        function categoricalSingleSource()
        {
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
                    {
                        measure: subjectMeasure,
                        time: 'date'
                    },
                    {
                        measure: raceMeasure,
                        time: 'date'
                    },
                    {
                        measure: ageMeasure,
                        time:'date'
                    }
                ],
                endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
                containerPath: LABKEY.container.path,
                success: onData,
                failure: onError
            });

            function onData(measureStore) {

                var xMeasureAlias = measureToAlias(raceMeasure);
                var yMeasureAlias = measureToAlias(ageMeasure);

                var boxLayer = new LABKEY.vis.Layer({
                    geom: new LABKEY.vis.Geom.Boxplot({
                        position: 'jitter',
                        outlierOpacity: '1',
                        outlierFill: 'red',
                        showOutliers: true
                    }),
                    aes: {
                        hoverText: function(x, stats) {
                            return x + ':\nMin: ' + stats.min + '\nMax: ' + stats.max + '\nQ1: ' + stats.Q1 + '\nQ2: ' + stats.Q2 + '\nQ3: ' + stats.Q3;
                        }
                    }
                });

                var boxPlot = new LABKEY.vis.Plot({
                    renderTo: 'categoricalSingleSource',
                    rendererType: 'd3',
                    clipRect: true,
                    width: 900,
                    height: 300,
                    labels: {
                        main: {value: 'Categorical, Single-Axis'},
                        yLeft: {value: 'Age'},
                        x: {value: 'Race'}
                    },
                    data: measureStore.select([xMeasureAlias, yMeasureAlias]),
                    layers: [boxLayer],
                    aes: {
                        yLeft: function(row) {
                            return row[yMeasureAlias].getMean();
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
            }
        }
        categoricalSingleSource();

        function measureToAlias(measure)
        {
            return [measure.schemaName, measure.queryName, measure.name].join('_');
        }
    });

})(jQuery);
