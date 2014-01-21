Ext.define('Connector.controller.Connector', {
    extend: 'LABKEY.app.controller.View',

    showNotFound : function() {
        if (!this.viewMap['notfound']) {
            this.viewMap['notfound'] = Ext.create('Connector.view.NotFound', {});
            this.getCenter().add(this.viewMap['notfound']); // adds to tab map
        }
        this.showView('notfound');
    }
});

Ext.define('Connector.view.NotFound', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.notfound',

    ui: 'custom',

    style: 'padding: 20px; background-color: transparent;',

    html: '<h1 style="font-size: 200%;">404: View Not Found</h1><div style="font-size: 200%;">These aren\'t the subjects you\'re looking for. Move along.</div>'
});