/* Apply patches found for Ext 4.0.7 here */

// Set USE_NATIVE_JSON so Ext.decode and Ext.encode use JSON.parse and JSON.stringify instead of eval
Ext4.USE_NATIVE_JSON = true;

// set the default ajax timeout from 30's to 5 minutes
Ext4.Ajax.timeout = 5 * 60 * 1000;

// Define an override for RowModel to fix page jumping on first click
// LabKey Issue : 12940: Data Browser - First click on a row scrolls down slightly, doesn't trigger metadata popup
// Ext issue    : http://www.sencha.com/forum/showthread.php?142291-Grid-panel-jump-to-start-of-the-panel-on-click-of-any-row-in-IE.In-mozilla-it-is-fine&p=640415
// NOTE: Still not fixed as of Ext 4.0.7
Ext4.define('Ext.selection.RowModelFixed', {
    extend : 'Ext.selection.RowModel',
    alias  : 'selection.rowmodelfixed',

    onRowMouseDown: function(view, record, item, index, e) {
        this.selectWithEvent(record, e);
    }
});

// Following above fix for RowModel -- commented out call to view.onCellFocus
// LabKey Issue : 14050: Study schedule - Weird scrolling behavior with large number of datasets
// NOTE: Still not fixed as of Ext 4.0.7
Ext4.define('Ext.selection.CellModelFixed', {
    extend : 'Ext.selection.CellModel',
    alias  : 'selection.cellmodelfixed',

    onCellSelect : function(position) {
        var me = this,
                store = me.view.getStore(),
                record = store.getAt(position.row);

        me.doSelect(record);
        me.primaryView.onCellSelect(position);
        // TODO: Remove temporary cellFocus call here.
//        me.primaryView.onCellFocus(position);
        me.fireEvent('select', me, record, position.row, position.column);
    }
});

// Allows the modal mask (e.g. on windows, messages, etc) to be seen when using sandbox
// Ext issue    : http://www.sencha.com/forum/showthread.php?145608-4.0.5-Window-modal-broken-in-sandbox
// NOTE: Still not fixed as of Ext 4.0.7
Ext4.override(Ext4.ZIndexManager, {
    _showModalMask: function(comp) {
        var zIndex = comp.el.getStyle('zIndex') - 4,
            maskTarget = comp.floatParent ? comp.floatParent.getTargetEl() : Ext4.get(comp.getEl().dom.parentNode),
            parentBox = maskTarget.getBox();

        if (Ext4.isSandboxed) {
            if (comp.isXType('loadmask')) {
                zIndex = zIndex + 3;
            }

            if (
                maskTarget.hasCls(Ext4.baseCSSPrefix + 'reset') &&
                maskTarget.is('div')
            ) {
                maskTargetParentTemp = Ext4.get(maskTarget.dom.parentNode)
                if (maskTargetParentTemp.is('body')) {
                    maskTarget = maskTargetParentTemp;
                    parentBox = maskTarget.getBox();
                }
            }
        }

        if (!this.mask) {
            this.mask = Ext4.getBody().createChild({
                cls: Ext4.baseCSSPrefix + 'mask'
            });
            this.mask.setVisibilityMode(Ext4.Element.DISPLAY);
            this.mask.on('click', this._onMaskClick, this);
        }

        if (maskTarget.dom === document.body) {
            parentBox.height = document.body.scrollHeight || maskTarget.getHeight();
        }

        maskTarget.addCls(Ext4.baseCSSPrefix + 'body-masked');
        this.mask.setBox(parentBox);
        this.mask.setStyle('zIndex', zIndex);
        this.mask.show();
    }
});

// fixes the problem with the combo box loadmask not hiding after the store is reloaded
// http://www.sencha.com/forum/showthread.php?153490-Combo-Box-Store-Loading
Ext4.override(Ext4.LoadMask, {
    onHide: function() {
        this.callParent();
    }
});

/**
 * @Override
 * This is an override of the Ext 4.0.7 selection model for checkboxes due to how easy it was to accidentally
 * uncheck a large set of rows. The fix is to use a DOM Element higher up in the structure making the 'clickable'
 * area for the checkbox larger. The reason for this pertains to issue 15193 linked below.
 * https://www.labkey.org/issues/home/Developer/issues/details.view?issueId=15193
 */
Ext4.override(Ext4.selection.CheckboxModel, {

    onRowMouseDown: function(view, record, item, index, e) {
        view.el.focus();
        var me = this,
            checker = e.getTarget('.' + Ext4.baseCSSPrefix + 'grid-cell-inner'),
            mode;

        if (!me.allowRightMouseSelection(e)) {
            return;
        }

        // checkOnly set, but we didn't click on a checker.
        if (me.checkOnly && !checker) {
            return;
        }

        if (checker) {
            mode = me.getSelectionMode();
            // dont change the mode if its single otherwise
            // we would get multiple selection
            if (mode !== 'SINGLE') {
                me.setSelectionMode('SIMPLE');
            }
            me.selectWithEvent(record, e);
            me.setSelectionMode(mode);
        } else {
            me.selectWithEvent(record, e);
        }
    }
});
