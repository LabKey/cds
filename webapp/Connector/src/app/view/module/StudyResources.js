/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyResources', {

    xtype : 'app.module.studyresources',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<h3>{title_study_resources:htmlEncode}</h3>',

            '<div class="item-row">',
                'Contact the <a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information" onclick="Connector.controller.Analytics.onMailRequest();" target="_blank">DataSpace team</a> for more information<br/>',
            '</div>',
            '<tpl if="network == \'CAVD\'">',
            '<div class="item-row">',
            'Request <a href="https://portal.cavd.org/CAVDStudyProposals/Pages/RequestCSFServices.aspx" target="_blank">Central Service Facilities support</a> for an ancillary study',
            '</div>',
            '</tpl>',
            '<tpl if="network == \'HVTN\'">',
            '<div class="item-row">',
            'Submit <a href="http://www.hvtn.org/en/science/submit-idea-proposal.html" target="_blank">research proposal or idea</a> to HVTN',
            '</div>',
            '</tpl>',
            '<tpl if="atlas_link">',
                '<div class="item-row">',
                'View this study in <a href="{atlas_link}" target="_blank">ATLAS <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
            '<tpl if="cavd_link">',
                '<div class="item-row">',
                'View this study on the <a href="{cavd_link}" target="_blank">CAVD Portal <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
            '<tpl if="clintrials_id && species == \'Human\'"]}>',
                '<div class="item-row">',
                'View this study on <a href=" https://clinicaltrials.gov/show/{clintrials_id}" target="_blank">clintrials.gov <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
            '<tpl if="study_specimen_repository">',
                '<div class="item-row">',
                    'View research <a href="http://www.specimenrepository.org/RepositorySite/search/replaySearch?study={study_specimen_repository}" target="_blank">specimens in repository <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/><br/>',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),
    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title_study_resources'] = this.initialConfig.data.title;
        this.update(data);
    }
});
