/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This is a singleton for resolving Help popup back action
Ext.define('HelpRouter', {
    singleton: true,
    histories: [],
    addHelpHistory: function (pageName) {
        // to do, skip if it's the same
        this.histories.push({wiki: pageName});
    },
    addSearchHistory: function (searchText) {
        this.histories.push({search: searchText});
    },
    retrieveHistory: function() {
        return this.histories[this.histories.length-2]
    },
    removeHistory: function() {
        return this.histories.pop();
    },
    clearHistory: function () {
        this.histories = [];
    },
    showBackButton: function() {
        var wikiCount = 0;
        for (var i = 0; i < this.histories.length; i++) {
            if (this.histories[i].wiki) {
                wikiCount++;
            }
        }
        return wikiCount > 0;
    }
});
