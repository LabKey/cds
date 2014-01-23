/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

// This is a bug in setting the style so IE can render.
// See line #14789 in ext-all-sandbox-dev.js
// The IECheck function code is part of ExtJS and subject to the ExtJS license
var IECheck = function() {
    if (Ext.isIE) {
        Ext.Element.prototype.setStyle = function(prop, value){
            var tmp, style;

            if (!this.dom) {
                return this;
            }
            if (typeof prop === 'string') {
                tmp = {};
                tmp[prop] = value;
                prop = tmp;
            }
            for (style in prop) {
                if (prop.hasOwnProperty(style)) {
                    value = Ext.value(prop[style], '');
                    if (style == 'opacity') {
                        this.setOpacity(value);
                    }
                    else {
                        if (!Ext.isIE)
                            this.dom.style[Ext.Element.normalize(style)] = value;
                        else if (style.search('background-image') == -1){  // so much hack
                            this.dom.style[Ext.Element.normalize(style)] = value;
                        }
                    }
                }
            }
            return this;
        }
    }

    Ext.override(Ext.selection.Model, {
        // Shift select == ctrl select
        selectWithEvent: function(record, e, keepExisting) {
            var me = this;

            switch (me.selectionMode) {
                case 'MULTI':
                    if ((e.ctrlKey || e.shiftKey) && me.isSelected(record)) {
                        me.doDeselect(record, false);
                    } else if (e.ctrlKey || e.shiftKey) {
                        me.doSelect(record, true, false);
                    } else if (me.isSelected(record) && (!e.ctrlKey && !e.shiftKey) && me.selected.getCount() > 1) {
                        me.doSelect(record, keepExisting, false);
                    } else {
                        me.doSelect(record, false);
                    }
                    break;
                case 'SIMPLE':
                    if (me.isSelected(record)) {
                        me.doDeselect(record);
                    } else {
                        me.doSelect(record, true);
                    }
                    break;
                case 'SINGLE':
                    // if allowDeselect is on and this record isSelected, deselect it
                    if (me.allowDeselect && me.isSelected(record)) {
                        me.doDeselect(record);
                        // select the record and do NOT maintain existing selections
                    } else {
                        me.doSelect(record, false);
                    }
                    break;
            }
        }
    });
};

var launchApp = function(cube) {
    Ext.onReady(function() {

        Ext.application({
            name: 'Connector',
            extend: 'Connector.Application',
            autoCreateViewport: true,

            launch : function() {
                console.log('TODO: Check IE');
//                IECheck();
            },

            olap: cube
        });

    });
};

var cube = LABKEY.query.olap.CubeManager.getCube({
    configId: 'CDS:/CDS',
    schemaName: 'CDS',
    name: 'ParticipantCube',
    deferLoad: true,
    applyContext: Connector.cube.Configuration.applyContext
});

// launch the app
launchApp(cube);

// call to getCube in olap.js to initialize cube
cube.load();