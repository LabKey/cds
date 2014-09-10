Ext.define('Connector.controller.Query', {

    extend: 'Ext.app.Controller',

    isService: true,

    init : function() {
        this._initCache();
//        this._hijackGetMeasures();
    },

    _initCache : function() {
        if (!this.MEMBER_CACHE) {
            this.CACHE_LOADED = false;
            this.MEMBER_CACHE = {};
        }

        // Get all the study columns (including non-measures, weird, I know. Right?)
        LABKEY.Query.Visualization.getMeasures({
            allColumns: true,
            showHidden: true,
            filters: [LABKEY.Query.Visualization.Filter.create({
                schemaName: 'study',
                queryType: LABKEY.Query.Visualization.Filter.QueryType.ALL
            })],
            success: function(measures) {
                Ext.each(measures, function(measure) {
                    if (!Ext.isObject(this.MEMBER_CACHE[measure.alias])) {
                        this.MEMBER_CACHE[measure.alias] = measure;
                    }
                    this.CACHE_LOADED = true;
                }, this);
            },
            scope: this
        });
    },

    _hijackGetMeasures : function() {

        Ext.namespace('LABKEY.Query.Visualization');

        if (Ext.isFunction(LABKEY.Query.Visualization.getMeasures)) {

            var me = this;
            me.GET_MEASURES = LABKEY.Query.Visualization.getMeasures;
            me.MEMBER_CACHE = {};

            LABKEY.Query.Visualization.getMeasures = function(config) {

                var success = function(measures) {

                    var configSuccess = LABKEY.Utils.getOnSuccess(config);
                    if (Ext.isFunction(configSuccess)) {
                        configSuccess.apply(config.scope, arguments);
                    }
                };

                var failure = function() {

                    console.log('called failure');
                    var configFailure = LABKEY.Utils.getOnFailure(config);
                    if (Ext.isFunction(configFailure)) {
                        configFailure.apply(config.scope, arguments);
                    }
                };

                var newConfig = Ext.applyIf({
                    success: success,
                    failure: failure
                }, config);

                me.GET_MEASURES(newConfig);
            };
        }

    },

    getMeasure : function(measureAlias) {
        if (!this.CACHE_LOADED) {
            console.warn('Requested measure before measure caching prepared.');
        }
        if (Ext.isString(measureAlias) && Ext.isObject(this.MEMBER_CACHE[measureAlias])) {
            return Ext.clone(this.MEMBER_CACHE[measureAlias]);
        }
    }

//    getValuesForMeasure : function(measure) {
//        // Would return the select distinct of values available for this column
//    }
});
