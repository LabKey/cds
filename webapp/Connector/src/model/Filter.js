Ext.define('Connector.model.Filter', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'id'},
        {name : 'hierarchy'},
        {name : 'members'},
        {name : 'operator'},
        {name : 'isGroup', type: 'boolean'},
        {name : 'isGrid', type: 'boolean'},
        {name : 'isPlot', type: 'boolean'},
        {name : 'gridFilter'}, // instance of LABKEY.Filter
        {name : 'plotMeasures'}, // array of measures
        {name : 'plotScales'} // array of scales
    ],

    statics : {
        getGridHierarchy : function(data) {
            if (data['gridFilter']) {
                if (!Ext.isFunction(data['gridFilter'].getColumnName))
                {
                    console.warn('invalid filter object being processed.');
                    return 'Unknown';
                }
                var label = data['gridFilter'].getColumnName().split('/');

                // check lookups
                if (label.length > 1) {
                    label = label[label.length-2];
                }
                else {
                    // non-lookup column
                    label = label[0];
                }

                label = label.split('_');
                return Ext.String.ellipsis(label[label.length-1], 9, false);
            }
            return 'Unknown';
        },

        getGridLabel : function(data) {
            if (data['gridFilter']) {
                var gf = data.gridFilter;
                if (!Ext.isFunction(gf.getFilterType))
                {
                    console.warn('invalid label being processed');
                    return 'Unknown';
                }
                return Connector.model.Filter.getShortFilter(gf.getFilterType().getDisplayText()) + ' ' + gf.getValue();
            }
            return 'Unknown';
        },

        getShortFilter : function(displayText) {
            switch (displayText) {
                case "Does Not Equal":
                    return '!=';
                case "Equals":
                    return '=';
                case "Is Greater Than":
                    return '>';
                case "Is Less Than":
                    return '<';
                case "Is Greater Than or Equal To":
                    return '>=';
                case "Is Less Than or Equal To":
                    return '<=';
                default:
                    return displayText;
            }
        }
    },

    getOlapFilter : function() {
        return LABKEY.app.controller.Filter.getOlapFilter(this.data);
    },

    getDisplayHierarchy : function() {
        var h = this.getHierarchy().split('.');

        // Simple hierarchy (e.g. 'Study')
        if (h.length == 1) {
            return h[0];
        }

        if (this.data.isGroup) {
            return h[1];
        }

        // Issue 15380
        if (h[0] == 'Participant') {
            return h[1];
        }
        return h[0];
    },

    getHierarchy : function() {
        return this.get('hierarchy');
    },

    getMembers : function() {
        return this.get('members');
    },

    removeMember : function(memberUname) {

        // Allow for removal of the entire filter if a uname is not provided
        if (!memberUname) {
            return [];
        }

        var newMembers = [];
        for (var m=0; m < this.data.members.length; m++) {
            if (memberUname != this.data.members[m].uname)
            {
                newMembers.push(this.data.members[m]);
            }
        }
        return newMembers;
    },

    /**
     * Simple comparator that says two filters are equal if they share the same hierarchy, have only 1 member, and the member
     * is equivalent
     * @param f - Filter to compare this object against.
     */
    isEqualAsFilter : function(f) {
        var d = this.data;
        if ((d && f.data) && (d.hierarchy == f.data.hierarchy)) {
            if (d.members.length == 1 && f.data.members.length == 1) {
                if (d.members[0].uname[d.members[0].uname.length-1] == f.data.members[0].uname[f.data.members[0].uname.length-1]) {
                    return true;
                }
            }
        }
        return false;
    },

    isGrid : function() {
        return this.get('isGrid');
    },

    isPlot : function() {
        return this.get('isPlot');
    },

    getGridHierarchy : function() {
        return Connector.model.Filter.getGridHierarchy(this.data);
    },

    getGridLabel : function() {
        return Connector.model.Filter.getGridLabel(this.data);
    },

    /**
     * Returns abbreviated display value. (E.g. 'Equals' returns '=');
     * @param displayText - display text from LABKEY.Filter.getFilterType().getDisplayText()
     */
    getShortFilter : function(displayText) {
        return Connector.model.Filter.getShortFilter(displayText);
    },

    isGroup : function() {
        return false;
    },

    getValue : function(key) {
        return this.data[key];
    }
});
