/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Explorer', {

    extend: 'LABKEY.app.store.OlapExplorer',

    subjectName: 'Subject',

    //Override
    //store members that user have access to
    setTotalHierarchyMembers: function(hierarchyUniqueName, cubeResult)
    {
        Connector.getQueryService().setUserHierarchyMembers(hierarchyUniqueName, cubeResult);
    },

    //Override
    //exclude members that the user doesn't have access to
    shouldIncludeMember: function(hierarchyUniqName, levelUniquName, memberName) {
        return Connector.getQueryService().isUserLevelAccessible(hierarchyUniqName, levelUniquName, memberName);
    }

});
