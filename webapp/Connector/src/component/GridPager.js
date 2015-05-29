Ext.define('Connector.component.GridPager', {

    extend: 'Ext.container.Container',

    layout: {
        type: 'hbox'
    },

    alias: 'widget.gridpager',

    floating: true,
    draggable: true,
    shadow: false,

    cls: 'grid-paging-widget',
    width: 260,
    height: 32,
    pagesShowing: 7,
    realign: true,

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('updatepage');
    },

    initComponent : function() {
        this.ELLIPSE = '...';

        var imgPath = LABKEY.contextPath + '/Connector/images/';

        this.items = [{
            xtype: 'button',
            cls: 'paging-back-button',
            ui: 'rounded-small',
            icon: LABKEY.contextPath + '/Connector/images/icon_paging_leftArrow_normal.svg',
            iconCls: 'paging-arrow-svg-back',
            margin: '3 0 0 -2',
            handler: this.requestPreviousPage,
            listeners: {
                mouseover: function(btn) { btn.setIcon(imgPath + 'icon_paging_leftArrow_hover.svg'); },
                mouseout: function(btn) { btn.setIcon(imgPath + 'icon_paging_leftArrow_normal.svg'); }
            },
            scope: this
        },{
            itemId: 'pageButtonContainer',
            xtype: 'container',
            cls: 'page-button-container',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            defaults: {
                xtype: 'button',
                ui: 'paging-widget-pages',
                flex: 1,
                text: this.ELLIPSE,
                handler: this.requestPage,
                scope: this
            },
            items : [{
                cls: 'pager-first'
            },
            { /* ellipse-left */ },
            {
                cls: 'pager-previous'
            },
            { /* pager-middle */ },
            {
                cls: 'pager-next'
            },
            { /* ellipse-right */},
            {
                cls: 'pager-last'
            }],
            border: 1,
            height: 30,
            margin: '1 0 0 0',
            width: 212
        },{
            xtype: 'button',
            cls: 'paging-next-button',
            ui: 'rounded-small',
            icon: imgPath + 'icon_paging_rightArrow_normal.svg',
            iconCls: 'paging-arrow-svg-next',
            margin: '3 0 0 0',
            handler: this.requestNextPage,
            listeners: {
                mouseover: function(btn) { btn.setIcon(imgPath + 'icon_paging_rightArrow_hover.svg'); },
                mouseout: function(btn) { btn.setIcon(imgPath + 'icon_paging_rightArrow_normal.svg'); }
            },
            scope: this
        }];

        this.callParent();
    },

    onStoreLoad : function() {
        this.updatePage();
    },

    /**
     * Updates the display to show the 'current' page as selected as well as adjusts numbered offsets.
     * Optionally, a different set of current, first, and/or last indices can be supplied.
     * @param {number} [current=store.currentPage]
     * @param {number} [first=1]
     * @param {number} [last=Math.ceil(store.getTotalCount() / store.pageSize)]
     */
    updatePage : function(current, first, last) {

        if (!Ext.isNumber(current)) {
            current = this.store.currentPage;
        }
        if (!Ext.isNumber(first)) {
            first = 1;
        }
        if (!Ext.isNumber(last)) {
            last = this._getTotalPages();
        }

        // short-circuit to prevent wasted updates (e.g user clicks, followed by store load)
        var args = [current, first, last];
        if (this.lastArgs && Ext.Array.equals(this.lastArgs, args)) {
            return;
        }
        this.lastArgs = args;

        var pageButtonCt = this.getComponent('pageButtonContainer'),
            buttons = pageButtonCt.items;

        var baseWidth = 75,
            baseCtWidth = 27,
            offsetWidth = 30,
            offsetCtWidth = 30,
            showIncrements = true;

        // Determine if the number of pages available is less than the number of buttons. If so,
        // update the display to only show necessary buttons
        var pageButtons = 0;
        for (var i=0; i < buttons.length; i++) {
            if (first === (last - i)) {
                buttons.each(function(btn, idx) {
                    if (idx == 0) {
                        this._setShowBtn(btn, first);
                        pageButtons++;
                    }
                    else if (idx < i) {
                        this._setShowBtn(btn, first + idx);
                        pageButtons++;
                    }
                    else if (idx === i) {
                        this._setShowBtn(btn, last);
                        pageButtons++;
                    }
                    else {
                        btn.hide();
                    }
                }, this);

                showIncrements = false;
                break;
            }
            else {
                baseWidth += offsetWidth;
                baseCtWidth += offsetCtWidth;
            }
        }

        if(this.pagesShowing != pageButtons) {
            this.pagesShowing = pageButtons;
            this.realign = true;
        }

        if (last < 1) {
            buttons.each(function(btn) {
                btn.hide();
            }, this);
            this.setWidth(81);
            pageButtonCt.setWidth(33);
            this._setShowBtn(buttons.get(0), first);
            this.realign = true;
        } else
        {
            // If we are somewhere in the middle, we show the '...' increments outside of the middle
            if (showIncrements && buttons.length > 0)
            {
                this._setShowBtn(buttons.get(0), first);

                if (buttons.length > 1)
                {
                    this._setShowBtn(buttons.last(), last);
                }

                if (buttons.length > 2)
                {
                    var middle,
                            midIdx = Math.floor(buttons.length / 2),
                            prevIdx = midIdx - 1,
                            nextIdx = midIdx + 1,
                            ellipseLeftIdx = midIdx - 2,
                            ellipseRightIdx = midIdx + 2;

                    if (current <= first + 3)
                    {
                        middle = first + 3;
                    }
                    else if (current >= last - 3)
                    {
                        middle = last - 3;
                    }
                    else
                    {
                        middle = current
                    }

                    this._setShowBtn(buttons.get(midIdx), middle);

                    if (middle <= (first + 3))
                    {
                        this._setShowBtn(buttons.get(ellipseLeftIdx), first + 1);
                        this._setShowBtn(buttons.get(prevIdx), first + 2);
                    }
                    else
                    {
                        this._setShowBtn(buttons.get(ellipseLeftIdx), this.ELLIPSE);
                        this._setShowBtn(buttons.get(prevIdx), middle - 1);
                    }

                    if (middle >= (last - 3))
                    {
                        this._setShowBtn(buttons.get(nextIdx), last - 2);
                        this._setShowBtn(buttons.get(ellipseRightIdx), last - 1);
                    }
                    else
                    {
                        this._setShowBtn(buttons.get(nextIdx), middle + 1);
                        this._setShowBtn(buttons.get(ellipseRightIdx), this.ELLIPSE);
                    }
                }
            }
            this.setWidth(baseWidth);
            pageButtonCt.setWidth(baseCtWidth);
        }

        var currentStr = current.toString();
        buttons.each(function(btn) {
            if (btn.hasCls('selected')) {
                btn.removeCls('selected');
            }
            if (btn.getText() === currentStr) {
                btn.addCls('selected');
            }
        });

        this.fireEvent('updatepage', this);
    },

    _getTotalPages : function() {
        return Math.ceil(this.store.getTotalCount() / this.store.pageSize);
    },

    _setShowBtn : function(btn, text) {
        if (!Ext.isDefined(text) || text < 1) {
            btn.hide();
        }
        else {
            btn.setText(text.toString()).show();
            text === this.ELLIPSE ? btn.disable() : btn.enable();
        }
    },

    registerStore : function(newStore) {
        if (this.store) {
            this.store.un('load', this.onStoreLoad, this);
        }

        this.store = newStore;
        this.store.on('load', this.onStoreLoad, this);

        // in case we missed a load
        this.onStoreLoad(this.store);
    },

    requestPreviousPage : function() {
        if (this.store.currentPage > 1) {
            this.store.previousPage();
            this.updatePage();
        }
    },

    requestNextPage : function() {
        if (this.store.currentPage < this._getTotalPages()) {
            this.store.nextPage();
            this.updatePage();
        }
    },

    requestPage : function(btn) {
        var pageNo = parseInt(btn.getText());
        if (pageNo <= this._getTotalPages() && pageNo > 0) {
            this.store.loadPage(pageNo);
            this.updatePage();
        }
    }
});