Ext.define('Connector.panel.FilterPanel', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.filterpanel',

    ui: 'custom',

    preventHeader: true,

    cls: 'filterpanel',

    selectionMode: false,

    hideOnEmpty: false,

    constructor : function(config) {
        Ext.define('Filter', {
            extend : 'Ext.data.Model',
            fields : ['filterId', 'label', 'member', 'uname']
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [this.initHeader()];

        var tbar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'bottom',
            ui: 'footer',
            width: 230,
            items: this.tbarButtons
        });

        this.dockedItems = [tbar];

        this.callParent();
    },

    initHeader : function() {
        return Ext.create('Ext.Component', {
            autoEl : {
                tag : 'div',
                cls : 'header',
                html: this.title
            },
            scope : this
        });
    },

    createEmptyPanel : function() {
        return Ext.create('Ext.container.Container', {
            html : '<div class="emptytext">All subjects</div>'
        });
    },

    createHierarchyFilter : function(filterset) {
        return Ext.create('Connector.panel.HierarchyFilter', {
            filterset : filterset,
            selectionMode : this.selectionMode
        });
    },

    // entry point to load raw OLAP Filters
    loadFilters : function(filters) {
        this.displayFilters(filters);
    },

    displayFilters : function(filters) {
        this.removeAll();
        this.add(this.initHeader());
        var panels = [];

        for (var f=0; f < filters.length; f++) {
            panels.push(this.createHierarchyFilter(filters[f]));
        }

        if (panels.length > 0)
        {
            if (this.hideOnEmpty)
                this.show();
            this.add(panels);
        }
        else if (this.hideOnEmpty)
            this.hide();
        else
            this.add(this.createEmptyPanel());
    }
});

Ext.define('Connector.panel.SelectionPanel', {
    extend: 'Connector.panel.FilterPanel',
    alias: 'widget.selectionpanel',
    selectionMode: true,
    hideOnEmpty: true
});

Ext.define('Connector.panel.HierarchyFilter', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.hierarchyfilter',

    ui: 'custom',

    cls: 'hierfilter',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('clearhierarchy', 'operatorchange', 'removefilter');
    },

    initComponent : function() {

        // TODO: Cleaning up Hierarchy Filter to show Group
        this.groupMode = this.filterset.isGroup();

        Ext.applyIf(this, {
            border : false,
            frame  : false,
            height : (this.groupMode || this.filterset.data.isGrid ? 1 : this.filterset.getMembers().length) * 20,
            width  : 250,
            layout : {
                type : 'hbox',
                pack : 'start',
                align: 'stretch'
            }
        });

        this.items = [this.initViewContainer(), this.getFilterView()];

        this.callParent();
    },

    initViewContainer : function() {
        if (this.viewContainer)
            return this.viewContainer;

        this.viewContainer = Ext.create('Ext.Container', {
            layout : {
                type : 'vbox',
                align: 'stretch'
            },
            flex   : 1.4,
            items  : [this.getHierarchyLabel()]
        });

        return this.viewContainer;
    },

    getFilterView : function() {
        if (this.filterView)
            return this.filterView;

        var data = [], rec = {}, u;
        if (this.groupMode) {
            rec.label = this.filterset.getName();
            rec.filterId = this.filterset.id;

            data.push(rec);
        }
        else if (this.filterset.data.isGrid) {
            rec.label = this.filterset.getGridLabel();
            rec.filterId = this.filterset.id;

            data.push(rec);
        }
        else {
            var members = this.filterset.getMembers();
            for (var f=0; f < members.length; f++) {

                rec = {}; u = members[f].uname;

                rec.label = u[u.length-1];
                rec.member = rec.label;
                rec.uname = u;
                rec.filterId = this.filterset.id;
                rec.operator = this.filterset.operator;

                data.push(rec);
            }
        }

        var store = Ext.create('Ext.data.Store', {
            model : 'Filter',
            data  : data
        });

        var viewTpl = new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="filtermember">{label:this.renderLabel}<img height="12" width="12" src="{.:this.imgPath}" alt="delete"></div>',
                '</tpl>'
        );

        viewTpl.imgPath = function() { return LABKEY.contextPath + '/_images/partdelete.gif'; }

        viewTpl.renderLabel = function(val) {
            if (val == '#null')
                return 'Unknown';
            return Ext.String.ellipsis(val, 16, false);
        };

        this.filterView = Ext.create('Ext.view.View', {
            tpl : viewTpl,
            itemSelector : 'div.filtermember',
            store : store,
            flex  : 2,
            listeners : {
                itemclick : function(view, rec) {
                    this.fireEvent('removefilter', rec.data.filterId, this.getHierarchyName(), rec.data.uname, this.selectionMode);
                },
                scope : this
            },
            scope : this
        });

        return this.filterView;
    },

    getHierarchyLabel : function() {

        var ops = Connector.Filter.Operators;
        var operator = ops.INTERSECT;

        if (!this.groupMode) {
            operator = this.filterset.getOperator();
        }

        var html = '<div class="circle"></div><span class="hierarchylabel">' + this.getHierarchyName() +':</span>';
        var extra = '';

        if (!this.filterset.data.isGrid) {
            var selector = '<div class="opselect">' +
                    '<select>' +
                    '<option value="' + ops.INTERSECT + '"' + ((operator == ops.INTERSECT) ? ' selected="selected"' : '') + '>AND</option>' +
                    '<option value="' + ops.UNION + '"' + ((operator == ops.UNION) ? ' selected="selected"' : '') + '>OR</option>' +
                    '</select>' +
                    '</div>';
            var selected = '<div class="showopselect">' + ((operator == ops.UNION) ? 'OR' : 'AND') +'</div>';
            extra = selector + selected;
        }

        return Ext.create('Ext.Container', {
            html : html + extra,
            listeners : {
                afterrender : function(c) {
                    var me = this;
                    var selectEl = c.getEl().select('select');
                    selectEl.on('change', function(evt, el) {
                        var displayEl = c.getEl().select('div.showopselect');
                        var value = selectEl.elements[0].value;
                        displayEl.update((value == ops.INTERSECT ? 'AND' : 'OR'));
                        me.onOperatorChange(evt, el);
                    }, this);
                },
                scope : this
            },
            scope : this
        });
    },

    onOperatorChange : function(evt, el) {

        this.fireEvent('operatorchange', {
            filterId : this.getFilterView().getStore().getAt(0).data.filterId,
            value : Ext.get(el).getValue()
        });

    },

    getHierarchyName : function() {
        if (this.groupMode) {
            return 'Group';
        }

        if (this.filterset.data.isGrid) {
            return this.filterset.getGridHierarchy();
        }

        var names = this.filterset.getHierarchy().split('.');

        // TODO: These special cases need to be moved to into the hierarchy definition
        if (names[0] == 'Participant') {
            if (names[1])
                return names[1];
            return names[0];
        }

        if (this.filterset.data.isGroup) {
            if (names[1] == 'Vaccine Insert') {
                return 'Vac Insert';
            }
            if (names[0] == 'Vaccine' && names[1] == 'Type') {
                return 'Vac Type';
            }
            if (names[1] == 'Methodology') {
                return 'Method';
            }
            if (names[1] == 'Sample Type') {
                return 'Sample';
            }
            return names[1];
        }

        if (names[0] == 'Vaccine Component') {
            return 'Protein';
        }
        return names[0];
    }
});
