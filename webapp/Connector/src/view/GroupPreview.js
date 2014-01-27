Ext.define('Connector.view.GroupPreview', {

    extend : 'Ext.panel.Panel',

    alias  : 'widget.grouppreview',

    layout : {
        type : 'vbox',
        align: 'stretch'
    },

    cls : 'grouppreview',

    initComponent : function() {

        Ext.applyIf(this, {
            height: 130,
            flex  : 1,
            ui    : 'custom'
        });

        this.items = [this.getTitleDisplay()];

        this.items.push({
            xtype : 'panel',
            height: 125,
            layout : {
                type : 'hbox',
                align: 'stretch'
            },
            ui   : 'custom',
            defaults : {
                flex : 1
            },
            items : [this.getFilterDisplay(),this.getDescriptionDisplay()]
        });

        this.callParent();

        this.on('groupchange', this.onGroupChange, this);

        if (this.group) {
            this.setGroup(this.group);
        }
    },

    getDescriptionDisplay : function() {
        if (!this.descriptionDisplay) {

            this.descriptionDisplay = Ext.create('Ext.panel.Panel', {
                height: 75,
                ui   : 'custom',
                html : 'No Description Available',
                tpl : new Ext.XTemplate(
                        '<div class="subtitle">Description:</div>',
                        '<div>{data.description:this.renderText}</div>',
                        {
                            renderText : function(val) {
                                if (val)
                                    return Ext.htmlEncode(val);
                                return 'No Description Available';
                            }
                        }
                )
            });

        }

        return this.descriptionDisplay;
    },

    getFilterDisplay : function() {
        if (!this.filterDisplay) {

            var filterTpl = new Ext.XTemplate(
                    '<div class="subtitle">Active Filters: {data.active} Participants</div>',
                    '<div>{data.filters:this.renderFilters}</div>'
            );
            filterTpl.renderFilters = function(filters) {

                var emptyText = 'No Active Filters';

                if (filters && filters.length > 0) {

                    var html = '<ul>', sep = '', u;

                    var parseMembers = function(filter) {
                        if (filter.isGrid()) {
                            return filter.getGridHierarchy() + ' ' + filter.getGridLabel();
                        }

                        var h = '<li>' + filter.getHierarchy() + ': ';
                        sep = '';
                        for (var m=0; m < filter.data.members.length; m++) {

                            u = filter.data.members[m].uname;
                            h += sep + u[u.length-1];
                            sep = ', ';
                        }
                        h += '</li>';
                        return h;
                    };

                    var fs;
                    for (var f=0; f < filters.length; f++) {

                        if (Ext.isFunction(filters[f].isGroup) && filters[f].isGroup()) {
                            for (var j=0; j < filters[f].data.filters.length; j++) {
                                html += parseMembers(filters[f].data.filters[j]);
                            }
                        }
                        else {

                            fs = filters[f];
                            // could just be raw data
                            if (!filters[f].$className) {
                                fs = Ext.create('Connector.model.Filter', filters[f]);
                            }
                            html += parseMembers(fs);
                        }
                    }
                    html += '</ul>';

                    return html;
                }

                return emptyText;
            };

            this.filterDisplay = Ext.create('Ext.panel.Panel', {
                height: 75,
                html : 'Filter',
                ui   : 'custom',
                tpl : filterTpl
            });
        }

        return this.filterDisplay;
    },

    getTitleDisplay : function() {
        if (!this.titleDisplay) {

            var titleTpl = new Ext.XTemplate(
                    '<div class="title">{data.type:this.getPrefix}{data.label:htmlEncode}</div>'
            );
            titleTpl.getPrefix = function(val) {
                if (val == 'activefilters')
                    return '';
                return 'Group: ';
            };

            this.titleDisplay = Ext.create('Ext.panel.Panel', {
                height: 50,
                html : 'Title Display',
                ui : 'custom',
                tpl : titleTpl
//                buttonAlign: 'center',
//                buttons : [{
//                    xtype : 'roundedbutton',
//                    ui: 'darkrounded',
//                    text : 'Save Group'
//                },{
//                    xtype : 'roundedbutton',
//                    ui: 'darkrounded',
//                    text : 'Share Group'
//                },{
//                    xtype : 'roundedbutton',
//                    ui: 'darkrounded',
//                    text : 'Delete Group'
//                }]
            });
        }

        return this.titleDisplay;
    },

    onGroupChange : function(grp) {
        this.loadGroup();
    },

    loadGroup : function() {
        this.titleDisplay.update(this.group);
        this.filterDisplay.update(this.group);
        this.descriptionDisplay.update(this.group);
    },

    setGroup : function(groupRecord) {
        this.group = groupRecord;

        if (!this.group.data.filters)
        {
            var me = this;
            Ext.Ajax.request({
                url : LABKEY.ActionURL.buildURL('participant-group', 'getSubjectsFromGroups.api'),
                method: 'POST',
                jsonData : {
                    groups : [this.group.data]
                },
                success : function(resp) {
                    var subjects = Ext.decode(resp.responseText).subjects;
                    var filters = [{
                        hierarchy : 'Participant',
                        members   : []
                    }];

                    for (var s=0; s < subjects.length; s++)
                    {
                        filters[0].members.push({
                            uname : ['Participant', subjects[s]]
                        });
                    }

                    me.group.data.filters = filters;
                    me.fireEvent('groupchange', me, me.group);
                }
            });
        }
        else
        {
            var filters = [];
            if (this.group.data.filters) {
                if (Ext.isString(this.group.data.filters)) {
                    filters = Ext.decode(this.group.data.filters);
                    this.group.data.filters = filters;
                }
            }

            this.fireEvent('groupchange', this, this.group);
        }
    }
});