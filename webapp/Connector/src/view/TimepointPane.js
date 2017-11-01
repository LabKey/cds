/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TimepointPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: true,

    isShowOperator: false,

    displayTitle: 'Time points in the plot',

    statics: {
        getExportableFilterStrings : function (filter)
        {
            var filterDisplayString = filter.get("filterDisplayString").replace("Time points:", "");
            return ["Time points " + ChartUtils.ANTIGEN_LEVEL_DELIMITER + filterDisplayString];
        }
    },

    updateSelections : function()
    {
        var grid = this.getGrid();

        if (Ext.isDefined(this.getModel().getFilterVisitRowIds()))
        {
            grid.getSelectionModel().select(grid.getStore().query('selected', true).items, false /* keepExisting */, true /* suppressEvents */);
        }
        else
        {
            grid.getSelectionModel().selectAll(true /* suppressEvents */);
        }

        grid.fireEvent('selectioncomplete', this);
    }
});