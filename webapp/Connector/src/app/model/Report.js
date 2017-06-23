/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Report', {
    extend: 'Ext.data.Model',
    idProperty: 'reportId',
    labelProperty: 'name',
    fields: [
        {name : 'category'},
        {name : 'categorylabel',
            convert : function(v, record) {
                if (record && record.raw && record.raw.category)
                    return record.raw.category.label;
                return 0;
            }
        },
        {name : 'created', type: 'date'},
        {name : 'created_display'},
        {name : 'createdBy'},
        {name : 'createdByUserId', type: 'int'},
        {name : 'authorUserId',
            convert : function(v, record) {
                if (record && record.raw && record.raw.author)
                    return record.raw.author.userId;
                return 0;
            }
        },
        {name : 'authorDisplayName',
            convert : function(v, record) {
                if (record && record.raw && record.raw.author)
                    return record.raw.author.displayName;
                return '';
            }
        },
        {name : 'container'},
        {name : 'dataType'},
        {name : 'editable', type: 'boolean'},
        {name : 'editUrl'},
        {name : 'type'},
        {name : 'description'},
        {name : 'displayOrder', type: 'int'},
        {name : 'shared', type: 'boolean'},
        {name : 'visible', type: 'boolean'},
        {name : 'readOnly', type: 'boolean'},
        {name : 'icon'},
        {name : 'modified', type: 'date'},
        {name : 'modifiedBy'},
        {name : 'contentModified', type: 'date'},
        {name : 'refreshDate',  type: 'date'},
        {name : 'name'},
        {name : 'access', mapping: 'access.label'},
        {name : 'accessUrl', mapping: 'access.url'},
        {name : 'runUrl'},
        {name : 'hrefTarget', defaultValue: undefined, mapping: 'runTarget'},
        {name : 'detailsUrl'},
        {name : 'thumbnail'},
        {name : 'thumbnailType'},
        {name : 'href', mapping: 'runUrl'},
        {name : 'allowCustomThumbnail'},
        {name : 'status'},
        {name : 'reportId'}
    ]
});
