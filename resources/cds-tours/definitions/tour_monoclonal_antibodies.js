var tour_monoclonal_antibodies = {
    title:       'Monoclonal Antibodies',
    description: 'A tour for the "Monoclonal antibodies" section.',
    id:          'tour-monoclonal-antibodies',
    winerror:    0,
    i18n:        {
        skipBtn: 'Start the tour'
    },
    onStart:      function(){
        window.onerror = function() { self.winerror = 1; hopscotch.endTour(); };
        if(self.winerror === 0){
            for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
                i.click();
            }
            for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
                j.click();
            }
            self.winerror = 0;
        }
    },
    onEnd:        function(){

        var nodes = null;
        var promise = new Promise(function(resolve, reject){
            nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear"));
            if(nodes.length > 0){
                resolve();
            }
        }).then(function(result){
            if(nodes[0] !== null){
                nodes[0].click();

            }
        }).then(function(result){
            document.querySelector('div.nav-label:nth-child(1)').click();

        });
    },
    onClose:      function(){
        hopscotch.endTour();
    },
    onError:      function(){
        for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
            i.click();
        }
        for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
            j.click();
        }
        hopscotch.endTour();
    },
    steps:
            [
                {
                    target:      'h3[class*="tour-section-title"]',
                    placement:   'bottom',
                    arrowOffset: 'center',
                    title:       'Monoclonal antibodies',
                    content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.<br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
                    xOffset:     (window.innerWidth / 2) - 280,
                    showSkip:    true
                },{
                target:    'div.nav-label:nth-child(6)',
                placement: 'left',
                title:     'Compare different antibody-virus combinations',
                content:   'The Monoclonal antibodies section is where you can explore data from monoclonal antibody (mAb) characterization studies. In this section, you can search for antibodies and compare the neutralization curves and heatmaps for different antibody-virus combinations.',
                yOffset:   -17,
                onNext:    function(){

                    document.querySelector('div.nav-label:nth-child(6)').click();
                    var event = new Event('mouseenter');
                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeTextSearch(document.querySelectorAll('span[id*=gridcolumn][class*=x-column-header]'), "MAb/Mixture");
                                if (nodes.length === 1) {
                                    var node = nodes[0];
                                    node.classList.add("mab-mix-column");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('span[class*="mab-mix-column"]');
                                if (node !== null) {
                                    node.parentElement.dispatchEvent(event);
                                    node.nextSibling.classList.add("mab-mix-filter");
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                    var checkExist3 = setInterval(
                            function(){
                                if (document.querySelector('span[class*="mab-mix-column"]') !== null &&
                                        document.querySelector('div[class*="mab-mix-filter"]') !== null) {
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                    clearInterval(checkExist3);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'div[class*="mab-mix-filter"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     10,
                yOffset:     -25,
                title:       'The "mAb grid"',
                content:     'The mAb grid lists all the antibodies from the mAb characterization study data in DataSpace. The antibodies are listed by a standard name for the mAb or mixture of mAbs assigned by the DataSpace team.',
            },{
                target:      'h2[class*="mab-filterheader-text"]',
                placement:   'left',
                arrowOffset: 'center',
                xOffset:     20,
                yOffset:     -40,
                content:     'The MAb Info pane gives you a summary of the mAbs available to plot and keeps track of the mAbs being explored in your session, similar to the Active filters for subject data.',
                onNext:      function(){

                    document.querySelector('div[class*="mab-mix-filter"]').click();
                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeTextSearch(document.querySelectorAll('div[id*="tbtext"]'), "MAb/Mixture");
                                if(nodes.length === 1 && isVisCoords(nodes[0])){
                                    nodes[0].classList.add("mab-mix-popup");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelector('div[class*="mab-mix-popup"]')){
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                    clearInterval(checkExist2);
                                }
                            },100);

                }, multipage: true
            },{
                target:      'div[class*="mab-mix-popup"]',
                placement:   'top',
                arrowOffset: 'center',
                xOffset:     -110,
                yOffset:     -10,
                title:       'Choosing mAb data to plot',
                content:     'The MAb/Mixture column can be sorted or filtered to specific mAbs.',
                onNext:      function(){

                    var event = new Event("click");
                    nodeTextSearch(document.querySelectorAll('span[id*="templatecolumn"]'), "All")[0].
                    parentElement.
                    parentElement.
                    previousSibling.
                    dispatchEvent(event);

                    var checkExist0 = setInterval(
                            function(){
                                var node = nodeTextSearch(document.querySelectorAll('span[id*="templatecolumn"]'), "All")[0].
                                        parentElement.
                                        parentElement.
                                        previousSibling;
                                if(node.className.match("x-grid-hd-checker-on") === null){
                                    var event = new Event("change");
                                    var inbox = document.querySelector('input[placeholder*="Search MAb/Mixture"]');
                                    inbox.value = "PGT";
                                    inbox.dispatchEvent(event);
                                    clearInterval(checkExist0);
                                }
                            }, 100);

                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeTextSearch(document.querySelectorAll('div[class*="x-grid-cell-inner"]'), "PGT121");
                                var nodeIdx = null;
                                for(var i = 0; i < nodes.length; i++){
                                    for(var j of Array(7)){
                                        nodes[i] = nodes[i].parentElement;
                                    }
                                    if(nodes[i].nodeName === "TBODY"){
                                        nodeIdx = i;
                                    }
                                }
                                if(nodeIdx !== null){
                                    nodeTextSearch(document.querySelectorAll('div[class*="x-grid-cell-inner"]'), "PGT121")[nodeIdx].click();
                                    nodes[nodeIdx].classList.add("top-of-table");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('tbody[class="top-of-table"]');
                                if(node !== null){
                                    node.firstChild.nextSibling.classList.add("mab-mix-filter-select-row");
                                    node.firstChild.nextSibling.nextSibling.classList.add("mab-mix-filter-select-row");
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                    var checkExist3 = setInterval(
                            function(){
                                var nodes = document.querySelectorAll('tr[class*="mab-mix-filter-select-row"]');
                                if(nodes.length === 2){
                                    for(var i of nodes){ i.firstChild.click(); }
                                    clearInterval(checkExist3);
                                }
                            }, 100);

                    var checkExist4 = setInterval(
                            function(){
                                var nodes = nodePosCoordSearch(document.querySelectorAll('tr[class*="mab-mix-filter-select-row"][class*="x-grid-row-selected"]'));
                                if(nodes.length === 2){
                                    nodePosCoordSearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Filter"))[0].classList.add("mab-mix-popout-filter-button");
                                    clearInterval(checkExist4);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);
                }, multipage: true
            },{
                target:      'span[class*="mab-mix-popout-filter-button"]',
                placement:   'bottom',
                arrowOffset: 'center',
                xOffset:     -140,
                yOffset:     10,
                content:     'Clicking the Filter button will set the filter in the mAb grid.',
                onNext:      function(){
                    document.querySelector('span[class*="mab-mix-popout-filter-button"]').click();
                    var checkExist1 = setInterval(
                            function(){
                                var node = document.querySelector('span[class*="mab-mix-popout-filter-button"]');
                                if (node === null) {
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                    clearInterval(checkExist1);
                                }
                            }, 100);
                }, multipage: true

            },{
                target:      'div[class*="mab-mix-filter"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     10,
                yOffset:     -25,
                content:     'Now the list of mAbs only includes the mAbs selected.',
                onNext:      function(){

                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeDisplaySearch(
                                        nodeTextSearch(
                                                document.querySelectorAll('span[class*="x-column-header-text"]'), "Antibody binding type"
                                        )
                                );
                                if(nodes.length > 0){
                                    nodes[0].classList.add("antibody-binding-type-column");
                                    clearInterval(checkExist1);
                                }
                            }, 100);


                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('span[class*="antibody-binding-type-column"]');
                                if( node !== null){
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'span[class*="antibody-binding-type-column"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     10,
                yOffset:     -25,
                content:     'We can also add filters to mAb metadata fields, such as the antibody binding type or filter by study.',
                onNext:      function(){

                    var event = new Event('mouseenter');
                    var node = nodeTextSearch(document.querySelectorAll('span[id*="gridcolumn"]'), 'Viruses')[0];

                    var checkExist1 = setInterval(
                            function(){
                                if(node !== null){
                                    node.classList.add("virus-column");
                                    node.nextSibling.classList.add("virus-filter");
                                    node.parentElement.dispatchEvent(event);
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelector('span[class*="virus-column"]') !== null &&
                                        document.querySelector('div[class*="virus-filter"]') !== null){
                                    clearInterval(checkExist2);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'div[class*="virus-filter"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     10,
                yOffset:     -25,
                content:     'Clicking here we can now filter on viruses.',
                onNext:      function(){

                    document.querySelector('div[class*="virus-filter"]').click();

                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('label[id*="checkboxfield"]'), "All"));
                                if(nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('label[id*="checkboxfield"]'), "All")).length > 0){
                                    var node = nodes[0];
                                    node.classList.add("neut-tier-all-label");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('label[class*="neut-tier-all-label"]');
                                if(node !== null){
                                    node.click();

                                    clearInterval(checkExist2);
                                }
                            }, 100);

                    var checkExist3 = setInterval(
                            function(){
                                var nodes = nodeTextSearch(document.querySelectorAll('label[id*="checkboxfield"]'), "1B");
                                if(nodes.length > 0){
                                    nodes[0].classList.add("nt-1b-all-label");
                                    clearInterval(checkExist3);
                                }
                            }, 100);

                    var checkExist4 = setInterval(
                            function(){
                                var node = document.querySelector('label[class*="nt-1b-all-label"]');
                                if(node !== null){
                                    node.click();
                                    clearInterval(checkExist4);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'label[class*="nt-1b-all-label"]',
                placement:   'left',
                arrowOffset: 'center',
                xOffset:     -30,
                yOffset:     0,
                content:     'Many of the antibodies are tested against large panels of over 100 viruses, so you may also want to filter the viruses before you plot the data. In this case, we can select viruses that are in the neutralization tier category 1B.  When looking for specific viruses, try CTRL + F to search for the virus name.',
                onNext:      function(){

                    var node = nodePosCoordSearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Done"))[0];
                    node.classList.add('virus-filter-done');
                    node.click();

                    var checkExist = setInterval(
                            function(){
                                if(nodePosCoordSearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Done")).length === 0){
                                    clearInterval(checkExist);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'span[class*="mab-mix-column"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     -20,
                yOffset:     -20,
                content:     'Now that we\'ve filtered the list of mAbs and viruses, we\'ll select the mAbs and mAb mixtures we want to view in the report. We put a check mark next to the mAbs we want to include in the report.',
                onNext:      function(){

                    var event = new Event("click");
                    var node = document.querySelector('span[class*="mab-mix-column"]').
                            parentElement.
                            parentElement.
                            previousSibling;

                    if(node.className.match('x-grid-hd-checker-on') === null) node.dispatchEvent(event);

                    var checkExist1 = setInterval(
                            function(){
                                var node = document.querySelector('span[class*="mab-mix-column"]').
                                        parentElement.
                                        parentElement.
                                        previousSibling;
                                if(node.className.match('x-grid-hd-checker-on') !== null ){
                                    document.querySelectorAll('a[class*=mabgridcolumnsbtn]')[0].classList.add("mab-report-button1");
                                    document.querySelectorAll('a[class*=mabgridcolumnsbtn]')[1].classList.add("mab-report-button2");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelectorAll('a[class*="mab-report-button"]').length === 2 ){
                                    clearInterval(checkExist2);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'a[class*="mab-report-button2"]',
                placement:   'bottom',
                arrowOffset: 'center',
                xOffset:     -120,
                yOffset:     0,
                content:     'Now that we\'ve selected our mAbs and viruses we want to compare, we can view the data in 2 reports.',
                onNext:      function(){

                    document.querySelector('a[class*="mab-report-button2"]').click();
                    var checkExist = setInterval(
                            function(){
                                if(document.querySelector('div[class*="labkey-knitr"]') !== null &&
                                        nodeDisplaySearch(document.querySelectorAll('div[class*="labkey-knitr"]')).length > 0 &&
                                        nodeDisplaySearch(document.querySelectorAll('div[class*="svg-container"]')).length > 0 ){
                                    clearInterval(checkExist);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'div[class*="svg-container"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     0,
                yOffset:     0,
                content:     'The heatmap report shows the titer IC50 for each mAb-virus combination. The titer IC50 (50% maximal inhibitory concentration) is the concentration of the antibody required to achieve 50% neutralization of the virus. A low titer IC50 value indicates more efficient neutralization of the virus by the antibody. The geometric mean of the titer is plotted when the mAb-virus combination is tested in more than one study.  Hover over the cell for each combination to see the titer value.<br><br>If you\'ve selected a large number of mAbs and viruses, the plot content might be very dense and hard to read. Hover over the plot to get the tool bar. Use the tool bar to zoom, pan, and resize the plot.',
                onNext:      function(){

                    document.querySelector('div[class*="iarrow"]').click();
                    var checkExist = setInterval(
                            function(){
                                if(isVisCoords(document.querySelector('a[class*="mab-report-button1"]'))){
                                    clearInterval(checkExist);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'a[class*="mab-report-button1"]',
                placement:   'bottom',
                arrowOffset: 'center',
                xOffset:     -115,
                yOffset:     0,
                content:     'The other report shows the neutralization curves of the mAbs and viruses selected.',
                onNext:      function(){

                    document.querySelector('a[class*="mab-report-button1"]').click();
                    var checkExist = setInterval(
                            function(){
                                if(document.querySelector('button[onclick*="MAb Grid"]') !== null){
                                    document.querySelector('button[onclick*="MAb Grid"]').click();
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                    clearInterval(checkExist);
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'button[onclick*="MAb Grid"]',
                placement:   'bottom',
                arrowOffset: 'left',
                xOffset:     45,
                yOffset:     0,
                content:     'The MAb Grid tab shows neutralization curves for all the mAb/mixture and virus combinations selected. There is also a tab for each of the mAbs/mixtures which shows the neutralization curves of all the viruses the mAb/mixture was tested against. Let\'s open the tab for one of the mAb mixtures and view the report.',
                onNext:      function(){
                    document.querySelector('button[onclick*="PGT121 + PGDM1400"]').click();
                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                }, multipage: true
            },{
                target:      'button[onclick*="PGT121 + PGDM1400"]',
                placement:   'bottom',
                arrowOffset: 'center',
                xOffset:     50,
                yOffset:     0,
                content:     'This tab shows the neutralization curves of all the viruses tested against one of the mAb mixtures. Scroll down to see the details of the curves.',
                onNext:      function(){
                    document.querySelector('button[onclick*="PGT121 + PGDM1400"]').click();
                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                }, multipage: true
            },{
                target:      'h2[class*="mab-filterheader-text"]',
                placement:   'left',
                arrowOffset: 'center',
                xOffset:     0,
                yOffset:     -68,
                content:     'You can save your filters for further exploration during another session. Saved data can also be accessed with our DataSpaceR API (see Tools & links for more details).',
                onNext:      function(){
                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                }

            },{
                target:      'div[class*="iarrow"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     0,
                yOffset:     -24,
                content:     'Clicking this button takes you back to the MAb Grid.',
                onNext:      function(){
                    document.querySelector('div[class*="iarrow"]').click();

                    var checkExist1 = setInterval(
                            function(){
                                var nodes1 = document.querySelectorAll('span[id*="button"]');
                                if(nodes1.length > 0){
                                    var nodes2 = nodeTextSearch(nodes1, "Export CSV");
                                    if(nodes2.length > 0){
                                        var node = nodePosCoordSearch(nodes2)[0];
                                        if(node !== null){
                                            node.classList.add("export-mab-csv");
                                            clearInterval(checkExist1);
                                        }
                                    }
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelector('span[class*="export-mab-csv"]') !== null){
                                    clearInterval(checkExist2);
                                    window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'span[class*="export-mab-csv"]',
                placement:   'left',
                arrowOffset: 'center',
                xOffset:     -10,
                yOffset:     -45,
                content:     'Data can also be exported as zipped CSV files or as an Excel workbook.',
                onNext:    function(){

                    var nodes = null;
                    var promise = new Promise(function(resolve, reject){
                        nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear"));
                        if(nodes.length > 0){
                            resolve();
                        }
                    }).then(function(result){
                        if(nodes[0] !== null){
                            nodes[0].click();

                        }
                    }).then(function(result){
                        document.querySelector('div.nav-label:nth-child(1)').click();

                    }).then(function(result){
                        if(nodeDisplaySearch(document.querySelectorAll('h3[class*="tour-section-title"]')).length > 0){
                            checkTarget('h3[class*="tour-section-title"]');
                        }
                    });
                }
            },{
                target:      'h3[class*="tour-section-title"]',
                placement:   'bottom',
                arrowOffset: 'center',
                title:       'This concludes the tour',
                content:     'We’re back on the Home page where we started. From here you can take another tour or try it out for yourself. <br><br>Have any questions? Click the Help section at the top of the page or contact us for more information.',
                xOffset:     (window.innerWidth / 2) - 280,
                showSkip:     true
            }
            ]
};