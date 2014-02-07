Ext.define('Connector.view.Selection', {
    extend: 'Ext.view.View',

    alias: 'widget.selectionview',

    ui: 'custom',

    cls: 'selectionfilter',

    itemSelector: 'div.selitem',

    statics : {
        hookButtons : function(v) {
            //
            // hook events for and/or selection
            //
            var selectEl = v.getEl().select('select');
            if (selectEl) {
                selectEl.on('change', function(evt, el) {
                    var value = selectEl.elements[0].value;
                    this.onOperatorChange(value, evt, el);
                }, v);
            }

            //
            // hook events for item close
            //
            var closes = v.getEl().select('.closeitem');
            if (closes && Ext.isArray(closes.elements)) {
                closes = closes.elements;
                var recs = v.getStore().getRange();
                if (recs.length > 0) {
                    var rec = recs[0];
                    // for each record
                    for (var r=0; r < recs.length; r++) {
                        var members = [];
                        if (recs[r].isGroup() || recs[r].isGrid()) {
                            members.push({uname: []});
                        }
                        else {
                            members = recs[r].get('members');
                        }
                        for (var m=0; m < members.length; m++) {
                            // for each member
                            closes[m].member = members[m];
                            var EL = Ext.get(closes[m]);
                            EL.member = members[m];
                            EL.rec = recs[r];

                            // listen for uname removal
                            EL.on('click', function(evt, cEl) {
                                this.fireEvent('removefilter', rec.id, rec.get('hierarchy'), cEl.member.uname);
                            }, v);
                        }
                    }
                }
            }
        }
    },

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="circle"></div>',
                '<tpl if="members.length &gt; 1">',
                    '<div style="position: absolute; top: 28px;">',
                        '<select>',
                            '<option value="' + LABKEY.app.controller.Filter.Operators.INTERSECT + '" {operator:this.selectIntersect}>AND</option>',
                            '<option value="' + LABKEY.app.controller.Filter.Operators.UNION + '" {operator:this.selectUnion}>OR</option>',
                        '</select>',
                    '</div>',
                    '<div class="selitem" style="padding: 5px 0 5px 30px; font-family: Arial; font-size: 12pt;">{hierarchy:this.renderType}</div>',
                    '<tpl for="members">',
                        '<div class="status-over memberitem" style="float: right; width: 78%; padding: 4px 6px;">',
                            '<div class="closeitem"></div>',
                            '{uname:this.renderUname}',
                        '</div>',
                    '</tpl>',
                '</tpl>',
                '<tpl if="members.length == 1">',
                    '<div class="selitem status-over memberitem" style="float: right; width: 92%; padding: 4px 6px;">',
                        '<div class="closeitem"></div>',
                        '{members:this.renderMember}',
                    '</div>',
                '</tpl>',
            '</tpl>',
            {
                selectIntersect : function(op) {
                    return op == LABKEY.app.controller.Filter.Operators.INTERSECT ? 'selected="selected"' : '';
                },
                selectUnion : function(op) {
                    return op == LABKEY.app.controller.Filter.Operators.UNION ? 'selected="selected"' : '';
                },
                renderType : function(type) {
                    var t = type.split('.');
                    return Ext.htmlEncode(t[t.length-1]);
                },
                renderUname : function(uname) {
                    return Ext.htmlEncode(uname[uname.length-1]);
                },
                renderMember: function(members) {
                    var uname = members[0]['uname'];

                    var type = uname[0].split('.');
                    type = type[type.length-1];

                    return Ext.htmlEncode(type + ': ' + uname[uname.length-1]);
                }
            }
    ),

    listeners: {
        viewready : function(v) {
            Connector.view.Selection.hookButtons(v);
        }
    },

    constructor : function(config) {
        this.callParent([config]);
        this.addEvents('clearhierarchy', 'operatorchange', 'removefilter');
    },

    onOperatorChange : function(value, evt, el) {
        this.fireEvent('operatorchange', {
            filterId: this.getStore().getAt(0).id,
            value: value
        });
    }
});

Ext.define('Connector.view.GroupSelection', {
    extend: 'Connector.view.Selection',

    alias: 'widget.grpselectionview',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="circle"></div>',
            '<div class="selitem status-over memberitem" style="display: inline-block; width: 92%; padding: 4px 6px;">',
                '<div class="closeitem"></div>',
                '{name:this.renderName}',
            '</div>',
        '</tpl>',
        {
            renderName : function(n) {
                return Ext.htmlEncode('Group: ' + n);
            }
        }
    )
});

Ext.define('Connector.view.GridSelection', {
    extend: 'Connector.view.Selection',

    alias: 'widget.grpselectionview',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="circle"></div>',
            '<div class="selitem status-over memberitem" style="float: right; width: 92%; padding: 4px 6px;">',
                '<div class="closeitem"></div>',
                '{[this.renderLabel(values)]}',
            '</div>',
        '</tpl>',
        {
            renderLabel : function(values) {
                var type = Connector.model.Filter.getGridHierarchy(values);
                return type + ": " + Connector.model.Filter.getGridLabel(values);
            }
        }
    )
});