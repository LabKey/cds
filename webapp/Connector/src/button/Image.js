/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.button.Image', {

    extend: 'Ext.Component',

    alias: 'widget.imgbutton',

    mixins: {
        queryable: 'Ext.Queryable'
    },

    cls: '',

    baseCls: 'imgbutton',

    overCls: 'imgbuttonover',

    menuActiveCls: 'menubuttonover',

    vector: 30,

    menuAlign: 'tl-bl?',

    menuOffsets: [0, 0],

    initComponent : function() {

        var me = this;

        me.autoEl = {
            tag: 'button',
            style: 'border-radius: ' + me.vector + 'px; height: ' + me.vector + 'px; width: ' + me.vector + 'px;',
            cls: me.baseCls + ' ' + me.cls
        };

        me.callParent();

        me.addEvents('click', 'menushow', 'menuhide');

        if (me.menu) {
            // retrieve menu by id or instantiate instance if needed
            me.menu = Ext.menu.Manager.get(me.menu);

            // Use ownerButton as the upward link. Menus *must have no ownerCt* - they are global floaters.
            // Upward navigation is done using the up() method.
            me.menu.ownerButton = me;
        }

        me.on('afterrender', function(button) {

            // hook event listeners
            var el = button.getEl();
            el.on('mouseover', button.onMouseOver, button);
            el.on('mouseout', button.onMouseOut, button);
            el.on('click', button.onClick, button);

        }, me, {single: true});

    },

    onRender : function() {

        var me = this;

        me.callParent(arguments);

        if (me.menu) {
            me.mon(me.menu, {
                show: me.onMenuShow,
                hide: me.onMenuHide,
                scope: me
            });
        }
    },

    onClick : function() {
        if (Ext.isFunction(this.handler)) {
            this.handler.call(this.scope, this);
        }
        this.fireEvent('click', this);
    },

    onMouseOver : function() { this.getEl().addCls(this.overCls); },

    onMouseOut : function() { this.getEl().removeCls(this.overCls); },

    onMenuShow : function() {
        var me = this;
        me.addClsWithUI(me.menuActiveCls);
        me.fireEvent('menushow', me, me.menu);
    },

    onMenuHide : function() {
        var me = this;
        me.removeClsWithUI(me.menuActiveCls);
        me.fireEvent('menuhide', me, me.menu);
    },

    showMenu : function() {
        var me = this,
                menu = me.menu,
                fromEvent = true;

        if (me.rendered) {
            if (me.tooltip && Ext.quickTipsActive && me.getTipAttr() != 'title') {
                Ext.tip.QuickTipManager.getQuickTip().cancelShow(me.el);
            }

            if (menu.isVisible()) {
                menu.hide();
            }
            menu.showBy(me.el, me.menuAlign, me.menuOffsets);
        }
        return me;
    },

    hideMenu : function() {
        if (this.hasVisibleMenu()) {
            this.menu.hide();
        }
        return this;
    },

    /**
     * Returns true if the button has a menu and it is visible
     * @return {Boolean}
     */
    hasVisibleMenu : function() {
        var menu = this.menu;
        return menu && menu.rendered && menu.isVisible();
    }
});