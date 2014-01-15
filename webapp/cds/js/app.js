/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * This file, EXCEPT the IECheck function code, is licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {

    var launchApp = function(cube) {

        // This is a bug in setting the style so IE can render.
        // See line #14789 in ext-all-sandbox-dev.js
        // The IECheck function code is part of ExtJS and subject to the ExtJS license
        var IECheck = function() {
            if (Ext4.isIE) {
                Ext4.Element.prototype.setStyle = function(prop, value){
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
                            value = Ext4.value(prop[style], '');
                            if (style == 'opacity') {
                                this.setOpacity(value);
                            }
                            else {
                                if (!Ext4.isIE)
                                    this.dom.style[Ext4.Element.normalize(style)] = value;
                                else if (style.search('background-image') == -1){  // so much hack
                                    this.dom.style[Ext4.Element.normalize(style)] = value;
                                }
                            }
                        }
                    }
                    return this;
                }
            }

            Ext4.override(Ext4.selection.Model, {
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

        Ext4.Loader.setConfig({
            enabled : true,
            paths : {
                'Connector' : LABKEY.contextPath + '/cds/js/Connector'
            }
//            ,disableCaching : false // uncomment to be able to set browser breakpoints
        });

        Ext4.require([
            'Connector.controller.AbstractViewController',
            'Connector.controller.Router',
            'Connector.controller.Citation',
            'Connector.controller.Connector',
            'Connector.controller.Chart',
            'Connector.controller.Explorer',
            'Connector.controller.FilterStatus',
            'Connector.controller.Learn',
            'Connector.controller.Navigation',
            'Connector.controller.RawData',
            'Connector.controller.State',
            'Connector.controller.Summary',
            'Connector.model.FilterGroup',
            'Connector.model.Filter',
            'Connector.store.CDSStore',
            'Connector.view.Viewport',

            'Connector.app.store.Assay',
            'Connector.app.model.Assay',
            'Connector.app.view.Assay',

            'Connector.app.store.Labs',
            'Connector.app.model.Labs',
            'Connector.app.view.Labs',

            'Connector.app.store.Site',
            'Connector.app.model.Site',
            'Connector.app.view.Site',

            'Connector.app.store.Study',
            'Connector.app.model.Study',
            'Connector.app.view.Study',

            'Connector.app.store.StudyProducts',
            'Connector.app.model.StudyProducts',
            'Connector.app.view.StudyProducts'
        ]);

        Ext4.application({
            name: 'Connector',

            appFolder: 'Connector',

            controllers : [
                'Connector', // View Manager must be registered first to properly initialize
                'Router',
                'Citation',
                'Chart',
                'Explorer',
                'FilterStatus',
                'Learn',
                'Navigation',
                'RawData',
                'State',
                'Summary'
            ],

            models : ['Detail', 'Dimension', 'FilterGroup', 'Filter', 'State', 'Summary'],

            launch: function() {

                IECheck();

                Ext4.create('Connector.view.Viewport', {
                    ui     : 'custom',
                    app    : this,
                    defaults : {
                        ui : 'custom'
                    }
                });

//                MDX = null;
//                STATE = this.getController('State');
//                STATE.onMDXReady(function(mdx) { MDX = mdx; });
            },

            olap : cube
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
})();