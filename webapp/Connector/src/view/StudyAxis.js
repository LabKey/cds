/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Connector.view.StudyAxis = function() {
    var canvas = null, width, height, perStudyHeight = 20, studyData, ALIGNMENT_DAY = 0, renderTo, xScale, yScale = d3.scale.ordinal(),
            tagMouseover, tagMouseout, tagMouseoverScope, tagMouseoutScope, leftIndent = 25, collapsed = true, groupLabelOffset = 45,
            studyLabelOffset = 35, highlightPlot, highlightPlotScope,
            selectStudyAxis, selectStudyAxisScope, mainPlotLayer, toggleStudyAxis, toggleStudyAxisScope;

    // This function returns <study name> for studies and <study name>-<group name> for groups in an attempt to
    // provide a unique name for each value in yScale
    var studyGroupName = function(el) {
        var name = '';
        if (el && el.name &&  Ext.isString(el.name)) {
            if (el.study && Ext.isString(el.study)) {
                name = el.study + "-" + el.name;
            }
            else {
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
            if (collapsed || (!collapsed && d.study)) {
                return [d];
            }
            return [];
        });
        preenrollment.exit().remove();
        preenrollment.enter().append('rect').attr('class', 'preenrollment');
        preenrollment.attr('y', function(d) { return yScale(studyGroupName(d)) + 4; })
                .attr('x', x)
                .attr('width', function(d) {return (d.enrollment)?(xScale(d.enrollment) - x):0;})
                .attr('height', perStudyHeight - 8)
                .attr('fill', ChartUtils.colors.PREENROLLMENT);
    };

    var renderVisitTags = function(selection) {

        var visitTags = selection.selectAll('image.visit-tag').data(function(d)
        {
            if (collapsed || (!collapsed && d.study))
            {
                return d.visits;
            }
            return [];
        });
        visitTags.exit().remove();
        visitTags.enter().append("image")
                .attr('class', 'visit-tag')
                .attr('xlink:href', function(d)
                {
                    var imgPath = Connector.resourceContext.imgPath + '/';

                    if (d.isVaccination) {
                        if (d.isTagActive) {
                            imgPath += 'vaccination_normal.svg';
                        }
                        else {
                            imgPath += 'vaccination_disabled.svg';
                        }
                    }
                    else if (d.isChallenge) {
                        if (d.isTagActive) {
                            imgPath += 'challenge_normal.svg';
                        }
                        else {
                            imgPath += 'challenge_disabled.svg';
                        }
                    }
                    else {
                        if (d.isTagActive) {
                            imgPath += 'nonvaccination_normal.svg';
                        }
                        else {
                            imgPath += 'nonvaccination_disabled.svg';
                        }
                    }

                    return imgPath;
                })
                .attr('x', function(d)
                {
                    return xScale(d.alignedDay) - (d.imgSize / 2);
                })
                .attr('y', function(d)
                {
                    var scale;
                    if (!collapsed && d.groupLabel)
                    {
                        scale = yScale(d.studyLabel + '-' + d.groupLabel);
                    }
                    else
                    {
                        scale = yScale(d.studyLabel);
                    }

                    return scale + (perStudyHeight / 2) - (d.imgSize / 2);
                })
                .attr('width', function(d) { return d.imgSize; })
                .attr('height', function(d) { return d.imgSize; });

        // add visit tag mouseover/mouseout functions.
        visitTags.on('mouseover', function(d) {
            if (!mainPlotLayer.isBrushed) {
                if (d.isTagActive) {
                    highlightGlyph.call(this, d, true, selection);
                }
                tagMouseover.call(tagMouseoverScope, d, this);
            }
        });
        visitTags.on('mouseout', function(d) {
            if (mainPlotLayer.isBrushed) {
                return;
            }
            if (d.isTagActive && !d.selected) {
                highlightGlyph.call(highlightPlotScope, d, false, selection);
            }
            tagMouseout.call(tagMouseoutScope, d, this);
        });

        visitTags.on('mousedown', function(d) {
        // use mousedown to close callout so that mouseup can be fired reliably
            tagMouseout.call(tagMouseoutScope, d, this);

        });

        visitTags.on('mouseup', function(d) {
            if (!d.isTagActive || mainPlotLayer.isBrushed) {
                return;
            }
            d.selected = true;
            var multi = d3.event.ctrlKey||d3.event.shiftKey||d3.event.metaKey;
            tagMouseover.call(tagMouseoverScope, d, this);
            highlightGlyph.call(this, d, true, selection, true, multi);
            tagMouseoverScope.fireEvent('hidetooltipmsg');
        });
    };

    var clearSelection = function (selector) {
        if (!selector) {
            selector = d3;
        }
        selector.selectAll("text.study-label").each( function(detail, i){
            detail.selected = false;
            d3.select(this.parentNode).select('rect.highlight').attr('fill-opacity', 0);
        });
        selector.selectAll("image.visit-tag").each( function(detail, i){
            detail.selected = false;
            changeGlyphImage(detail, false, selector);
        });
    };

    var highlightGlyph = function(d, isHighlight, selector, isSelection, isMulti) {
        if (isSelection && isHighlight) {
            if (!isMulti) {
                clearSelection.call(this, selector);
            }
            d.selected = true;
            selectStudyAxis.call(selectStudyAxisScope, d, isMulti);
        }
        var key = ChartUtils.studyAxisKeyDelimiter + d.alignedDay;
        key += ChartUtils.studyAxisKeyDelimiter + d.studyLabel;
        if (d.groupLabel) {
            key += ChartUtils.studyAxisKeyDelimiter + d.groupLabel;
        }
        if (isHighlight) {
            highlightPlot.call(highlightPlotScope, key);
        }
        else {
            highlightPlot.call(highlightPlotScope)
        }
        changeGlyphImage.call(this, d, isHighlight, selector);
    };

    var changeGlyphImage = function(d, isHighlight, selector) {
        if (d.selected && !isHighlight)
            return;
        var x = xScale(d.alignedDay) - (d.imgSize / 2);
        var scale;
        if (!collapsed && d.groupLabel)
        {
            scale = yScale(d.studyLabel + '-' + d.groupLabel);
        }
        else
        {
            scale = yScale(d.studyLabel);
        }
        var y = scale + (perStudyHeight / 2) - (d.imgSize / 2);
        var size = d.imgSize;
        selector.selectAll("image.visit-tag").each( function(detail, i){

            if(detail.studyLabel === d.studyLabel && detail.groupLabel == d.groupLabel){
                if (detail.isVaccination !== d.isVaccination || detail.isChallenge !== d.isChallenge || detail.alignedDay !== d.alignedDay) {
                    return;
                }
                d3.select(this).attr('xlink:href', function(data) {
                            var imgPath = Connector.resourceContext.imgPath + '/';

                            if (data.isVaccination) {
                                if (!data.isTagActive) {
                                    imgPath += 'vaccination_disabled.svg';
                                }
                                else if (isHighlight) {
                                    imgPath += 'vaccination_hover.svg';
                                }
                                else {
                                    imgPath += 'vaccination_normal.svg';
                                }
                            }
                            else if (data.isChallenge) {
                                if (!data.isTagActive) {
                                    imgPath += 'challenge_disabled.svg';
                                }
                                else if (isHighlight) {
                                    imgPath += 'challenge_hover.svg';
                                }
                                else {
                                    imgPath += 'challenge_normal.svg';
                                }
                            }
                            else {
                                if (!data.isTagActive) {
                                    imgPath += 'nonvaccination_disabled.svg';
                                }
                                else if (isHighlight) {
                                    imgPath += 'nonvaccination_hover.svg';
                                }
                                else {
                                    imgPath += 'nonvaccination_normal.svg';
                                }
                            }
                            return imgPath;
                        })
                        .attr('x', x)
                        .attr('y', y)
                        .attr('width', size)
                        .attr('height', size);
                this.parentNode.appendChild(this);
                return false;
            }
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
                    return yScale(studyGroupName(d)) + perStudyHeight/2 + 4;
                })
                .attr('x', function(d) {
                    // groups have a parent study defined
                    return (d.study ? groupLabelOffset : studyLabelOffset) + leftIndent;
                })
                .attr('fill', ChartUtils.colors.PRIMARYTEXT)
                .style('font', '11px Arial, serif')
                .attr('test-data-value', function(d) {
                    var txt = '';
                    if (d.study)
                        txt += d.study.replace(/ /g, '_') + '-';
                    txt += d.name.replace(/ /g, '_').replace(/,/g, '');
                    return txt;
                });

        labels.on('mouseover', function(d) {
            if (mainPlotLayer.isBrushed) {
                return;
            }
            highlightStudyLabel(d, true, selection, false);
        });
        labels.on('mouseout', function(d) {
            if (mainPlotLayer.isBrushed) {
                return;
            }
            if (!d.selected) {
                highlightStudyLabel(d, false, selection, false);
            }
        });
        labels.on('mousedown', function(d) {
            if (mainPlotLayer.isBrushed) {
                return;
            }
            var multi = d3.event.ctrlKey||d3.event.shiftKey||d3.event.metaKey;
            highlightStudyLabel(d, true, selection, true, multi);
        });

        selection.selectAll('rect.highlight').remove();
        selection.insert("rect", "text")
                .attr('class', 'highlight')
                .attr('x', function() {
                    return this.nextSibling.getBBox().x - 4; })
                .attr('y', function() {
                    return this.nextSibling.getBBox().y - 3; })
                .attr('width', function() {
                    return this.nextSibling.getBBox().width + 8; })
                .attr('height', function() {
                    return this.nextSibling.getBBox().height + 6; })
                .attr('fill-opacity', 0)
                .attr('fill', ChartUtils.colors.SELECTED);

    };

    var highlightStudyLabel = function(d, isHighlight, selector, isSelection, isMulti) {
        if (isSelection && isHighlight) {
            if (!isMulti) {
                clearSelection.call(this, selector);
            }
            d.selected = true;
            selectStudyAxis.call(selectStudyAxisScope, d, isMulti);
        }
        var key = '';
        if (d.study) {
            key += ChartUtils.studyAxisKeyDelimiter + d.study;
        }
        key += ChartUtils.studyAxisKeyDelimiter + d.name;

        highlightLabelAndGlyph.call(this, key, isHighlight, selector, isSelection, isMulti);

        if (isHighlight) {
            highlightPlot.call(highlightPlotScope, key);

        } else {
            highlightPlot.call(highlightPlotScope);
        }
    };

    var highlightAllSelections = function(keys) {
        Ext.each(keys, function (key) {
            highlightLabelAndGlyph.call(highlightPlotScope, key, true, null, true, true);
        });
    };

    var highlightLabelAndGlyph = function(key, isHighlight, selector, isSelection, isMulti) {
        if (!selector) {
            selector = d3;
        }
        selector.selectAll("text.study-label").each(function(detail, i){
            var detailkey = '';
            if (detail.study) {
                detailkey += ChartUtils.studyAxisKeyDelimiter + detail.study;
            }
            detailkey += ChartUtils.studyAxisKeyDelimiter + detail.name;
            if (detailkey.indexOf(key) > -1) {
                if (isHighlight) {
                    d3.select(this.parentNode).select('rect.highlight').attr('fill-opacity', 1);
                    if (isSelection) {
                        detail.selected = true;
                    }
                }
                else if (!detail.selected){
                    d3.select(this.parentNode).select('rect.highlight').attr('fill-opacity', 0);
                }
            }
        });

        selector.selectAll("image.visit-tag").each( function(detail, i){
            var detailkey = ChartUtils.studyAxisKeyDelimiter + detail.alignedDay;
            detailkey += ChartUtils.studyAxisKeyDelimiter + detail.studyLabel;
            if (detail.groupLabel) {
                detailkey += ChartUtils.studyAxisKeyDelimiter + detail.groupLabel;
            }
            if (detailkey.indexOf(key) > -1) {
                changeGlyphImage(detail, isHighlight, selector);
                if (isSelection) {
                    detail.selected = true;
                }
            }
        });

    };

    var renderExpandCollapseButton = function(canvas) {
        var button,
            collapsedImg = 'icon_general_collapse_normal.svg',
            collapsedHoverImg = 'icon_general_collapse_hover.svg',
            expandedImg = 'icon_general_expand_normal.svg',
            expandedHoverImg = 'icon_general_expand_hover.svg';

        canvas.append('g').append("image")
                .attr('xlink:href', function(d) {
                    return Connector.resourceContext.imgPath + '/' + (collapsed ? expandedImg : collapsedImg);
                })
                .attr('class', 'img-expand')
                .attr('x', 20)
                .attr('width', 22)
                .attr('height', 22);

        button = canvas.select('image.img-expand');

        button.on('mouseover', function(d) {
            button.attr('xlink:href', function(d) {
                return Connector.resourceContext.imgPath + '/' + (collapsed ? expandedHoverImg : collapsedHoverImg);
            });
        });

        button.on('mouseout', function(d) {
            button.attr('xlink:href', function(d) {
                return Connector.resourceContext.imgPath + '/' + (collapsed ? expandedImg : collapsedImg);
            });
        });

        button.on('mousedown', function(d) {
            button.attr('xlink:href', function(d) {
                return Connector.resourceContext.imgPath + '/' + (collapsed ? expandedImg : collapsedImg);
            });
        });

        button.on('mouseup', function(d) {
            button.attr('xlink:href', function(d) {
                return Connector.resourceContext.imgPath + '/' + (collapsed ? collapsedHoverImg : expandedHoverImg);
            });
            toggleStudyAxis.call(toggleStudyAxisScope);
        });

    };

    var studyAxis = function() {
        var yDomain = [], studies, groupData = [], i;

        for (i = 0; i < studyData.length; i++) {
            yDomain.push(studyData[i].name);
            if (!collapsed) {
                groupData.push(studyData[i]);
                if (studyData[i].groups) {
                    for (var j = 0; j < studyData[i].groups.length; j++) {
                        yDomain.push(studyGroupName(studyData[i].groups[j]));
                        groupData.push(studyData[i].groups[j]);
                    }
                }
            }
        }

        if (collapsed)
            height = studyData.length * perStudyHeight;
        else
            height = groupData.length * perStudyHeight;

        yScale.rangeBands([0, height]);
        yScale.domain(yDomain);

        document.getElementById(renderTo).innerHTML = '';
        canvas = d3.select('#' + renderTo).append('svg');
        canvas.attr('width', width).attr('height', height);
        renderExpandCollapseButton(canvas);

        if (collapsed)
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

        var studyAxisSelections = selectStudyAxisScope.getStudyAxisSelectionValues();
        var hasStudyAxisSelection = selectStudyAxisScope.isStudyAxisSelection();
        if (hasStudyAxisSelection) {
            highlightAllSelections(studyAxisSelections);
        }
    };

    studyAxis.renderTo = function(id) { renderTo = id; return studyAxis; };
    studyAxis.clearSelection = clearSelection;
    studyAxis.width = function(w) { width = w; return studyAxis; };
    studyAxis.studyData = function(d) { studyData = d; return studyAxis; };
    studyAxis.visitTagMouseover = function(m, s) { tagMouseover = m; tagMouseoverScope = s; return studyAxis; };
    studyAxis.visitTagMouseout = function(m, s) { tagMouseout = m; tagMouseoutScope = s; return studyAxis; };
    studyAxis.highlightPlot = function(m, s) { highlightPlot = m; highlightPlotScope = s; return studyAxis; };
    studyAxis.selectStudyAxis = function(m, s) { selectStudyAxis = m; selectStudyAxisScope = s; return studyAxis; };
    studyAxis.toggleStudyAxis = function(m, s) { toggleStudyAxis = m; toggleStudyAxisScope = s; return studyAxis; };
    studyAxis.setCollapsed = function(m) { collapsed = m; return studyAxis; };
    studyAxis.mainPlotLayer = function(layer) { mainPlotLayer = layer; return studyAxis; };
    studyAxis.scale = function(s) {
        var r;
        xScale = s.copy();
        r = xScale.range();
        xScale.range([r[0] + 150, r[1] + 150]);
        return studyAxis;
    };

    return studyAxis;
};