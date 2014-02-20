/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.plugin.Messaging', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.messaging',

    init : function(component) {

        this.deferMessageTask = new Ext.util.DelayedTask(function() {
            if (this.msg && !this.msg.keep) {
                this.hideMessage(true);
            }
        }, component);

        Ext.override(component, {
            calculateX: this.calculateX,
            calculateY: this.calculateY,
            clearMessage: this.clearMessage,
            deferMessage: this.deferMessage,
            hideMessage: this.hideMessage,
            showMessage: this.showMessage,
            deferMessageTask: this.deferMessageTask
        });
    },

    calculateX : function(cmp, box, msg) {
        var el = cmp.getEl();
        return Math.floor(box.x  + (box.width/2 - Math.floor(el.getTextWidth(msg)/2) - 12));
    },

    calculateY : function(cmp, box, msg) {
        return box.y-15; // half height of message box
    },

    clearMessage : function() {
        if (this.msg) {
            this.deferMessageTask.cancel();
            this.msg.hide();
            this.msg.destroy();
            this.msg = null;
        }
    },

    deferMessage : function() {
        this.deferMessageTask.delay(8000);
    },

    hideMessage : function(withFade) {
        if (this.msg && this.msg.isVisible()) {
            if (withFade) {
                if (!this.msgfade) {

                    this.msgfade = true;
                    this.msg.getEl().fadeOut({
                        listeners : {
                            afteranimate : function() {
                                this.clearMessage();
                                this.msgfade = false;
                            },
                            scope : this
                        },
                        scope : this
                    });
                }
            }
            else {
                this.clearMessage();
            }
            this.loadMsg = false;
        }
    },

    showMessage : function(msg, force, keep) {
        if (this.showmsg || force) {
            this.clearMessage();

            if (!force) {
                this.showmsg = false;
            }

            var listeners = {};
            if (!keep) {
                listeners = {
                    afterrender: this.deferMessage,
                    scope: this
                };
            }

            var box = this.getBox();

            this.msg = Ext.create('Connector.window.SystemMessage', {
                msg: msg,
                x: this.calculateX(this, box, msg),
                y: this.calculateY(this, box, msg),
                listeners: listeners,
                keep: keep,
                scope: this
            });
        }
    }
});
