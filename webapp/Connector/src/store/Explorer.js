/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Explorer', {

    extend: 'LABKEY.app.store.OlapExplorerImpl',

    subjectName: 'Subject',

    //Override
    //store members that user have access to
    setTotalHierarchyMembers: function(hierarchyUniqueName, cubeResult)
    {
        Connector.getQueryService().setUserHierarchyMembers(hierarchyUniqueName, cubeResult);
    },

    //Override
    //exclude members that the user doesn't have access to
    shouldIncludeMember: function(hierarchy, subPosition) {
        var hierarchyUniqName = hierarchy.getUniqueName(), levelUniquName = subPosition.level.uniqueName, memberName = subPosition.uniqueName;
        return Connector.getQueryService().isUserLevelAccessible(hierarchyUniqName, levelUniquName, memberName);
    },

    shouldCollapseDescendantsWithSameValue: function() {
        return true; //
    }

});
