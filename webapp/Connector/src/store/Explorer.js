/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Explorer', {

    extend: 'LABKEY.app.store.OlapExplorer',

    subjectName: 'Subject',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('selectrequest', 'subselect');
    },

    setEnableSelection : function(enableSelection) {
        this.enableSelection = enableSelection;
    },

    clearSelection : function() {
        if (this.enableSelection) {
            this.suspendEvents();
            var recs = this.queryBy(function(rec, id){
                rec.set('subcount', 0);
                return true;
            }, this);
            this.resumeEvents();
            this.fireEvent('subselect', recs.items);
        }
    },

    loadSelection : function(useLast) {
        if (this.enableSelection) {
            // asks for the subselected portion
            var me = this;

            me.suspendEvents();

            me.mflight++;
            me.mdx.query({
                onRows : [{
                    hierarchy: me.dim.getHierarchies()[this.hIndex].getName(),
                    members: 'members'
                }],
                useNamedFilters: ['stateSelectionFilter', 'hoverSelectionFilter', 'statefilter'],
                mflight: me.mflight,
                showEmpty: me.showEmpty,
                success: this.selectionSuccess,
                scope : this
            });
        }
    },

    selectionSuccess : function(cellset, mdx, x) {
        var me = this;
        if (x.mflight != me.mflight) {
            // There is a more recent selection request -- discard
            return;
        }

        if ((!me.mdx._filter['stateSelectionFilter'] || me.mdx._filter['stateSelectionFilter'].length == 0) &&
                (!me.mdx._filter['hoverSelectionFilter'] || me.mdx._filter['hoverSelectionFilter'].length == 0))
        {
            me.clearSelection();
            return false;
        }

        var recs = me.queryBy(function(rec, id) {

            var updated = false, cellspan_value = 0, label; // to update rows not returned by the query
            for (var c=0; c < cellset.cells.length; c++)
            {
                label = (rec.data.label == 'Unknown' ? '#null' : rec.data.label);
                if (label == cellset.cells[c][0].positions[1][0].name)
                {
                    updated = true;
                    rec.set('subcount', cellset.cells[c][0].value);
                }
                else
                {
                    if(cellset.cells[c][0].value > 0) {
                        cellspan_value++;
                    }
                }
            }
            if (!updated)
            {
                rec.set('subcount', 0);
            }
            return true;

        });

        me.resumeEvents();
        me.fireEvent('subselect', recs.items ? recs.items : []);
    }
});
