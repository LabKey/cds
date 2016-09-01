/* Apply patches found for Ext 4.2.1 here for CDS only */

/**
 * @Override
 * When locking a column in an Ext.grid.Panel scrolling with the mousewheel or scroll buttons slowed to a crawl. See
 * forum post: https://www.sencha.com/forum/showthread.php?296278. This function caused the resulting performance hit.
 * Removing it causes no observable issues, but to be safe only apply this patch to CDS.
 */
Ext.override(Ext.grid.locking.Lockable, {
    onLockedViewScroll: function ()
    {
        if (!this.lockedViewScrollTask)
        {
            this.lockedViewScrollTask = new Ext.util.DelayedTask(this.onLockedViewScrollTask, this);
        }
        this.lockedViewScrollTask.delay(100, undefined, this);
    },
    onLockedViewScrollTask: function() {
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