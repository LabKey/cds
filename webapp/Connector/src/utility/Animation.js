/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.define('Animation', {
    singleton: true,

    // Copy a source object and float it to a destination object
    floatTo: function(node, sourceQuery, targetQueries, animateElementType, animateElementClass, completionCallback, callbackScope, callbackParams) {
        var target = null,
            targetTop = false,
            found = false,
            box,
            child,
            cbox,
            dom,
            xdom,
            task,
            el,
            y, i;

        // Determine which animation end point is best
        for (i = 0; i < targetQueries.length && !found; ++i) {
            target = Ext.DomQuery.select(targetQueries[i]);
            if (Ext.isArray(target) && !Ext.isEmpty(target)) {
                el = Ext.get(target[0]);
                if (el.isVisible()) {
                    box = el.getBox();
                    // Visible doesn't necessarily work...
                    if (box.x > 0 && box.y > 0) {
                        // use the selection panel
                        targetTop = true;
                        found = true;
                    }
                }
            }
        }

        if (found) {
            if (Ext.isElement(node)) {
                // Convert DOM element to Ext element
                node = Ext.get(node);
            }

            child = Ext.get(node.query(sourceQuery)[0]);
            cbox = child.getBox();

            // Create DOM Element replicate
            dom = document.createElement(animateElementType);
            //IE and Safari not finding innerHTML
            if (child.dom.innerHTML) {
                dom.innerHTML = child.dom.innerHTML;
            }
            else {
                dom.innerHTML = child.dom.__data__;
            }
            dom.setAttribute('class', animateElementClass);
            dom.setAttribute('style', 'position: absolute; width: ' + (child.getTextWidth()+20) + 'px; left: ' + cbox[0] + 'px; top: ' + cbox[1] + 'px;');

            // Append to Body
            xdom = Ext.get(dom);
            xdom.appendTo(Ext.getBody());

            y = box.y + 30;
            if (!targetTop) {
                y += box.height;
            }

            xdom.animate({
                to : {
                    x: box.x,
                    y: y,
                    opacity: 0.2
                },
                duration: 700, // Issue: 15220
                listeners : {
                    afteranimate : function() {
                        Ext.removeNode(xdom.dom);
                    }
                }
            });
        }

        if (completionCallback) {
            task = new Ext.util.DelayedTask(completionCallback, callbackScope, callbackParams);
            task.delay(found ? 800 : 0);
        }
    }
});
