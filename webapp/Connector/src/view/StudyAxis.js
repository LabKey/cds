/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Connector.view.StudyAxis = function(){
    var canvas = null, width, height, studyData, ALIGNMENT_DAY = 0, renderTo, xScale, yScale = d3.scale.ordinal(),
            visitMouseover, visitMouseout, visitMouseoverScope, visitMouseoutScope, tagMouseover, tagMouseout,
            tagMouseoverScope, tagMouseoutScope;

    var renderAlignment = function(selection) {
        var alignmentPath, x, pathStr;
        x = xScale(ALIGNMENT_DAY);
        pathStr = 'M ' + x + ' 0 L ' + x + ' ' + height + 'Z';
        alignmentPath = selection.selectAll('path.alignment-line').data([ALIGNMENT_DAY]);
        alignmentPath.enter().append('path').attr('class', 'alignment-line');
        alignmentPath.attr('stroke', '#000')
                .attr('stroke', '#cccccc')
                .attr('stroke-width', 2)
                .attr('d', pathStr);
    };

    var renderVisits = function(selection){
        var visits, xFn, yFn, widthFn;

        xFn = function(d) {
            if (d.timepointType === 'VISIT' || d.sequenceNumMax == d.sequenceNumMin) {
                return xScale(d.protocolDay) - 5;
            }

            return xScale(d.sequenceNumMin)
        };
        yFn = function(d) { return yScale(d.studyLabel) - 9; };
        widthFn = function(d) {
            if (d.timepointType === 'VISIT' || d.sequenceNumMax == d.sequenceNumMin) {
                return 10;
            }
            return xScale(d.sequenceNumMax) - xScale(d.sequenceNumMin);
        };

        visits = selection.selectAll('rect.visit').data(function(d){
            var visits = d.visits;
            for (var i = 0; i < d.visits.length; i++) {
                d.visits[i].studyLabel = d.label;
                d.visits[i].timepointType = d.timepointType;
            }
            return visits;
        });

        visits.exit().remove();
        visits.enter().append('rect').attr('class', 'visit');
        visits.attr('x', xFn).attr('y', yFn)
                .attr('width', widthFn).attr('height', 18)
                .attr('fill', '#f5a73a') // $info-color
                .attr('fill-opacity', 0.30);

        visits.on('mouseover', function(d){
            visitMouseover.call(visitMouseoverScope, d, this);
        });
        visits.on('mouseout', function(d){
            visitMouseout.call(visitMouseoutScope, d, this);
        });
    };

    var renderVisitTags = function(selection){
        var visitTags, pathFn;

        pathFn = function(d) {
            var x = xScale(d.protocolDay), y = yScale(d.studyLabel), xLeft = x - 4, xRight = x + 4, yTop = y - 6,
                    yBottom = y + 6;

            return 'M ' + x + ' ' + yTop + ' L ' +
                    xRight + ' ' + y + ' L ' +
                    x + ' ' + yBottom + ' L ' +
                    xLeft + ' ' + y + ' Z';
        };

        visitTags = selection.selectAll('path.visit-tag').data(function (d){
            var visits = d.visits, visitsWithTags = [];

            for (var i = 0; i < visits.length; i++) {
                if (visits[i].visitTags.length > 0) {
                    visitsWithTags.push({
                        studyLabel: d.label,
                        protocolDay: visits[i].protocolDay,
                        visitTags: visits[i].visitTags
                    });
                }
            }

            return visitsWithTags;
        });

        visitTags.exit().remove();
        visitTags.enter().append('path').attr('class', 'visit-tag');
        visitTags.attr('d', pathFn).attr('fill', '#f5a73a');

        // TODO: add visit tag mouseover/mouseout functions.
        visitTags.on('mouseover', function(d){
            tagMouseover.call(tagMouseoverScope, d, this);
        });
        visitTags.on('mouseout', function(d){
            tagMouseout.call(tagMouseoutScope, d, this);
        });
    };

    var renderHorizontalSeparators = function(selection){
        var lines, pathFn;

        pathFn = function(d){
            var y = Math.floor(yScale(d.label) + 13) + 0.5;
            return 'M 25 ' + y + ' L ' + width + ' ' + y + ' Z';
        };

        lines = selection.selectAll('path.separator').data(studyData.slice(0,studyData.length-1));
        lines.exit().remove();
        lines.enter().append('path').attr('class', 'separator');
        lines.attr('d', pathFn)
                .attr('stroke', '#b3b3b3')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '5,6');
    };

    var renderVerticalTicks = function(selection) {
        var tickData = xScale.ticks(7), pathFn, tickEls;

        pathFn = function(d) {
            var x = xScale(d);
            return 'M ' + x + ' 0 L ' + x + ' ' + height + ' Z';
        };

        tickEls = selection.selectAll('path.study-axis-tick').data(tickData);
        tickEls.exit().remove();
        tickEls.enter().append('path').attr('class', 'study-axis-tick');
        tickEls.attr('stroke', '#f0f0f0')
                .attr('stroke-width', 1)
                .attr('d', pathFn);
    };

    var renderStudyLabels = function(selection){
        var labels = selection.selectAll('text.study-label').data(function(d){return [d];});
        labels.exit().remove();
        labels.enter().append('text').attr('class', 'study-label');
        labels.text(function(d){
            if (d.label.length > 25) {
                return d.label.slice(0, 23) + '...';
            }

            return d.label;
        });
        labels.attr('y', function(d){return Math.floor(yScale(d.label) + 7) + 0.5;})
                .attr('x', 25)
                .attr('fill', '#666363')
                .style('font', '14pt Georgia, serif');
    };

    var studyAxis = function(){
        var yDomain = [], studies;

        height = studyData.length * 32;

        for (var i = 0; i < studyData.length; i++) {
            yDomain.push(studyData[i].label);
        }

        yScale.rangeBands([0, height], 1);
        yScale.domain(yDomain);

        if (canvas === null) {
            canvas = d3.select('#' + renderTo).append('svg').attr('style', 'background-color: #fff;');
        }
        canvas.attr('width', width).attr('height', height);
        canvas.call(renderVerticalTicks);
        canvas.call(renderAlignment);
        canvas.call(renderHorizontalSeparators);

        studies = canvas.selectAll('g.study').data(studyData);
        studies.enter().append('g').attr('class', 'study');
        studies.exit().remove();
        studies.call(renderStudyLabels);
        studies.call(renderVisits);
        studies.call(renderVisitTags);
    };

    studyAxis.renderTo = function(id) { renderTo = id; return studyAxis; };
    studyAxis.width = function(w) { width = w; return studyAxis; };
    studyAxis.studyData = function(d) { studyData = d; return studyAxis; };
    studyAxis.visitMouseover = function(m, s) { visitMouseover = m; visitMouseoverScope = s; return studyAxis; };
    studyAxis.visitMouseout = function(m, s) { visitMouseout = m; visitMouseoutScope = s; return studyAxis; };
    studyAxis.visitTagMouseover = function(m, s) { tagMouseover = m; tagMouseoverScope = s; return studyAxis; };
    studyAxis.visitTagMouseout = function(m, s) { tagMouseout = m; tagMouseoutScope = s; return studyAxis; };
    studyAxis.scale = function(s) {
        var r;
        xScale = s.copy();
        r = xScale.range();
        xScale.range([r[0] + 150, r[1] + 150]);
        return studyAxis;
    };

    return studyAxis;
};