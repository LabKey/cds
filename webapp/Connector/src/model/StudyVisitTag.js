/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.StudyVisitTag', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'container_id'},
        {name: 'study_label'},
        {name: 'study_description'},
        {name: 'timepoint_type'},
        {name: 'group_name'},
        {name: 'visit_row_id'},
        {name: 'protocol_day'},
        {name: 'visit_label'},
        {name: 'sequence_num_min'},
        {name: 'sequence_num_max'},
        {name: 'visit_tag_name'},
        {name: 'visit_tag_caption'},
        {name: 'visit_tag_label'},
        {name: 'single_use'},
        {name: 'is_vaccination'},
        {name: 'is_challenge'},
        {name: 'group_label'},
        {name: 'detail_label'}
    ]
});
