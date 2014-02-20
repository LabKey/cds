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
     * Complex comparator that says two filters are equal if and only if they match on the following:
     * - isGroup, isGrid, isPlot, hierarchy, member length, and member set (member order insensitive)
     * @param f - Filter to compare this object against.
     */
    isEqual : function(f) {
        var eq = false;

        if (Ext.isDefined(f) && Ext.isDefined(f.data)) {
            var d = this.data;
            var fd = f.data;

            eq = (d.isGroup == fd.isGroup) && (d.isGrid == fd.isGrid) &&
                 (d.isPlot == fd.isPlot) && (d.hierarchy == fd.hierarchy) &&
                 (d.members.length == fd.members.length);

            if (eq) {
                // member set equivalency
                var keys = {}, uname, key, sep, m, u;
                for (m=0; m < d.members.length; m++) {
                    uname = d.members[m].uname; key = ''; sep = '';
                    for (u=0; u < uname.length; u++) {
                        key += sep + uname[u];
                        sep = ':::';
                    }
                    keys[key] = true;
                }

                for (m=0; m < fd.members.length; m++) {
                    uname = fd.members[m].uname; key = ''; sep = '';
                    for (u=0; u < uname.length; u++) {
                        key += sep + uname[u];
                        sep = ':::';
                    }
                    if (!Ext.isDefined(keys[key])) {
                        eq = false;
                        break;
                    }
                }
            }
        }

        return eq;
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
