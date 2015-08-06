/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

        this.control('explorerheaderdataview', {
            afterrender : function(header) {
                this.on('dimension', function(dim) {
                    header.changeSelection(dim.name);
                });
            },
            select: this.onDimensionSelect
        });

        this.control('#sae-hierarchy-dropdown', {
            afterrender : function(dropdown) {
                this.on('dimension', function(dim, hIdx) {
                    dropdown.getStore().removeAll();

                    var hierarchies = [],
                            selected = undefined;

                    Ext.each(dim.hierarchies, function(hierarchy, idx) {
                        var model = Ext.create('Connector.model.Hierarchy', hierarchy);
                        if (!model.get('hidden')) {
                            if (idx == hIdx) {
                                selected = model;
                            }
                            hierarchies.push(model);
                        }
                    });

                    dropdown.getStore().add(hierarchies);
                    if (!Ext.isEmpty(hierarchies)) {
                        if (Ext.isDefined(selected)) {
                            dropdown.select(selected);
                        }
                        else {
                            console.warn('Did not find a hierarchy to select. Selecting first available...');
                            dropdown.select(hierarchies[0]);
                        }
                    }
                });
            },
            select: this.onHierarchySelect
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
                Connector.getState().addPrivateSelection({
                    hierarchy: rec.get('hierarchy'),
                    members: [{ uniqueName: rec.get('uniqueName') }]
                }, 'hoverSelectionFilter');
            }
            else {
                Connector.getState().removePrivateSelection('hoverSelectionFilter');
            }
        }, this);

        this.callParent();

        this.addEvents('dimension', 'hierarchy');
    },

    createView : function(xtype, context) {

        if (xtype == 'singleaxis') {
            var state = Connector.getState();
            var s = this.getStore('Explorer');
            s.olapProvider = state; // required by LABKEY.app.store.OlapExplorer. Blargh

            var v = Ext.create('Connector.view.SingleAxisExplorer', {
                flex : 3,
                ui : 'custom',
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

            v.on('boxready', function() { this.loadExplorerView(context); }, this, {single: true});

            return v;
        }
    },

    updateView : function(xtype, context) {
        this.loadExplorerView(context);
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

        // make the default the first hierarchy listed
        var context = {
            dimension: urlContext.length > 0 ? urlContext[0] : 'Study'
        };

        if (urlContext && urlContext.length > 1) {
            context.hierarchy = urlContext[1];
        }
        return context;
    },

    loadExplorerView : function(context) {
        Connector.getState().onMDXReady(function(mdx) {
            var dim = mdx.getDimension(context.dimension);
            if (dim) {

                var idx = -1;
                this.dim = dim;

                // Find the appropriate hierarchy index -- would be nice if this could just be a lookup
                if (context.hierarchy) {
                    var _h = dim.getHierarchies(),
                        h = dim.name.toLowerCase() + '.' + context.hierarchy.toLowerCase();

                    for (var i=0; i < _h.length; i++) {
                        if (_h[i].name.toLowerCase() == h) {
                            idx = i;
                            break;
                        }
                    }
                }

                if (idx == -1) {
                    // Use the summaryTargetLevel to determine default hierarchy
                    var level = mdx.getLevel(dim.summaryTargetLevel);
                    if (level) {
                        Ext.each(dim.getHierarchies(), function(hier, i) {
                            if (hier.uniqueName === level.hierarchy.uniqueName) {
                                idx = i;
                                return false;
                            }
                        });
                    }
                }

                if (idx != -1) {
                    this.fireEvent('dimension', dim, idx);
                }
                else {
                    alert('Failed:' + context.dimension);
                }
            }
            else {
                alert('Failed:' + context.dimension);
            }
        }, this);
    },

    // fired when the dimension is changed via the menu
    onDimensionSelect : function(m, summaryModel /* Connector.model.Summary */) {
        this.goToExplorer(summaryModel.get('dimName'), null);
    },

    // fired when the hierarchy is changed via the menu
    onHierarchySelect : function(m, models) {
        if (!Ext.isEmpty(models)) {
            var model = models[0], dimName = this.dim.name;
            Connector.getState().onMDXReady(function(mdx) {
                var hierarchy = mdx.getHierarchy(model.get('uniqueName'));
                if (Ext.isObject(hierarchy)) {
                    this.goToExplorer(dimName, hierarchy.name.split('.')[1]);
                }
            }, this);
        }
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
        if (this.allowHover && Connector.getState().getSelections().length == 0) {
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

    afterSelectionAnimation : function(view, rec) {
        var records = view.getSelectionModel().getSelection();
        var state = Connector.getState();

        if (records.length == 0)
            return;

        state.onMDXReady(function(mdx) {

            var uniqueName = rec.get('hierarchy');
            var hierarchy = mdx.getHierarchy(uniqueName);

            if (!hierarchy) {
                var dim = mdx.getDimension(uniqueName);
                if (!dim) {
                    throw 'unable to determine sourcing dimension/hierarchy';
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
            var members = [],
                levelUniqueName;
            Ext.each(records, function(rec) {
                members.push({
                    uniqueName: rec.get('uniqueName')
                });

                // TODO: It'd be better to choose the most specific level
                levelUniqueName = rec.get('levelUniqueName');
            });

            var selection = {
                hierarchy: hierarchy.uniqueName,
                members: members,
                operator: hierarchy.defaultOperator,
                isWhereFilter: hierarchy.filterType === 'WHERE'
            };

            if (levelUniqueName) {
                selection.level = levelUniqueName;
            }

            //
            // Apply Selections
            //
            state.removePrivateSelection('hoverSelectionFilter');
            state.setSelections([selection]);
            var v = this.getViewManager().getViewInstance('singleaxis');
            if (v) {
                v.saview.showMessage('Hold Shift, CTRL, or CMD to select multiple');
            }

        }, this);
    }
});
