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
            afterrender : function(m) {
                var summaryControl = this.application.getController('Summary');
                if (summaryControl) {
                    var s = summaryControl.getSummaryStore();
                    if (s.getCount() > 0) {
                        m.show();
                    }
                    else {
                        s.load();
                    }
                }
            },
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

                    var name = '';
                    for (var d=0; d < h.length; d++) {
                        name = h[d].name.split('.')[1];
                        if (name) {
                            m.add({
                                text : h[d].name.split('.')[1],
                                hierarchyIndex : d
                            });
                        }
                    }
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

    getDefaultView : function() {
        return 'singleaxis';
    },

    parseContext : function(urlContext) {
        var context = {
            dimension: urlContext.length > 0 ? urlContext[0] : 'Study' // make the default the first hierarchy listed
        };
        if (urlContext && urlContext.length > 1) {
            context.hierarchy = urlContext[1];
        }
        return context;
    },

    /**
     * Called whenever this controller would like to update the URL itself.
     * NOTE: This should only be called from internal cases where external navigation has not been
     * used. This will avoid history stacking (i.e. browser back doing nothing)
     */
    updateURL : function() {
        var vm = this.getViewManager();
        var control = 'explorer';
        var view = 'singleaxis';
        var viewContext = [];

        if (this.dim) {
            viewContext.push(this.dim.name);
            if (this.hierarchy) {
                var name = this.hierarchy.name.split('.');
                viewContext.push(name[name.length-1]);
            }
        }

        vm.updateHistory(control, view, viewContext);
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
        var state = this.getStateManager();

        state.onMDXReady(function(mdx) {
            var context = {
                dimension: item.rec.data.hierarchy.split('.')[0]
            };
            this.loadExplorerView(context, null);
        }, this);

        this.updateURL();
    },

    // fired when the hierarchy is changed via the menu
    onHierarchySelect : function(m, item) {
        this.hierarchy = this.dim.hierarchies[item.hierarchyIndex];
        this.updateURL();
        this.fireEvent('hierarchy', item.hierarchyIndex);
    },

    onExplorerEnter : function(view, rec) {
        if (!view.loadLock) {
            this._hoverHelper(view, rec, true);
        }
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

    runSelectionAnimation : function(view, rec, node, callback, scope) {

        this.allowHover = false;

        // Determine which animation end point is best
        var target = Ext.DomQuery.select('.selectionpanel'), targetTop = false, found = false, box;
        if (Ext.isArray(target) && target.length > 0) {
            var el = Ext.get(target[0]);
            if (el.isVisible()) {
                // use the selection panel
                targetTop = true;
                found = true;
                box = el.getBox();
            }
        }

        if (!found) {
            target = Ext.DomQuery.select('.filterpanel');
            if (Ext.isArray(target) && target.length > 0) {
                var el = Ext.get(target[0]);
                if (el.isVisible()) {
                    // use the filter panel
                    found = true;
                    box = el.getBox();
                }
            }
        }

        // Visibile doesn't necessarily work...
        if (found && (box.x == 0 || box.y == 0)) {
            found = false;
        }

        if (found) {
            var child = Ext.get(node).child('span.barlabel'), cbox = child.getBox();

            // Create DOM Element replicate
            var dom = document.createElement('span');
            dom.innerHTML = child.dom.innerHTML;
            dom.setAttribute('class', 'barlabel selected');
            dom.setAttribute('style', 'width: ' + (child.getTextWidth()+20) + 'px; left: ' + cbox[0] + 'px; top: ' + cbox[1] + 'px;');

            // Append to Body
            var xdom = Ext.get(dom);
            xdom.appendTo(Ext.getBody());

            var y = box.y + 30;
            if (!targetTop) {
                y += box.height;
            }

            xdom.animate({
                to : {
                    x: box.x,
                    y: y,
                    opacity: 0.2
                },
                duration: 1000, // Issue: 15220
                listeners : {
                    afteranimate : function() {
                        Ext.removeNode(xdom.dom);
                        this.allowHover = true;
                    },
                    scope: this
                },
                scope: this
            });
        }

        if (callback) {
            var task = new Ext.util.DelayedTask(callback, scope, [view, rec, node]);
            task.delay(found ? 500 : 0);
        }
    },

    afterSelectionAnimation : function(view, rec, node) {
        var records = view.getSelectionModel().getSelection();

        var selections = [];
        Ext.each(records, function(rec) {
            selections.push({
                hierarchy: rec.get('hierarchy'),
                members: [{ uniqueName: rec.get('uniqueName') }],
                isGroup: rec.get('isGroup')
            });
        });

        if (selections.length > 0) {
            this.getStateManager().removePrivateSelection('hoverSelectionFilter');
            this.getStateManager().addSelection(selections, false, true, true);
            var v = this.getViewManager().getViewInstance('singleaxis');
            if (v) {
                v.saview.showMessage('Hold Shift, CTRL, or CMD to select multiple');
            }
        }
    }
});
