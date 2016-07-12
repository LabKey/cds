/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Learn', {

    extend: 'Connector.controller.AbstractViewController',

    views: ['Learn'],

    URL_DELIMITER: '=',

    isService: true,


    //
    // Service Functions
    //

    /**
     * Resolves a URL for learn about resources. If only dimension is provided,
     * it will resolve to the dimensions learn about listing. If a property is
     * provided, the value must occur in a single record in order to resolve
     * successfully.
     * @param {String} [dimension] The name of the dimension.
     * @param {string} [value] The id/name/value of the resource to be resolved.
     * @param {string} [prop] The model property to resolve by. If not provided, it defaults to the identifying property.
     * @returns {string}
     */
    getURL : function(dimension, value, prop) {
        var url = '#learn/learn/' + encodeURIComponent(dimension),
            sep = '/';

        if (!Ext.isEmpty(value)) {

            url += sep;

            if (!Ext.isEmpty(prop)) {
                url += encodeURIComponent(prop) + this.URL_DELIMITER;
            }

            url += encodeURIComponent(value);
        }

        return url;
    },

    //
    // View Controller Functions
    //
    init : function() {

        this.control('learnheader', {
            searchchanged: this.onSearchChange,
            //
            // When a dimension is selected the following event is fired. This is used in coordination
            // with this.updateLock to ensure that an infinite loop does not occur
            //
            selectdimension: this.onSelectDimension
        });

        this.control('learn > dataview', {
            // 23756: for some reason, itemclick doesn't always fire. Sadly, this means right click also selects
            itemmouseup: this.onSelectItem
            //itemclick: this.onSelectItem
        });

        this.control('learn > gridpanel', {
            // itemmouseup: this.onSelectItem
            itemclick: this.onSelectItem
        });

        this.control('singleaxisview', {
            learnclick : function(data) {
                // Assumes the data has already been validated to supportDetails
                Connector.getState().onMDXReady(function(mdx) {
                    var ctx = [mdx.getLevel(data.levelUniqueName).hierarchy.dimension.name, data.label];
                    this.getViewManager().changeView('learn', 'learn', ctx);
                }, this);
            },
            scope: this
        });

        this.control('pageheader', {
            // NOTE: This is a generic back handler for pageheader. Other views use this class so this
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
                state: Connector.getState(),
                searchFilter: context.params.q
            });

            var v = Ext.create(type, c);

            v.on('afterrender', function(v) { this.bindLearnView(v, c.ctx); }, this);

            return v;
        }
    },

    parseContext : function(ctx, params, newHash, oldHash) {
        var lastParams;
        var currentDimension = ctx[0] ? ctx[0] : this.lastContext && this.lastContext.lastDimension ? this.lastContext.lastDimension : 'Study';
        if (!ctx[0]) {
            var newHashLocation = '#' + 'learn/learn/' +  currentDimension;
            history.replaceState(undefined, undefined, newHashLocation);
        }
        lastParams = currentDimension && this.lastContext && this.lastContext[currentDimension] && this.lastContext[currentDimension].params ? this.lastContext[currentDimension].params : {};

        // When come to Learn About from other pages, no need to clear lastContext, should load previous search
        if (oldHash && 'learn' === oldHash.controller) {
            // When on Learn About and click Learn About, clear all previous context
            if (!ctx[0]) {
                this.lastContext = {};
                lastParams = {};
            }else if (oldHash.viewContext && currentDimension === oldHash.viewContext[0]) {
                // if click on the same tab, clear current dimension's lastContext
                if (this.isValueEqualContext(oldHash.viewContext[1], ctx[1]) && this.isValueEqualContext(oldHash.viewContext[2], ctx[2])) {
                    lastParams = {};
                    this.lastContext[currentDimension] = {};
                }
            }

        }

        if (!this.lastContext) {
            this.lastContext = {};
        }

        this.context = {
            dimension: currentDimension,
            id: ctx[1],
            tab: ctx[2],
            params: params? params : lastParams
        };
        this.lastContext[currentDimension] = Ext.clone(this.context);
        this.lastContext.lastDimension = currentDimension;
        return this.context;
    },

    isValueEqualContext: function(ctx1, ctx2) {
        if (Ext.isString(ctx1) && Ext.isString(ctx2)) {
            return ctx1 === ctx2;
        }
        return !ctx1 && !ctx2;
    },

    bindLearnView : function(v, context) {
        //
        // Bind the dimensions to the view
        //
        Connector.getState().onMDXReady(function(mdx) {

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
        Connector.getState().onMDXReady(function(mdx) {
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
                    v.selectDimension(dim, id, tab, context.params.q);
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

    onSearchChange : function(search) {
        this.replaceHashParam('q', search);
    },

    replaceHashParam : function(paramName, paramValue) {
        if (this.context) {
            this.context.params[paramName] = Ext.isString(paramValue) && paramValue.length ? paramValue : undefined;
            this.lastContext[this.context.dimension] = Ext.clone(this.context);
        }
        var newHash = Connector.utility.HashURL.getUpdatedHashParamStr(paramName, paramValue);
        if (Ext.isDefined(newHash)) {
            history.replaceState(undefined, undefined, newHash);
        }
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
                this.getViewManager().changeView('learn', 'learn', context);
            }
        }
    },

    onSelectItem : function(view, item) {
        var id = item.getId();

        if (id && this.dimension) {
            this.getViewManager().changeView('learn', 'learn', [this.dimension.name, id]);
        }
        else if (!id) {
            console.warn('Unable to show item without an id property');
        }
        else {
            console.warn('No dimension selected');
        }
    },

    onSelectItemTab : function(dim, item, itemDetailTab) {
        this.getViewManager().changeView('learn', 'learn', [dim.name, item.getId(), itemDetailTab.url], this.lastContext && this.lastContext[dim.name] ? this.lastContext[dim.name].params : undefined);
    }
});