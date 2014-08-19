
Ext.define('Connector.plugin.LoadingMask', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.loadingmask',

    //blockingMask: true,

    loadingDelay: 500,

    maskingLock: false,

    beginConfig: null, // defines the component and events for that component that will trigger the showMask

    endConfig: null, // defines the component and events for that component that will trigger the hideMask

    init : function(component) {

        this.showLoadingMaskTask = new Ext.util.DelayedTask(function(){
            if (this.maskingLock)
            {
                this.maskCmp = new Ext.LoadMask(this, { cls: "spinner-mask", msg:" " });
                this.maskCmp.show();
            }
        }, component);

        Ext.override(component, {
            //blockingMask: this.blockingMask,
            loadingDelay: this.loadingDelay,
            showLoadingMaskTask: this.showLoadingMaskTask,
            showMask: this.showMask,
            hideMask: this.hideMask
        });

        // attach the begin events to the specified component to show mask
        if (this.beginConfig && this.beginConfig.component && Ext.isArray(this.beginConfig.events)) {
            Ext.each(this.beginConfig.events, function(eventName){
                this.beginConfig.component.on(eventName, component.showMask, component);
            }, this);
        }

        // attach the end events to the specified component to hide mask
        if (this.endConfig && this.endConfig.component && Ext.isArray(this.endConfig.events)) {
            Ext.each(this.endConfig.events, function(eventName){
                this.endConfig.component.on(eventName, component.hideMask, component);
            }, this);
        }
    },

    showMask : function() {
        this.maskingLock = true;
        this.showLoadingMaskTask.delay(this.loadingDelay);
    },

    hideMask : function() {
        if (this.maskCmp) this.maskCmp.hide();
        this.maskingLock = false;
    }
});