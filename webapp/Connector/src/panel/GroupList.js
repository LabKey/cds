Ext.define('Connector.panel.GroupList', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.grouplist',

    cls: 'grouplist',

    plain: true,

    ui: 'custom',

    initComponent : function() {

        this.items = [this.getGroupListView()];

        this.callParent();
    },

    getGroupListView : function() {
        if (this.grouplist)
            return this.grouplist;

        this.grouplist = Ext.create('Connector.view.GroupListView', {
            arrow: this.arrow
        });

        return this.grouplist;
    }
});

Ext.define('Connector.view.GroupListView', {

    extend: 'Ext.view.View',

    alias: 'widget.grouplistview',

    trackOver: true,

    emptyText: '<div class="emptytext"><span class="left-label">No groups defined</span>',

    cls: 'grouplist-view',

    overItemCls: 'grouplist-label-over',

    itemSelector: 'div.nav-label',

    initComponent : function() {

        this.selectedItemCls = 'grouplist-label-selected '+ this.arrow;

        this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="nav-label">',
                    '{label:this.renderContent}',
                '</div>',
            '</tpl>'
        );

        this.tpl.renderContent = function(val) {
            return val;
//            var ret = '';
//            if (me.arrow == 'left'){
//                ret += '<span class="' + me.arrow +'-arrow"></span>';
//                ret += '<span class="right-label">' + Ext.String.ellipsis(Ext.htmlEncode(val), 20) + '</span>';
//            } else if (me.arrow == 'right'){
//                ret += '<span class="left-label">' + Ext.String.ellipsis(Ext.htmlEncode(val), 20) + '</span>';
//                ret += '<span class="' + me.arrow +'-arrow"></span>';
//            }
//            return ret;
        };

        // models Participant Groups and Cohorts mixed
        Ext.define('LABKEY.study.GroupCohort', {
            extend : 'Ext.data.Model',
            fields : [
                {name : 'id'},
                {name : 'label'},
                {name : 'description'},
                {name : 'filters'},
                {name : 'type'}
            ]
        });

        var storeConfig = {
            pageSize : 100,
            model    : 'LABKEY.study.GroupCohort',
            autoLoad : true,
            proxy    : {
                type   : 'ajax',
                url    : LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api'),
                reader : {
                    type : 'json',
                    root : 'groups'
                }
            },
            listeners : {
                load : function(s, recs) {
                    for (var i=0; i < recs.length; i++)
                    {
                        if (recs[i].data.id < 0)
                            s.remove(recs[i]);
                    }
                }
            }
        };

        var groupConfig = Ext.clone(storeConfig);
        Ext.apply(groupConfig.proxy, {
            extraParams : { type : 'participantGroup'}
        });

        this.store = Ext.create('Ext.data.Store', groupConfig);

        this.callParent();
    }
});