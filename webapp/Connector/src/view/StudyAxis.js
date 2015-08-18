/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Connector.view.StudyAxis = function() {
    var canvas = null, width, height, perStudyHeight = 20, studyData, ALIGNMENT_DAY = 0, renderTo, xScale, yScale = d3.scale.ordinal(),
            tagMouseover, tagMouseout, tagMouseoverScope, tagMouseoutScope, leftIndent = 25, collapsed = true;

    var renderAlignment = function(selection) {
        var alignmentPath, x = xScale(ALIGNMENT_DAY);

        alignmentPath = selection.selectAll('line.alignment').data(function(d) {return [d];});
        alignmentPath.exit().remove();
        alignmentPath.enter().append('line').attr('class', 'alignment');
        alignmentPath.attr('stroke', ChartUtils.colors.BOXSHADOW)
                .attr('stroke-width', 2)
                .attr('x1', x).attr('x2', x)
                .attr('y1', function(d) { return yScale(d.label); })
                .attr('y2', function(d) { return yScale(d.label) + perStudyHeight; });
    };

    var renderVisitTags = function(selection) {
        var visitTags, defaultImgSize = 8;

        visitTags = selection.selectAll('image.visit-tag').data(function (d) { return d.visits; });
        visitTags.exit().remove();
        visitTags.enter().append("image").attr('class', 'visit-tag')
            .attr('xlink:href', function(d) { return LABKEY.contextPath + '/production/Connector/resources/images/' + d.imgSrc; })
            .attr("x", function(d) { return xScale(d.alignedDay) - (d.imgSize || defaultImgSize)/2; })
            .attr("y", function(d) { return yScale(d.studyLabel) + perStudyHeight/2 - (d.imgSize || defaultImgSize)/2; })
            .attr("width", function(d) { return d.imgSize || defaultImgSize; })
            .attr("height", function(d) { return d.imgSize || defaultImgSize; });

        // add visit tag mouseover/mouseout functions.
        visitTags.on('mouseover', function(d) {
            tagMouseover.call(tagMouseoverScope, d, this);
        });
        visitTags.on('mouseout', function(d) {
            tagMouseout.call(tagMouseoutScope, d, this);
        });
    };

    var renderVerticalTicks = function(selection) {
        var tickEls = selection.selectAll('line.study-axis-tick').data(function(d) {
            var tickData = xScale.ticks(7);
            for (var i = 0; i < tickData.length; i++) {
                tickData[i] = {x: xScale(tickData[i]), y: yScale(d.label)};
            }
            return tickData;
        });
        tickEls.exit().remove();
        tickEls.enter().append('line').attr('class', 'study-axis-tick');
        tickEls.attr('stroke', ChartUtils.colors.GRIDLINE)
                .attr('stroke-width', 1)
                .attr('x1', function(d) { return d.x; })
                .attr('x2', function(d) { return d.x; })
                .attr('y1', function(d) { return d.y; })
                .attr('y2', function(d) { return d.y + perStudyHeight; });
    };

    var renderBackground = function(selection) {
        var bkgds, count = -1;

        bkgds = selection.selectAll('rect.study-bkgd').data(function(d) { return [d];});
        bkgds.exit().remove();
        bkgds.enter().append('rect').attr('class', 'study-bkgd');
        bkgds.attr('y', function(d) { return yScale(d.label); })
            .attr('x', 25 + leftIndent)
            .attr('width', width)
            .attr('height', perStudyHeight)
            .attr('fill', function(d) {
                count++;
                return count % 2 == 0 ? ChartUtils.colors.GRIDBKGD : ChartUtils.colors.WHITE;
            });
    };

    var renderStudyLabels = function(selection) {
        var labels = selection.selectAll('text.study-label').data(function(d) {return [d];});
        labels.exit().remove();
        labels.enter().append('text').attr('class', 'study-label');
        labels.text(function(d) {
            if (d.label.length > 25) {
                return d.label.slice(0, 23) + '...';
            }

            return d.label;
        });
        labels.attr('y', function(d) {return yScale(d.label) + perStudyHeight/2 + 4;})
            .attr('x', 35 + leftIndent)
            .attr('fill', ChartUtils.colors.PRIMARYTEXT)
            .style('font', '11px Arial, serif');
    };

    var renderExpandCollapseButton = function(canvas) {
        var button, iconHref;

        canvas.append('g').append("image")
                .attr('xlink:href', function(d) { return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_expand_normal.svg'; })
                .attr('class', 'img-expand')
                .attr('x', 20)
                .attr('width', 22)
                .attr('height', 22);

        button = canvas.select('image.img-expand');

        button.on('mouseover', function(d) {
            if (collapsed) {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_expand_hover.svg';
                })
            }
            else {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_collapse_hover.svg';
                })
            }
        });

        button.on('mouseout', function(d) {
            if (collapsed) {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_expand_normal.svg';
                })
            }
            else {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_collapse_normal.svg';
                })
            }
        });

        button.on('mousedown', function(d) {
            if (collapsed) {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_expand_normal.svg';
                })
            }
            else {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_collapse_normal.svg';
                })
            }
        });

        button.on('mouseup', function(d) {
            if (collapsed) {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_collapse_hover.svg';
                });
                collapsed = false;
            }
            else {
                button.attr('xlink:href', function (d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/icon_general_expand_hover.svg';
                });
                collapsed = true;
            }
        });

    };

    var studyAxis = function() {
        var yDomain = [], studies;

        height = studyData.length * perStudyHeight;

        for (var i = 0; i < studyData.length; i++) {
            yDomain.push(studyData[i].label);
        }

        yScale.rangeBands([0, height]);
        yScale.domain(yDomain);

        document.getElementById(renderTo).innerHTML = '';
        canvas = d3.select('#' + renderTo).append('svg');
        canvas.attr('width', width).attr('height', height);
        renderExpandCollapseButton(canvas);

        studies = canvas.selectAll('g.study').data(studyData);
        studies.exit().remove();
        studies.enter().append('g').attr('class', 'study');
        studies.call(renderBackground);
        studies.call(renderVerticalTicks);
        studies.call(renderAlignment);
        studies.call(renderStudyLabels);
        studies.call(renderVisitTags);
    };

    studyAxis.renderTo = function(id) { renderTo = id; return studyAxis; };
    studyAxis.width = function(w) { width = w; return studyAxis; };
    studyAxis.studyData = function(d) { studyData = d; return studyAxis; };
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