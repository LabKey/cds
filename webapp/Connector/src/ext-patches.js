/* Apply patches found for Ext 4.2.1 here for CDS only */

/**
 * @Override
 * When locking a column in an Ext.grid.Panel scrolling with the mousewheel or scroll buttons slowed to a crawl. See
 * forum post: https://www.sencha.com/forum/showthread.php?296278. This function caused the resulting performance hit.
 * Removing it causes no observable issues, but to be safe only apply this patch to CDS.
 */

Ext.override(Ext.grid.locking.Lockable, {
    // syncRow with locked grid causes performance issue
    // resort to css to ensure same row height for locked row and normal row instead
    syncRowHeight: false,
    onLockedViewScroll: function () {
        if (!this.lockedViewScrollTask) {
            this.lockedViewScrollTask = new Ext.util.DelayedTask(this.onLockedViewScrollTask, this);
        }
        this.lockedViewScrollTask.delay(100, undefined, this);
    },
    onLockedViewScrollTask: function () {
        var me = this,
                lockedView = me.lockedGrid.getView(),
                normalView = me.normalGrid.getView(),
                normalDom = normalView.el.dom,
                lockedDom = lockedView.el.dom,
                normalTable,
                lockedTable;

        // See onNormalViewScroll
        if (normalDom.scrollTop !== lockedDom.scrollTop) {
            normalDom.scrollTop = lockedDom.scrollTop;

            // For buffered views, the absolute position is important as well as scrollTop
            if (me.store.buffered) {
                lockedTable = lockedView.el.child('table', true);
                normalTable = normalView.el.child('table', true);
                normalTable.style.position = 'absolute';
                normalTable.style.top = lockedTable.style.top;
            }
        }
    }
});


Ext.override(Ext.grid.View, {
    setHighlightedItem: function(item) {
        if (!this.setHighlightedItemTask)
        {
            this.setHighlightedItemTask = new Ext.util.DelayedTask(this.onSetHighlightedItemTask, this);
        }
        if (!item)
            this.setHighlightedItemTask.delay(200, undefined, this, [item]);
        else
        {
            this.setHighlightedItemTask.delay(200, undefined, this, [item]);
        }
    },
    onSetHighlightedItemTask: function(item)
    {
        var me = this,
                highlighted = me.highlightedItem;

        // skip highlighting if table row no longer exist (due to the 200ms delay, which is unlikely to happen outside automated tests
        if (!me.el)
            return;

        if (highlighted && me.el.isAncestor(highlighted) && me.isRowStyleFirst(highlighted)) {
            me.getRowStyleTableEl(highlighted).removeCls(me.tableOverFirstCls);
        }

        if (item && me.isRowStyleFirst(item)) {
            me.getRowStyleTableEl(item).addCls(me.tableOverFirstCls);
        }
        me.superclass.setHighlightedItem.apply(this, arguments);
    }
});

Ext.override(Ext.util.Format, {
    date : function(v, format){
        if (!v) {
            return "";
        }
        if (!Ext.isDate(v)) {
            var orig = v;
            v = new Date(Date.parse(v));

            // issue 39930 - Safari is strict regarding ECMAScript date time string formats (ISO 8601)
            if (isNaN(v) && Ext.isSafari){
                var parts = orig.split(/[\s-:.]/);
                if (parts.length === 7) {
                    v = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]), parseInt(parts[6]));
                }
            }
        }
        return Ext.Date.dateFormat(v, format || Ext.Date.defaultFormat);
    }
});