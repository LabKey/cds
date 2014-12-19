/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Explorer', {

    extend : 'Connector.controller.AbstractViewController',

    stores: ['Explorer'],

    views : ['SingleAxisExplorer'],

    init : function() {

        this.control('singleaxisview', {
            itemmouseenter : this.onExplorerEnter,
            itemmouseleave : this.onExplorerLeave,
            itemclick      : this.onExplorerSelect
        });

        this.control('#dimensionbtn', {
            click: function(btn) { btn.showMenu(); }
        });

        this.control('#dimensionmenu', {
            click : this.onDimensionSelect
        });

        this.control('#sortdropdown', {
            click: function(btn) { btn.showMenu(); }
        });

        this.control('#sortedmenu', {
            afterrender: function(menu) {
                var updateDimension = function(m, dim) {
                    m.removeAll();
                    var btn = Ext.getCmp(m.btn);

                    var h = dim.getHierarchies();
                    if (h.length == 1) {
                        btn.hide();
                        return;
                    }

                    Ext.each(h, function(hierarchy, idx) {
                        if (!hierarchy.hidden) {
                            m.add({
                                text: hierarchy.label,
                                uniqueName: hierarchy.uniqueName,
                                hierarchyIndex: idx
                            });
                        }
                    });

                    btn.show();
                };

                /* Hook this menu to listen for dimension changes */
                this.on('dimension', function(dim) { updateDimension(menu, dim); }, this);

                /* For the intial render */
                if (this.dim) {
                    updateDimension(menu, this.dim);
                }
            },
            click : this.onHierarchySelect
        });

        this.clickTask = new Ext.util.DelayedTask(function(view, rec, node) {
            if (view.btnclick) {
                view.resetButtonClick();
                return;
            }

            this.runSelectionAnimation(view, rec, node, this.afterSelectionAnimation, this);
        }, this);

        this.hoverTask = new Ext.util.DelayedTask(function(view, rec, add) {
            if (add) {
                this.getStateManager().addPrivateSelection({
                    hierarchy: rec.get('hierarchy'),
                    members: [{ uniqueName: rec.get('uniqueName') }]
                }, 'hoverSelectionFilter');
            }
            else {
                this.getStateManager().removePrivateSelection('hoverSelectionFilter');
            }
        }, this);

        this.callParent();

        this.addEvents('dimension', 'hierarchy');
    },

    createView : function(xtype, context) {

        if (xtype == 'singleaxis') {
            var state = this.getStateManager();
            var s = this.getStore('Explorer');
            s.olapProvider = state;

            var v = Ext.create('Connector.view.SingleAxisExplorer',{
                flex : 3,
                ui : 'custom',
                width : '100%',
                store : s,
                selections : state.getSelections()
            });

            this.on({
                dimension: v.onDimensionChange,
                hierarchy: v.onHierarchyChange,
                scope: v
            });

            state.on({
                filterchange: v.onFilterChange,
                selectionchange: v.onSelectionChange,
                privateselectionchange: function(sels, name) {
                    if (name == 'hoverSelectionFilter') {
                        v.onSelectionChange.call(v, sels, true);
                    }
                },
                scope: v
            });

            // View listeners
            this.getViewManager().on('afterchangeview', v.onViewChange, v);

            // this allows whether mouse hover over explorer items will cause a request for selection
            this.allowHover = true;

            v.on('boxready', function() { this.loadExplorerView(context, v); }, this, {single: true});

            return v;
        }
    },

    updateView : function(xtype, context) {
        this.loadExplorerView(context, null);
    },

    getViewTitle : function(xtype, context) {
        if (xtype === 'singleaxis') {
            return 'Find';
        }
    },

    getDefaultView : function() {
        return 'singleaxis';
    },

    parseContext : function(urlContext) {
        urlContext = this.callParent(arguments);

        var context = {
            dimension: urlContext.length > 0 ? urlContext[0] : 'Study' // make the default the first hierarchy listed
        };
        if (urlContext && urlContext.length > 1) {
            context.hierarchy = urlContext[1];
        }
        return context;
    },

    loadExplorerView : function(context, view) {
        var state = this.getStateManager();
        state.onMDXReady(function(mdx) {
            var dim = mdx.getDimension(context.dimension);
            if (dim) {

                var idx = 0;
                this.dim = dim;

                /* Find the appropriate hierarchy index -- would be nice if this could just be a lookup */
                if (context.hierarchy) {
                    var _h = dim.getHierarchies(), h = dim.name.toLowerCase() + '.' + context.hierarchy.toLowerCase();
                    for (var i=0; i < _h.length; i++) {
                        if (_h[i].name.toLowerCase() == h) {
                            idx = i;
                            break;
                        }
                    }
                }
                else {
                    this.hierarchy = null;
                }

                // TODO: Remove this
                if (idx == 0 && dim.name.toLowerCase() == 'subject') {
                    idx = 1;
                }

                if (view) {
                    view.onDimensionChange.call(view, dim, idx);
                }
                this.fireEvent('dimension', dim, idx);
            }
            else {
                alert('Failed:' + context.dimension);
            }
        }, this);
    },

    // fired when the dimension is changed via the menu
    onDimensionSelect : function(m, item) {
        this.goToExplorer(item.rec.data.hierarchy.split('.')[0], null);
    },

    // fired when the hierarchy is changed via the menu
    onHierarchySelect : function(m, item) {
        var hierarchy = this.dim.hierarchies[item.hierarchyIndex];
        hierarchy = hierarchy.name.split('.')[1];
        this.goToExplorer(this.dim.name, hierarchy);
    },

    onExplorerEnter : function(view, rec) {
        if (!view.loadLock) {
            this._hoverHelper(view, rec, true);
        }
    },

    goToExplorer : function(dim, hierarchy) {

        var context = [dim];
        if (hierarchy) {
            context.push(hierarchy);
        }
        this.getViewManager().changeView('explorer', 'singleaxis', context);
    },

    onExplorerLeave : function(view, rec) {
        if (!view.loadLock) {
            this._hoverHelper(view, rec, false);
        }
    },

    _hoverHelper : function(view, rec, add) {
        if (this.allowHover && this.getStateManager().getSelections().length == 0) {
            this.hoverTask.delay(200, null, null, [view, rec, add]);
        }
    },

    onExplorerSelect : function(view, record, node) {
        if (!view.loadLock) {
            this.clickTask.delay(150, null, null, [view, record, node]);
        }
    },

    runSelectionAnimation : function(view, rec, node) {

        this.allowHover = false;

        Animation.floatTo(node, 'span.barlabel', ['.selectionpanel', '.filterpanel'], 'span', 'barlabel selected', function(view, rec, node) {
            this.allowHover = true;
            this.afterSelectionAnimation(view, rec, node);
        }, this, [view, rec, node]);
    },

    afterSelectionAnimation : function(view, rec, node) {
        var records = view.getSelectionModel().getSelection();
        var state = this.getStateManager();

        state.onMDXReady(function(mdx) {

            var uniqueName = rec.get('hierarchy');
            var hierarchy = mdx.getHierarchy(uniqueName);

            if (!hierarchy) {
                var dim = mdx.getDimension(uniqueName);
                if (!dim) {
                    console.error('unable to determine sourcing dimension/hierarchy');
                }

                Ext.each(dim.hierarchies, function(hier) {
                    if (!hier.hidden) {
                        hierarchy = hier;
                        return false;
                    }
                });
            }

            //
            // Build Selections
            //
            var selections = [];
            Ext.each(records, function(rec) {
                selections.push({
                    hierarchy: hierarchy.uniqueName,
                    level: rec.get('levelUniqueName'),
                    members: [{ uniqueName: rec.get('uniqueName') }],
                    operator: hierarchy.defaultOperator,
                    isWhereFilter: hierarchy.filterType === 'WHERE'
                });
            });

            //
            // Apply Selections
            //
            if (selections.length > 0) {
                state.removePrivateSelection('hoverSelectionFilter');
                state.addSelection(selections, false, true, true);
                var v = this.getViewManager().getViewInstance('singleaxis');
                if (v) {
                    v.saview.showMessage('Hold Shift, CTRL, or CMD to select multiple');
                }
            }

        }, this);
    }
});
