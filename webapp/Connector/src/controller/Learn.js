/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Learn', {

    extend: 'Connector.controller.AbstractViewController',

    views: ['Learn'],

    init : function() {

        this.control('learn', {
            //
            // When a dimension is selected the following event is fired. This is used in coordination
            // with this.updateLock to ensure that an infinite loop does not occur
            //
            selectdimension: this.onSelectDimension,
            selectitem: this.onSelectItem
        });

        this.control('singleaxisview', {
            learnclick : function(data) {
                // Assumes the data has already been validated to supportDetails
                this.getStateManager().onMDXReady(function(mdx) {
                    var ctx = [mdx.getLevel(data.levelUniqueName).hierarchy.dimension.name, data.label];
                    this.getViewManager().changeView('learn', 'learn', ctx);
                }, this);
            },
            scope: this
        });

        this.control('#back', {
            click : function() {
                history.back();
            }
        });

        this.control('learnpageheader', {
            // NOTE: This is a generic back handler for learnpageheader. Other views use this class so this
            // just assists in sending the link to changeView().
            upclick : function(link) {
                // TODO: It would nice if we could go 'back' when we know the previous page was 'learn/learn/[dim.name]'
                this.getViewManager().changeView(link.controller, link.view, link.context);
            },
            tabselect: this.onSelectItemTab,
            scope: this
        });

        this.callParent();
    },

    createView : function(xtype, context) {
        var type = '';
        var c = { ctx: context };

        if (xtype == 'learn') {
            type = 'Connector.view.Learn';

            Ext.applyIf(c, {
                ui: 'custom',
                state: this.getStateManager()
            });

            var v = Ext.create(type, c);

            v.on('afterrender', function(v) { this.bindLearnView(v, c.ctx); }, this);

            return v;
        }
    },

    parseContext : function(ctx) {
        this.context = {
            dimension: ctx[0],
            id: ctx[1],
            tab: ctx[2]
        };
        return this.context;
    },

    bindLearnView : function(v, context) {
        //
        // Bind the dimensions to the view
        //
        this.getStateManager().onMDXReady(function(mdx) {

            var dims = mdx.getDimensions(),
                defer = false;

            v.setDimensions(dims);

            //
            // Set the active dimension
            //
            if (context && context.dimension) {
                var dim = mdx.getDimension(context.dimension);
                if (dim) {
                    for (var d=0; d < dims.length; d++) {
                        if (dims[d].uniqueName == dim.uniqueName) {
                            this.updateLearnView(context);
                            break;
                        }
                    }
                }
                else {
                    defer = true;
                }
            }
            else {
                defer = true;
            }

            if (defer) {
                Ext.defer(function() {
                    v.getHeader().getDataView().selectDimension();
                }, 200, this);
            }
        }, this);
    },

    updateView : function(xtype, context) {
        if (xtype == 'learn') {
            this.updateLearnView(context);
        }
    },

    getViewTitle : function(xtype, context) {
        if (xtype == 'learn') {
            var title = 'Learn About';
            if (context.dimension) {
                title = context.dimension + " - " + title;
            }
            return title;
        }
    },

    updateLearnView : function(context) {
        this.getStateManager().onMDXReady(function(mdx) {
            var v = this.getViewManager().getViewInstance('learn');
            if (v) {
                var dimensionName = context.dimension,
                    id = context.id,
                    tab = context.tab,
                    dim;

                if (dimensionName) {
                    dim = mdx.getDimension(dimensionName);
                }

                if (dim) {
                    //
                    // Only update the active dimension when the dimension
                    // can be found in the context
                    //
                    this.dimension = dim;
                    this.updateLock = true;
                    v.selectDimension(dim, id, tab);
                    this.updateLock = false;
                }
                else {
                    v.selectDimension(this.dimension);
                }
            }
            else {
                console.warn('Unable to find view instance (learn)');
            }
        }, this);
    },

    getDefaultView : function() {
        return 'learn';
    },

    onSelectDimension : function(dimension, silent) {
        if (!this.updateLock) {
            var context = [dimension.get('name')];
            if (this.context.id) {
                context.push(this.context.id);

                if (this.context.tab) {
                    context.push(this.context.tab);
                }
            }

            //
            // If a selection is 'silent' then it is considered to be avoiding
            // url update (and avoid browser back issues). The more ideal solution
            // would be to have a default state for the learn view/model
            //
            if (silent === true)
            {
                context = this.parseContext(context);
                this.updateLearnView(context);
            }
            else
            {
                this.getViewManager().changeView('learn', 'learn', context, 'Learn About: ' + dimension.get('pluralName'));
            }
        }
    },

    onSelectItem : function(item) {
        var id = item.getId();

        if (id && this.dimension) {
            this.getViewManager().changeView('learn', 'learn', [this.dimension.name, id]);
        }
        else if (!id) {
            console.warn('Unable to show item without an id property');
        } else {
            console.warn('No dimension selected');
        }
    },

    onSelectItemTab : function(dim, item, itemDetailTab) {
        this.getViewManager().changeView('learn', 'learn', [dim.name, item.getId(), itemDetailTab.url]);
    }
});