(function($) {

    // Document Ready
    $(function() {

        scatterMeasureSameSource();
        categoricalSingleSource();

        function scatterMeasureSameSource()
        {
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
                    { measure: subjectMeasure, time:'date' },
                    { measure: visitMeasure, time:'date' },
                    { measure: proteinENVMeasure, time:'date' },
                    { measure: antigenMeasure, time:'date' },
                    { measure: mifDeltaMeasure, time:'date' }
                ],
                endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
                containerPath: LABKEY.container.path,
                success: onSuccessENV,
                failure: onError
            });

            LABKEY.Query.experimental.MeasureStore.getData({
                measures : [
                    { measure: subjectMeasure, time:'date' },
                    { measure: visitMeasure, time:'date' },
                    { measure: proteinGAGMeasure, time:'date' },
                    { measure: antigenMeasure, time:'date' },
                    { measure: mifDeltaMeasure, time:'date' }
                ],
                endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
                containerPath: LABKEY.container.path,
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

                var xFn = function(row){
                    return row.x ? row.x.getMean() : null;
                };
                var yFn = function(row){
                    return row.y ? row.y.getMean() : null;
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
                        hoverText: function(row) {
                            return row[subjectColAlias]
                                    + '\n' + row[visitColAlias]
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
        }

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
                    geom: new LABKEY.vis.Geom.DataspaceBoxPlot(),
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

        function onError(errorInfo)
        {
            alert(errorInfo.exception);
        }

        function measureToAlias(measure)
        {
            return [measure.schemaName, measure.queryName, measure.name].join('_');
        }
    });

})(jQuery);
