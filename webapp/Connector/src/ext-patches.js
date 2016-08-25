/* Apply patches found for Ext 4.2.1 here for CDS only */

/**
 * @Override
 * When locking a column in an Ext.grid.Panel scrolling with the mousewheel or scroll buttons slowed to a crawl. See
 * forum post: https://www.sencha.com/forum/showthread.php?296278. This function caused the resulting performance hit.
 * Removing it causes no observable issues, but to be safe only apply this patch to CDS.
 */
Ext.override(Ext.grid.locking.Lockable, {

    onLockedViewScroll: Ext.emptyFn
});