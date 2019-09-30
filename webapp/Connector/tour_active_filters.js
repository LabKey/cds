var tour_active_filters = {
    title:        'Active_filters',
    description:  'A tour for using "Active filters".',
    id:           'tour-active-filters',
    started:      0,
    i18n:        {
        skipBtn: 'Start the tour'
    },
    onStart:      function(){
        window.onerror = function() { hopscotch.endTour(); };
        if(self.started === 0){
            self.started = 1;
            for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
                i.click();
            };
            for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
                j.click();
            };
        };      
    },
    onEnd:        function(){
        document.querySelector('div.nav-label:nth-child(1)').click();
        for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
            i.click();
        };
        for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
            j.click();
        };
        self.started = 0;
    },
    onClose:      function(){
        hopscotch.endTour();
    },
    onError:      function(){
        hopscotch.endTour();
    },
    steps:
    [
        {
            target:      'h3[class*="tour-section-title"]',
            placement:   'bottom',
            arrowOffset: 'center',
            title:       'Active filters',
            content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.<br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        },{
            target:      'div[class*="filterpanel-header"]',
            placement:   'left',
            arrowOffset: 'center',
            title:       'The Active filters pane tracks data during your session',
            content:     'The Active filters pane gives you a summary of the data being explored during your session and provides you with important context for selecting and interpreting the data.',
            yOffset:     -17
        },{
            target:      'div[class*="status-row info_Subject hl-status-row nolink"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'When you begin a new session, you start off with all the subjects and data in DataSpace, so you\'ll need to filter down to the data you want to explore. Filters can be applied in the Active filters pane, and in any section of the DataSpace where you explore subject data (i.e. in Find subjects, Plot data, and View data grid). <br><br>Note the number of subjects in the data.',
            yOffset:     10
        },{
            target:      'div[class*="info_Species"]',
            placement:   'left',
            arrowOffset: 'center',
            title:       'Filtering data using the Active filters pane',
            content:     'In the Active filter pane, you can filter the data for subjects with specific subject characteristics (such as species), subjects from specific studies, or subjects who received specific products or treatments.',
            yOffset:     -17,
            onNext:      function(){
                checkTarget('div[class*="status-row info_Species"]');
            }
        },{
            target:      'div[class*="status-row info_Species"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'As an example, when we click on the species category \...',
            yOffset:     -17,
            onNext:      function(){
                document.querySelector('.info_Species > li:nth-child(1) > span:nth-child(1)').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('div[title="Human"]') !== null){
                            document.querySelector('div[title="Human"]').click();
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'div[title="Human"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'We see the types of species represented in the data. We can select just one species and click the filter button to apply the filter.',
            xOffset:     -30,
            yOffset:     -55,
            onNext:      function(){
                document.querySelector('a[class*="x-btn filterinfoaction x-unselectable"]').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('div[class="x-container filterstatus-content x-container-default"]') !== null){
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'div[class*="x-container filterstatus-content x-container-default"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'We can see that our filter has been applied.',
            yOffset:     -17
        },{
            target:      '.info_Species > li:nth-child(1) > span:nth-child(1)',
            placement:   'left',
            arrowOffset: 'center',
            content:     'We can also see that the number of subjects, studies, products, and treatments has decreased.',
            yOffset:     -17,
            onNext:      function(){
                document.querySelector('.info_Species > li:nth-child(1) > span:nth-child(1)').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('span[class*="sorter-content"]') !== null){
                            document.querySelector('span[class*="sorter-content"]').click();
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'span[class*="sorter-content"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'Each category has multiple related fields that can be filtered. To see the other fields available, click on the red arrow next to the category to expand the list. In this case, there are other subject characteristics to choose from.',
            yOffset:     -17,
            onNext:      function(){
                document.querySelector('a[class*="x-btn filterinfocancel x-unselectable"]').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('.info_Study > li:nth-child(1) > span:nth-child(1)') !== null){
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      '.info_Study > li:nth-child(1) > span:nth-child(1)',
            placement:   'left',
            arrowOffset: 'center',
            content:     'Once you have applied one or more filters, if we click on the Studies row...',
            yOffset:     -17,
            onNext:      function(){
                document.querySelector('.info_Study > li:nth-child(1)').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('span[class*="sorter-content"]') !== null){
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'div[class*="infopane"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'The studies will be listed under \'Has data in active filters\' and \'No data in active filters\' to indicate if any subjects in that study meet the filter criteria.',
            onNext:      function(){
                // Need to handle what if there are two of these?
                // document.querySelectorAll('div[class*="infopane"]')
                window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
            }
        },{
            target:      'div[title*="CAVD 256"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'Hover over one of the studies to see the red info link to the study page.',
            xOffset:     -30,
            onNext:      function(){
                document.querySelector('a[class*="x-btn filterinfocancel x-unselectable"]').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('span[class*="closeitem"]') !== null){
                            document.querySelector('span[class*="closeitem"]').style.display = 'block';
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'span[class*="closeitem"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'You can remove a filter by clicking the red <font color="red"><b>❌</b></font> in the corner of the filter box. The Clear button removes all filters. Click the Save button to save your filters for further exploration in a future session.',
            xOffset:     -200,
            yOffset:     -15,
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
