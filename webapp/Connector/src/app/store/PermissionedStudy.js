Ext.define('Connector.app.store.PermissionedStudy', {

    loadAccessibleStudies: function(cb, scope)
    {
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'study',
            success:  function(studyData) {
                this.accessibleStudies = {};
                Ext.each(studyData.rows, function(study){
                    this.accessibleStudies[study.study_name] = true;
                }, this);
                if (Ext.isFunction(cb))
                    cb.call(scope);
            },
            scope: this
        });
    }

});