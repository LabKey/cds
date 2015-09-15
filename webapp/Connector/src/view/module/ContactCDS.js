/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ContactCDS', {

    xtype : 'module.contactcds',

    extend : 'Connector.view.module.BaseModule',

    // Replace with contact CDS team link
    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<div class="item-row">',
                '<a href=".">Contact the CAVD DataSpace team</a> for more information<br/>',
            '</div>',
            '<div class="item-row">',
                '<a href="https://portal.cavd.org/CAVDStudyProposals/Pages/RequestCSFServices.aspx" target="_blank">Request Central Service Facilities support for an ancillary study</a>',
            '</div>',
        '</tpl>')
});
