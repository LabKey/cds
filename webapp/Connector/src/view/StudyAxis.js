Connector.view.StudyAxis = function(){
    var width, height, studyData, alignmentDay, renderTo, xScale, yScale = d3.scale.ordinal(), mouseover, mouseout,
            canvas = null, mouseoverScope, mouseoutScope;

    var renderAlignment = function(selection) {
        var alignmentPath, x, pathStr;
        x = xScale(alignmentDay);
        pathStr = 'M ' + x + ' 0 L ' + x + ' ' + height + 'Z';
        alignmentPath = selection.selectAll('path.alignment-line').data([alignmentDay]);
        alignmentPath.enter().append('path').attr('class', 'alignment-line');
        alignmentPath.attr('stroke', '#000')
                .attr('stroke', '#cccccc')
                .attr('stroke-width', 2)
                .attr('d', pathStr);
    };

    var renderVisits = function(selection){
        var visits, widthFn, heightFn, xFn, yFn, transformFn, opacityFn;

        xFn = function(d) { return xScale(d.sequenceNumMin); };
        yFn = function(d) { return yScale(d.studyLabel) - 8; };
        widthFn = function(d) {
            if (d.sequenceNumMax == d.sequenceNumMin) {
                return 8.5;
            }
            return xScale(d.sequenceNumMax) - xScale(d.sequenceNumMin);
        };
        heightFn = function(d) {
            if (d.sequenceNumMax == d.sequenceNumMin) {
                return 8.5;
            }
            return 10;
        };
        transformFn = function(d) {
            if (d.sequenceNumMax == d.sequenceNumMin) {
                return 'rotate(45,' + xFn(d) + ',' + yFn(d) +  ')';
            }
            return '';
        };
        opacityFn = function(d) {
            if (d.sequenceNumMax == d.sequenceNumMin) {
                return 1;
            }
            return 0.30;
        };

        visits = selection.selectAll('rect.visit').data(function(d){
            var visits = d.visits;
            for (var i = 0; i < d.visits.length; i++) {
                d.visits[i].studyLabel = d.label;
            }
            return visits;
        });

        visits.exit().remove();
        visits.enter().append('rect').attr('class', 'visit');
        visits.attr('width', widthFn).attr('height', heightFn)
                .attr('x', xFn).attr('y', yFn)
                .attr('fill', '#f5a73a') // $info-color
                .attr('transform', transformFn)
                .attr('fill-opacity', opacityFn);

        visits.on('mouseover', function(d){
            mouseover.call(mouseoverScope, d, this);
        });
        visits.on('mouseout', function(d){
            mouseout.call(mouseoutScope, d, this);
        });
    };

    var renderHorizontalSeparators = function(selection){
        var lines, pathFn;

        pathFn = function(d){
            var y = Math.floor(yScale(d.label) + 7) + 0.5;
            return 'M 25 ' + y + ' L ' + (width - 25) + ' ' + y + ' Z';
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
        labels.attr('y', function(d){return yScale(d.label);})
                .attr('x', 25)
                .attr('fill', '#666363')
                .style('font', '12pt Georgia, serif');
    };

    var studyAxis = function(){
        var yDomain = [], studies;

        height = studyData.length * 25;

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
    };

    studyAxis.renderTo = function(id) { renderTo = id; return studyAxis; };
    studyAxis.width = function(w) { width = w; return studyAxis; };
    studyAxis.studyData = function(d) { studyData = d; return studyAxis; };
    studyAxis.alignmentDay = function(d) { alignmentDay = d; return studyAxis; };
    studyAxis.mouseover = function(m, s) { mouseover = m; mouseoverScope = s; return studyAxis; };
    studyAxis.mouseout = function(m, s) { mouseout = m; mouseoutScope = s; return studyAxis; };
    studyAxis.scale = function(s) {
        var r;
        xScale = s.copy();
        r = xScale.range();
        xScale.range([r[0] + 150, r[1] + 150]);
        return studyAxis;
    };

    return studyAxis;
};
