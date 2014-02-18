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
                for (var c=0; c < closes.length; c++) {

                    var el = Ext.get(closes[c]);
                    var recordId = el.getAttribute('data-id');

                    if (recordId) {
                        var rec = v.getStore().getById(recordId);
                        el.recid = recordId;

                        var members = rec.get('members');
                        if (members) {
                            // listen for each member
                            var memberIdx = el.getAttribute('member-index');
                            el.memberIndex = memberIdx;
                        }

                        el.on('click', function(xevt, xel) { this.onRemoveClick(Ext.get(xel)); }, v);
                    }
                }
            }
        }
    },

    onRemoveClick : function(element) {
        if (element) {
            var store = this.getStore();
            var rec = store.getById(element.recid);
            if (rec) {
                var memberIdx = parseInt(element.memberIndex);
                if (Ext.isNumber(memberIdx)) {
                    var members = rec.get('members');
                    this.fireEvent('removefilter', rec.id, rec.get('hierarchy'), members[memberIdx].uname);
                }
                else {
                    this.fireEvent('removefilter', rec.id);
                }
            }
            else {
                console.warn('Unable to find record for removal:', element.recid);
            }
        }
        else {
            console.warn('Unable to find element for removal');
        }
    },

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
//                '<tpl if="this.isGroup(values) == true">',
//                    // Group Filter
//                    '<div class="circle"></div>',
//                    '<div class="selitem status-over memberitem" style="display: inline-block;">',
//                        '<div class="closeitem" data-id="{id}" member-index="0"></div>',
//                        '{name:this.renderName}',
//                    '</div>',
//                '</tpl>',
                '<tpl if="this.isGrid(values) == true">',
                    // Grid Filter
                    '<div class="circle"></div>',
                    '<div class="selitem status-over memberitem">',
                        '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                        '{[this.renderLabel(values)]}',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isPlot(values) == true">',
                    // Plot Filter
                    '<div class="circle"></div>',
                    '<div class="selitem status-over memberitem">',
                        '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                        '{[this.renderMeasures(values)]}',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isPlot(values) == false && this.isGrid(values) == false">',
                    // Normal Filter (and Group Filters)
                    '<div class="circle"></div>',
                    '<tpl if="members.length &gt; 1">',
                        '<div style="position: absolute; top: 28px;">',
                            '<select>',
                                '<option value="' + LABKEY.app.controller.Filter.Operators.INTERSECT + '" {operator:this.selectIntersect}>AND</option>',
                                '<option value="' + LABKEY.app.controller.Filter.Operators.UNION + '" {operator:this.selectUnion}>OR</option>',
                            '</select>',
                        '</div>',
                        '<div class="selitem sel-listing">{hierarchy:this.renderType}</div>',
                        '<tpl for="members">',
                            '<div class="status-over memberitem collapsed-member">',
                                '<div class="closeitem" data-id="{parent.id}" member-index="{[xindex-1]}"></div>',
                                '{uname:this.renderUname}',
                            '</div>',
                        '</tpl>',
                    '</tpl>',
                    '<tpl if="members.length == 1">',
                        '<div class="selitem status-over memberitem">',
                            '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                            '{members:this.renderMember}',
                        '</div>',
                    '</tpl>',
                '</tpl>',
            '</tpl>',
            {
                showMe : function(values) {
                    console.log(values);
                },
                isGrid : function(values) {
                    return (values.isGrid ? true : false);
                },
                isGroup : function(values) {
                    return (Ext.isArray(values.filters) ? true : false);
                },
                isPlot : function(values) {
                    return (values.isPlot ? true : false);
                },
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
                },
//                renderName : function(n) {
//                    return Ext.htmlEncode('Group: ' + n);
//                },
                renderMeasures : function(values) {
                    var label = 'In the plot: ';
                    var measures = values.plotMeasures, sep = '';
                    for (var i=0; i < measures.length; i++) {
                        label += sep + /*'(' + measures[i].measure.queryLabel + ') ' + */ measures[i].measure.label;
                        sep = ', ';
                    }
                    return label;
                },
                renderLabel : function(values) {
                    var type = Connector.model.Filter.getGridHierarchy(values);
                    return type + ": " + Connector.model.Filter.getGridLabel(values);
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