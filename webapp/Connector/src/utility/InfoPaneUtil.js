/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.utility.InfoPaneUtil', {
    plugins: ['messaging'],

    onFilterRemove : function() {
        this.showUndoMessage();
    },

    showUndoMessage : function(msg) {
        var id = Ext.id();
        if (msg)
            this.showMessage(msg + ' <a id="' + id + '">Undo</a>', true, true);
        else
            this.showMessage('Filter removed. <a id="' + id + '">Undo</a>', true, true);

        var undo = Ext.get(id);
        if (undo) {
            undo.on('click', this.onUndo, this, {single: true});
        }
    },

    onUndo : function() {
        this.fireEvent('requestundo');
        this.hideMessage(true);
    },

    onAfterViewChange : function() {
        this.hideMessage(true);
        if (this.undoMsg) {
            this.showUndoMessage(this.undoMsg);
            delete this.undoMsg;
        }
    }

});