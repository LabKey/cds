/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.StudyVisitTag', {

    extend : 'Ext.data.Store',

    model : 'Connector.model.StudyVisitTag',

    autoLoad: true,

    loading: true,

    loadStudyVisitTags : function(data)
    {
        if (data && data.rows)
        {
            this.removeAll();
            this.add(data.rows);

            this.loading = false;
            this.fireEvent('load', this);
        }
    },

    load : function()
    {
        this.loading = true;
        StudyUtils.initialize(function() {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'StudyVisitTagInfo',
                sort: 'container_id,protocol_day,group_name,visit_tag_name',
                success: this.loadStudyVisitTags,
                scope : this
            });
        }, this);
    }
});
