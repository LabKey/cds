/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This is a singleton for resolving Help popup back action
Ext.define('HelpRouter', {
    singleton: true,
    histories: [],
    addHelpHistory: function (pageName) {
        if (!pageName) {
            this.clearHistory(); // reset history if go back to home page (needed for empty search case)
        }
        this.histories.push({wiki: pageName});
    },
    addSearchHistory: function (searchText) {
        var search = this.histories[this.histories.length - 1];
        if (search) {
            if (search.search) {
                this.removeHistory(); // only keep the last search key
            }
        }
        this.histories.push({search: searchText});
    },
    retrieveHistory: function() {
        if (this.histories.length >= 2) {
            return this.histories[this.histories.length - 2];
        }
        else {
            return null;
        }
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
    },
    getSearchKey: function() {
        var search = this.histories[this.histories.length - 1];
        if (search) {
           if (search.search) {
               return search.search;
           }
            return '';
        }
        return '';
    }
});
