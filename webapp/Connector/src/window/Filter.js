Ext.define('Connector.window.Filter', {

    extend: 'Ext.window.Window',

    requires: ['Connector.model.ColumnInfo', 'Ext.form.field.ComboBox'],

    alias: 'widget.rawdatafilterwin',

    ui: 'custom',
    cls: 'filterwindow',
    modal: true,
    width: 340,
    autoShow: true,
    draggable: false,
    closable: false,
    bodyStyle: 'margin: 8px;',

    initComponent : function() {

        if (!this.col) {
            console.error('\'col\' value must be provided to instantiate a', this.$className);
            return;
        }

        var trigger = Ext.get(this.col.triggerEl);
        if (trigger) {
            trigger.show();
            var box = trigger.getBox();

            Ext.apply(this, {
                x: box.x - 52,
                y: box.y + 35
            });
        }

        Ext.apply(this, {
            store       : this.rawDataView.store,
            boundColumn : this.rawDataView.getColumnMetadata(this.col.dataIndex)
        });

        this.items = this.getItems();

        this.buttons =  [{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text  : 'OK',
            width : 70,
            handler: this.applyFiltersAndColumns,
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Cancel',
            width : 70,
            handler : this.close,
            scope : this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear Filters',
            width : 80,
            handler : function () {
                var fieldKeyPath = this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKeyPath;

                this.store.filterArray = LABKEY.Filter.merge(this.store.filterArray, fieldKeyPath, null);
                this.store.load();
                this.rawDataView.removeGridFilter(fieldKeyPath);
                this.close();
            },
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear All',
            width : 70,
            handler : function() {
                this.clearAll();
                this.close();
            },
            scope : this
        }];

        this.callParent(arguments);

        this.addListener('afterrender', this.onAfterRender, this);
    },

    onAfterRender : function () {
        var keymap = new Ext.util.KeyMap(this.el, [
            {
                key  : Ext.EventObject.ENTER,
                fn   : this.applyFiltersAndColumns,
                scope: this
            },{
                key  : Ext.EventObject.ESC,
                fn   : this.close,
                scope: this
            }
        ]);
    },

    clearAll : function() {
        this.store.filterArray = [this.store.filterArray[0]];
        this.store.load();
        this.rawDataView.removeAllFilters();
    },

    getItems : function () {

        var items = [{
            xtype : 'box',
            autoEl : {
                tag  : 'div',
                html : this.col.text,
                cls  : 'filterheader'
            }
        }];

        if (this.boundColumn.description) {
            items.push({xtype:'box', autoEl : {tag: 'div', cls:'x-body', html:Ext.htmlEncode(this.boundColumn.description)}});
        }

        items.push({
            xtype       : 'labkey-default-filterpanel',
            boundColumn : this.boundColumn,
//            title       : 'Filter',
//            ui          : 'custom',
            filterArray : this.store.filterArray,
//            style       : 'padding-bottom: 8px',
            schemaName  : this.rawDataView.queryMetadata.schemaName,
            queryName   : this.rawDataView.queryMetadata.queryName
        });

        if (null != this.boundColumn.lookup) {
            items.push({
                xtype   : 'grid',
                selType : 'checkboxmodel',
                title   : 'Show Detail Columns',
                selModel: { mode:'MULTI' },
                store   : this.getLookupColumnStore(),
                ui      : 'custom',
                cls     : 'lookupcols',
                columns : [{
                    header    : 'Detail Columns',
                    dataIndex : 'shortCaption',
                    width     : 320
                }],
                height  : 200,
                width   : 320,
                style   : 'padding-bottom:10px',
                hideHeaders : true,
                listeners : {
                    viewready : function() {
                        var selectedCols = this.rawDataView.foreignColumns[this.boundColumn.name];
                        if (!selectedCols || selectedCols.length == 0) {
                            return;
                        }

                        this.getLookupGrid().getSelectionModel().select(selectedCols);
                    },
                    scope:this
                }
            });
        }

        return items;
    },

    getLookupGrid : function () {
        return this.down('grid');
    },

    getLookupColumnStore : function () {
        if (!this.boundColumn.lookup) {
            return null;
        }

        var storeId = "fkColumns-" + this.boundColumn.lookup.schemaName + "-" + this.boundColumn.lookup.queryName + "-" + this.boundColumn.fieldKey;
        var store = Ext.getStore(storeId);
        if (null != store) {
            return store;
        }

        var url = LABKEY.ActionURL.buildURL("query", "getQueryDetails", null, {
            queryName  : this.store.queryName,
            schemaName : this.store.schemaName,
            fk         : this.boundColumn.fieldKey
        });

        var displayColFieldKey = this.boundColumn.fieldKey + "/" + this.boundColumn.lookup.displayColumn;
        return Ext.create('Ext.data.Store', {
            model   : 'Connector.model.ColumnInfo',
            storeId : storeId,
            proxy   : {
                type   : 'ajax',
                url    : url,
                reader : {
                    type:'json',
                    root:'columns'
                }
            },
            filterOnLoad: true,   //Don't allow user to select hidden cols or the display column (because it is already being displayed)
            filters: [function(item) {return !item.raw.isHidden && item.raw.name != displayColFieldKey;}],
            autoLoad:true
        });
    },

    applyColumns : function () {
        if (!this.boundColumn.lookup)
            return false;

        var lookupGrid = this.getLookupGrid(),
                selections = lookupGrid.getSelectionModel().selected,
                oldColumns = this.rawDataView.foreignColumns[this.boundColumn.name],
                newColumns = [];

        selections.each(function(item, idx) {
            newColumns.push(item);
        }, this);

        var columnListChanged = !this.equalColumnLists(oldColumns, newColumns);
        if (columnListChanged) {
            this.rawDataView.foreignColumns[this.boundColumn.name] = newColumns;
            this.rawDataView.updateAppliedColumns(newColumns, oldColumns);
        }

        return columnListChanged;
    },

    applyFilters : function () {
        var filterPanel = this.down('labkey-default-filterpanel');
        if (filterPanel.isValid()) {
            var colFilters = filterPanel.getFilters();
            this.store.filterArray = LABKEY.Filter.merge(this.store.filterArray, this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKey, colFilters);
            return true;
        }
        else {
            Ext.window.Msg.alert("Please fix errors in filter.");
            return false;
        }
    },

    applyFiltersAndColumns : function () {
        if (this.applyFilters()) {
            var columnListChanged = this.applyColumns();
            if (columnListChanged) {
                this.rawDataView.refreshGrid(this.rawDataView.queryMetadata, this.rawDataView.measures, this.rawDataView.queryPtids);
            }
            else {
                this.store.load();
            }
            this.rawDataView.translateGridFilter();

            this.ppx = this.getPosition();
            this.close();
        }
    },

    equalColumnLists : function(oldCols, newCols) {
        oldCols = oldCols || [];
        newCols = newCols || [];

        if (oldCols.length != newCols.length) {
            return false;
        }

        for (var i = 0; i < newCols.length; i++) {
            if (newCols[i].get("fieldKeyPath") != oldCols[i].get("fieldKeyPath")) {
                return false;
            }
        }

        return true;
    }
});