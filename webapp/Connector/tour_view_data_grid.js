var tour_view_data_grid  = {
    title:       'View-data-grid',
    description: 'A tour for the "View data grid" section.',
    id:          'tour-view-data-grid',
    winerror:    0,
    i18n:        {
        skipBtn: 'Start the tour'
    },
    onStart:      function(){
        window.onerror = function() { self.winerror = 1; hopscotch.endTour(); };
        if(self.winerror === 0){
            for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
                i.click();
            };
            for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
                j.click();
            };
            self.winerror = 0;
        };
    },
    onEnd:        function(){
        document.querySelector('div.nav-label:nth-child(1)').click();        
        var nodes = null;
        var promise = new Promise(function(resolve, reject){
            nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear"));
            if(nodes.length > 0){
                resolve();
            }
        }).then(function(result){
            nodes[0].click();
        });
    },
    onClose:      function(){
        hopscotch.endTour();
    },
    onError:      function(){
        for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
            i.click();
        };
        for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
            j.click();
        };
        hopscotch.endTour();
    },
    steps:
    [
        {
            target:      'h3[class*="tour-section-title"]',
            placement:   'bottom',
            arrowOffset: 'center',
            title:       'DataSpace tours',
            content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.<br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        },{
            target:    'div.nav-label:nth-child(5)',
            placement: 'left',
            title:     'View and export subject data in the data grid',
            content:   'The View data grid section let\'s you explore the subject data in a spreadsheet format. From this section, you can export the subject data for further exploration in your own analysis tools.',
            yOffset:   -17,
            onNext:    function(){
                document.querySelector('div.nav-label:nth-child(5)').click();
                var checkExist = setInterval(
                    function(){
                        var node1 = nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Add/Remove columns");
                        var node2 = nodeTextSearch(document.querySelectorAll('span[class*="x-column-header-text"]'), "Study")[0];
                        if (node1.length === 1){
                            if(isVisCoords(node1[0]) && node2 !== null) {
                                clearInterval(checkExist);
                                window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            };
                        }
                    }, 100);
            }
        },{
            target:      '.info_Subject',
            placement:   'left',
            arrowOffset: 'center',
            content:     'Let\'s say you wanted to create a plot of the CAVD 434 study for Intracellular Cytokine Staining (ICS) data over time. <br><br>If Grid is your first stop during your session or you haven\'t applied any filters yet, the Active filters will contain all the subjects with data in the DataSpace. <br><br>You can filter to just CAVD 434 data by using the Active filters pane, Find subjects, or View data grid.',
            yOffset:     -65,
            xOffset:     8,
            onNext:      function(){
                
                var event = new Event('mouseenter');
                var checkExist1 = setInterval(
                    function(){
                        var node1 = nodeTextSearch(document.querySelectorAll('span[class*="x-column-header-text"]'), "Study");
                        var node2 = nodeTextSearch(document.querySelectorAll('span[class*="gridtablhdv"]'), "Study and treatment");
                        if( node1.length > 0 && node2.length > 0 && node1[0].nextSibling !== null ){
                            node1[0].classList.add("study-column");
                            node1[0].nextSibling.classList.add("study-filter");
                            node2[0].classList.add("study-treatment-tab");
                            clearInterval(checkExist1);
                        };
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if(document.querySelector('span[class*="study-treatment-tab"]') !== null){
                            checkTarget('span[class*="study-treatment-tab"]');
                            clearInterval(checkExist2);
                        }
                    }, 100);

            }, multipage: true
        },{
            target:      'span[class*="study-treatment-tab"]',
            placement:   'right',
            arrowOffset: 'center',
            xOffset:     10,
            yOffset:     -85,
            content:     'In Grid, the tab called, \'Study and treatment\', contains subject data that will be included regardless of what other data is selected. <br><br>All columns in the grid can be sorted and filtered.',
            onNext:      function(){

                var event = new Event('mouseenter');
                var checkExist1 = setInterval(
                    function(){
                        var node = document.querySelector('span[class*="study-column"]').parentElement;
                        if(node !== null && isVisCoords(node)){
                            node.dispatchEvent(event);
                            clearInterval(checkExist1);
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                        };
                    }, 100);

            }, multipage: true
        },{
            target:      'div[class*="study-filter"]',
            placement:   'top',
            arrowOffset: 'left',
            xOffset:     -20,
            yOffset:     0,
            content:     'You can use the study column to filter to CAVD 434 subjects.',
            onNext:      function(){
                var event = new Event('mouseleave');
                document.querySelector('span[class*="study-column"]').parentElement.dispatchEvent(event);
                document.querySelector('div[class*="x-column"][class*="study-filter"]').click();
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[id*="tbtext"][class*="x-toolbar-text"]'), "Study");
                        if(nodes.length === 1){
                            var node = nodes[0];
                            node.classList.add("data-grid-study-popup");
                            if(isVisCoords(node) && document.querySelector('div[class*="data-grid-study-popup"]') !== null){
                                clearInterval(checkExist1);
                                window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            };
                        };
                    }, 100);

            }, multipage: true
            
        },{
            target:      'div[class*="data-grid-study-popup"]',
            placement:   'top',
            arrowOffset: 'center',
            xOffset:     -25,
            yOffset:     0,
            content:     'Here you can filter on a particular study.',
            onNext:      function(){      

                var checkExist_1 = setInterval(
                    function() {
                        var nodes = nodeDisplaySearch(document.querySelectorAll('div[class*="x-window-filterwindow"]'));
                        if( nodes.length > 0 ){
                            nodeDisplaySearch(
                                nodeTextSearch(
                                    nodes[0].querySelectorAll(
                                        'div[class*="x-grid-cell-inner"]'), 'CAVD 434'
                                )
                            )[0].click();
                            clearInterval(checkExist_1);
                        }
                    }, 100);
                
                var checkExist1 = setInterval(
                    function(){
                        var nodes1 = nodePosCoordSearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), 'Filter'));
                        var nodes2 = nodeDisplaySearch(document.querySelectorAll('div[class*="x-window-filterwindow"]'));
                        
                        if (
                            nodes1.length > 0 &&
                                nodes2.length > 0 &&  
                                nodes2[0].querySelectorAll('tr[class*="x-grid-row-selected"]').length === 1
                        ) {
                            nodes1[0].click();
                            clearInterval(checkExist1);
                        };
                    }, 100);
        
                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="selitem"]'), 'Study: = CAVD 434');
                        if ( nodes.length > 0 ) {
                            var node = nodes[0];
                            if (isVisCoords(node)) {
                                window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());      
                                clearInterval(checkExist2);
                            };
                        };
                    }, 100);
                
            }, multipage: true

        },{
            target:      'div.nav-label:nth-child(4)',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     0,
            yOffset:     -50,
            title:       'Grid keeps track of the data in your session',
            content:     'As you navigate through other areas of the DataSpace, Grid will keep track of the data explored in the session.<br><br>For example, if you go to Plot data...',
            onNext:      function(){
                document.querySelector('div.nav-label:nth-child(4) > span:nth-child(2)').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector("a[class*='yaxisbtn']") !== null &&
                           isVisCoords(document.querySelector("a[class*='yaxisbtn']"))){
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());      
                            clearInterval(checkExist);
                        };
                    }, 100);
            }, multipage: true

        },{
            target:      'a[class*="yaxisbtn"]',
            placement:   'right',
            arrowOffset: 'top',
            xOffset:     5,
            yOffset:     -15,
            content:   '...and create a plot of Intracellular Cytokine Staining (ICS) data over time for the CAVD 434 subjects selected...',
            onNext:      function(){

                document.querySelector('a[class*="yaxisbtn"]').click();
                var checkExist_1 = setInterval(
                    function(){
                        var nodes = nodePosCoordSearch(nodeTextSearch(document.querySelectorAll('div[class="content-label"]'), 'ICS (Intracellular Cytokine Staining)'));
                        if(nodes.length > 0){
                            nodes[0].click();
                            clearInterval(checkExist_1);
                        }
                    }, 100);

                var checkExist0 = setInterval(
                    function(){
                        var dd = document.querySelectorAll('div[class*="field-display"]');
                        if(dd.length > 0){
                            if(isVisCoords(dd[1])){
                                dd[1].click();
                                clearInterval(checkExist0);
                            };
                        };
                    }, 100);

                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeDisplaySearch(document.querySelectorAll('div[class*="functional_marker_name-dropdown"]'));
                        if(nodes.length > 0 && isVisCoords(nodes[0])){
                            var node = nodes[0];
                            node = nodeTextSearch(node.querySelectorAll('label[id*="radiofield"][id*="boxLabelEl"]'), "IL2")[0];
                            node.previousSibling.click();
                            node.previousSibling.classList.add("tour-checked-il2");
                            clearInterval(checkExist1);
                        };
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        var event = new Event('mouseleave');
                        if(document.querySelector('input[class*="tour-checked-il2"]') !== null){
                            var nodes = nodeDisplaySearch(document.querySelectorAll('div[class*="functional_marker_name-dropdown"]'));
                            if(nodes.length > 0){
                                nodes[0].dispatchEvent(event);
                                clearInterval(checkExist2);
                            };
                        };
                    }, 100);
                
                var checkExist3 = setInterval(
                    function(){
                        var nodes1 = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Set y-axis"));
                        var nodes2 = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('div[class*="main-label"]'), "IL2"));
                        if ( nodes1.length > 0 && nodes2.length > 0 ) {
                            nodes1[0].click();
                            clearInterval(checkExist3);
                        };
                    }, 100);

                var checkExist4 = setInterval(
                    function(){
                        var parNodes = [];
                        for(var i of document.querySelectorAll('li[class=source-label]')){
                            parNodes.push(i.parentElement);
                        };
                        if(nodeDisplaySearch(parNodes).length > 0){
                            var node = nodeDisplaySearch(parNodes)[0];
                            if(node !== null){
                                node.classList.add("list-source-label-parent");
                                clearInterval(checkExist4);
                            };      
                        };
                    }
                );

                var checkExist5 = setInterval(
                    function(){
                        if(
                            document.querySelector('div[class*="AntigensInY"]') !== null &&
                                nodeDisplaySearch(document.querySelectorAll('div[class*="AntigensInY"]')).length > 0 &&
                                document.querySelector('ul[class*="list-source-label-parent"]') !== null
                        ){
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist5);
                        };
                    }, 100);
                
            }, multipage: true
            
        },{
            target:    'div.nav-label:nth-child(5)',
            placement: 'left',
            content:   '...the ICS data plotted will carry over to the data grid.<paragraph>Going back to Grid...',
            yOffset:   -17,
            onNext:    function(){
                document.querySelector('div.nav-label:nth-child(5)').click();

                var checkExist1 = setInterval(
                    function(){
                        if(document.querySelector('h1.lhdv:nth-child(2) > span:nth-child(1)') !== null){
                            if(isVisCoords(document.querySelector('h1.lhdv:nth-child(2) > span:nth-child(1)'))){       
                                clearInterval(checkExist1);
                            }
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[class*="gridtablhdv"]'), "ICS"));
                        if(nodes.length > 0){
                            nodes[0].classList.add("ics-data-tab");
                            clearInterval(checkExist2);
                            }
                    }, 100);
                
                var checkExist3 = setInterval(
                    function(){
                        var node = document.querySelector('span[class*="ics-data-tab"]');
                        if(node !== null){
                            node.click();
                            clearInterval(checkExist3);
                        }
                    }, 100);

                var checkExist4 = setInterval(
                    function(){
                        var node = document.querySelector('span[class*="ics-data-tab"]');
                        if(node !== null && node.parentElement.className === "lhdv active"){
                            node.click();
                            checkTarget('span[class*="ics-data-tab"]');
                            clearInterval(checkExist4);
                        }
                    }, 100);


            }, multipage: true
        },{
            target:      'span[class*="ics-data-tab"]',
            placement:   'right',
            arrowOffset: 'center',
            content:     'You now have a tab for the ICS assay data from Plot.<br><br>Clicking on the tab will let you see the data',
            xOffset:     15,
            yOffset:     -65,
            onNext:      function(){

                var checkExist_1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('span[class*="gridtablhdv"]'), "Study and treatment");
                        if( nodes.length > 0 ){
                            nodes[0].click();
                            clearInterval(checkExist_1);
                        }
                    }, 100);                
                
                document.querySelector('div.nav-label:nth-child(5)').click();

                var checkExist1 = setInterval(
                    function(){
                        nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Export CSV")[0].classList.add("export-csv");
                        if(document.querySelector('span[class*="export-csv"]') !== null){
                            checkTarget('span[class*="export-csv"]');
                            clearInterval(checkExist1);
                        }

                    }, 100);

                // var checkExist1 = setInterval(
                //     function(){
                //         nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Add/Remove columns")[0].classList.add("add-rm-col");
                //         if(document.querySelector('span[class*="add-rm-col"]') !== null){
                //             checkTarget('span[class*="export-csv"]');
                //             clearInterval(checkExist1);
                //         }
                //     }, 100);

            }, multipage: true
        // },{
        //     target:    'span[class*="add-rm-col"]',
        //     placement: 'left',
        //     content:   'You can also add additional columns or data types.',
        //     yOffset:   -21,
        //     xOffset:   -14,
        //     onNext:    function(){
        //         var checkExist1 = setInterval(
        //             function(){
        //                 nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Export CSV")[0].classList.add("export-csv");
        //                 if(document.querySelector('span[class*="export-csv"]') !== null){
        //                     window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
        //                     clearInterval(checkExist1);
        //                 }

        //             }, 100);
        //     }, multipage: true
        },{
            target:    'span[class*="export-csv"]',
            placement: 'left',
            content:   'You can save your data for further exploration during another session or export it as zipped CSV files or an Excel workbook. Saved data can also be accessed with our DataSpaceR API (see Tools & links for more details).',
            yOffset:   -22,
            xOffset:   -5,
            onNext:    function(){
                document.querySelector('div.nav-label:nth-child(1)').click();
                var checkExist = setInterval(
                    function(){
                        var node = document.querySelector('h3[class*="tour-section-title"]');
                        if(node !== null && isVisCoords(node)){
                            checkTarget('h3[class*="tour-section-title"]');
                            clearInterval(checkExist);
                        }
                    }, 100);
            }
        },{
            target:      'h3[class*="tour-section-title"]',
            placement:   'bottom',
            arrowOffset: 'center',
            title:       'This concludes the tour',
            content:     'We’re back on the Home page where we started. From here you can take another tour or try it out for yourself. <br><br>Have any questions? Click the Help section at the top of the page or contact us for more information.',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        }
    ]
};

