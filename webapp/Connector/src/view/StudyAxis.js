/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Connector.view.StudyAxis = function() {
    var canvas = null, width, height, perStudyHeight = 20, studyData, ALIGNMENT_DAY = 0, renderTo, xScale, yScale = d3.scale.ordinal(),
            tagMouseover, tagMouseout, tagMouseoverScope, tagMouseoutScope, leftIndent = 25, collapsed = true, groupLabelOffset = 45,
            studyLabelOffset = 35;

    // This function returns <study name> for studies and <study name>-<group name> for groups in an attempt to
    // provide a unique name for each value in yScale
    var studyGroupName = function(el) {
        var name = "";
        if(el && el.name &&  Ext.isString(el.name)) {
            if(el.study && Ext.isString(el.study)) {
                name = el.study + "-" + el.name;
            } else {
                name = el.name;
            }
        }
        return name;
    };

    var renderAlignment = function(selection) {
        var alignmentPath, x = xScale(ALIGNMENT_DAY);

        alignmentPath = selection.selectAll('line.alignment').data(function(d) {return [d];});
        alignmentPath.exit().remove();
        alignmentPath.enter().append('line').attr('class', 'alignment');
        alignmentPath.attr('stroke', ChartUtils.colors.BOXSHADOW)
                .attr('stroke-width', 2)
                .attr('x1', x).attr('x2', x)
                .attr('y1', function(d) { return yScale(studyGroupName(d)); })
                .attr('y2', function(d) { return yScale(studyGroupName(d)) + perStudyHeight; });
    };

    var renderPreenrollment = function(selection) {
        var preenrollment, x;

        x = xScale(xScale.domain()[0]);

        preenrollment = selection.selectAll('rect.preenrollment').data(function(d) {
            if(collapsed || (!collapsed && d.study))
                return [d];
            else
                return [];});
        preenrollment.exit().remove();
        preenrollment.enter().append('rect').attr('class', 'preenrollment');
        preenrollment.attr('y', function(d) { return yScale(studyGroupName(d)) + 4; })
                .attr('x', x)
                .attr('width', function(d) {return (d.enrollment)?(xScale(d.enrollment) - x):0;})
                .attr('height', perStudyHeight - 8)
                .attr('fill', ChartUtils.colors.PREENROLLMENT);
    };

    var renderVisitTags = function(selection) {
        var visitTags, defaultImgSize = 8;

        visitTags = selection.selectAll('image.visit-tag').data(function (d) {
            if(collapsed || (!collapsed && d.study))
                return d.visits;
            else
                return [];
        });
        visitTags.exit().remove();
        visitTags.enter().append("image").attr('class', 'visit-tag')
            .attr('xlink:href', function(d) {
                return LABKEY.contextPath + '/production/Connector/resources/images/' + (d.imgSrc || 'nonvaccination_normal.svg');
            })
            .attr("x", function(d) {return xScale(d.alignedDay) - (d.imgSize || defaultImgSize)/2; })
            .attr("y", function(d) {
                    var scale = yScale(d.studyLabel);
                    if(!collapsed)
                        if(d.groupLabel)
                            scale = yScale(d.studyLabel + "-" + d.groupLabel);

                    return scale + perStudyHeight/2 - (d.imgSize || defaultImgSize)/2; })
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
                tickData[i] = {x: xScale(tickData[i]), y: yScale(studyGroupName(d))};
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
        bkgds.attr('y', function(d) { return yScale(studyGroupName(d)); })
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
            var ret = d.name;
            if (ret.length > 25) {
                return ret.slice(0, 23) + '...';
            }
            return ret;
        });
        labels.attr('y', function(d) {
            return yScale(studyGroupName(d)) + perStudyHeight/2 + 4;})
            .attr('x', function(d) {
                    if(d.study)  // groups have a parent study defined
                        return groupLabelOffset + leftIndent;
                    return studyLabelOffset + leftIndent;
                })
            .attr('fill', ChartUtils.colors.PRIMARYTEXT)
            .style('font', '11px Arial, serif')
            .attr('test-data-value', function(d) {
                    var txt = ''
                    if(d.study)
                        txt += d.study.replace(/ /g, '_') + '-'
                    txt += d.name.replace(/ /g, '_').replace(/,/g, '')
                    return txt;
                });
    };

    var renderExpandCollapseButton = function(canvas) {
        var button;

        canvas.append('g').append("image")
                .attr('xlink:href', function(d) {
                    return LABKEY.contextPath + '/production/Connector/resources/images/'
                        + (collapsed?'icon_general_expand_normal.svg':'icon_general_collapse_normal.svg'); })
                .attr('class', 'img-expand')
                .attr('x', 20)
                .attr('width', 22)
                .attr('height', 22);

        button = canvas.select('image.img-expand');

        button.on('mouseover', function(d) {
            button.attr('xlink:href', function (d) {
                return LABKEY.contextPath + '/production/Connector/resources/images/'
                    + (collapsed?'icon_general_expand_hover.svg':'icon_general_collapse_hover.svg');
            });
        });

        button.on('mouseout', function(d) {
            button.attr('xlink:href', function (d) {
                return LABKEY.contextPath + '/production/Connector/resources/images/'
                        + (collapsed?'icon_general_expand_normal.svg':'icon_general_collapse_normal.svg');
            });
        });

        button.on('mousedown', function(d) {
            button.attr('xlink:href', function (d) {
                return LABKEY.contextPath + '/production/Connector/resources/images/'
                        + (collapsed?'icon_general_expand_normal.svg':'icon_general_collapse_normal.svg');
            });
        });

        button.on('mouseup', function(d) {
            button.attr('xlink:href', function (d) {
                return LABKEY.contextPath + '/production/Connector/resources/images/'
                        + (collapsed?'icon_general_collapse_hover.svg':'icon_general_expand_hover.svg');
            });
            collapsed = !collapsed;
            studyAxis();
        });

    };

    var studyAxis = function() {
        var yDomain = [], studies, groupData = [], i;

        for (i = 0; i < studyData.length; i++) {
            yDomain.push(studyData[i].name);
            if(!collapsed) {
                groupData.push(studyData[i]);
                if(studyData[i].groups) {
                    for (var j = 0; j < studyData[i].groups.length; j++) {
                        yDomain.push(studyGroupName(studyData[i].groups[j]));
                        groupData.push(studyData[i].groups[j]);
                    }
                }
            }
        }

        if(collapsed)
            height = studyData.length * perStudyHeight;
        else
            height = groupData.length * perStudyHeight;

        yScale.rangeBands([0, height]);
        yScale.domain(yDomain);

        document.getElementById(renderTo).innerHTML = '';
        canvas = d3.select('#' + renderTo).append('svg');
        canvas.attr('width', width).attr('height', height);
        renderExpandCollapseButton(canvas);

        if(collapsed)
            studies = canvas.selectAll('g.study').data(studyData);
        else
            studies = canvas.selectAll('g.study').data(groupData);
        studies.exit().remove();
        studies.enter().append('g').attr('class', 'study');
        studies.call(renderBackground);
        studies.call(renderPreenrollment);
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