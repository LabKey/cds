Ext.define('Connector.grid.Panel', {
//    extend: 'LABKEY.ext4.GridPanel',
    extend: 'Ext.grid.Panel',

    alias: 'widget.connector-gridpanel',

    getColumnsConfig : function() {

        var columns = this.callParent();

        for (var i=0; i < columns.length; i++) {
            columns[i].width = 100;
        }

        // Split columns into groups
        var groups = [];

        // A special group of recognized columns
        var studyTime = [], remainder = [];
        var studyCols = {
            subjectid: true,
            study: true,
            startdate: true,
            visitdate: true
        };
        Ext.each(columns, function(col) {
            var dataIndex = col.dataIndex.split('_');
            var colName = dataIndex[dataIndex.length-1].toLowerCase();

            if (studyCols[colName]) {
                studyTime.push(col);
            }
            else {
                remainder.push(col);
            }

        }, this);
        groups.push({
            text: 'Study and time',
            columns: studyTime
        });

        // All other groups based on query name
        var groupMap = {};
        Ext.each(remainder, function(col) {
            var queryName = col.dataIndex.split('_')[1];

            if (Ext.isDefined(queryName)) {
                if (!groupMap[queryName]) {
                    groupMap[queryName] = [];
                }

                groupMap[queryName].push(col);
            }
        }, this);

        Ext.iterate(groupMap, function(key, value) {
            var group = {
                text: key,
                columns: value
            };
            groups.push(group);
        }, this);

        return groups;
    }
});