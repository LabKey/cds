var tour_get_oriented = {
    title:       'Get-oriented',
    description: 'A tour for getting oriented with DataSpace.',
    id:          'tour-get-oriented',
    winerror:    0,
    i18n:        {
        skipBtn: 'Start the tour'
    },
    onStart:      function(){
        window.onerror = function() { self.winerror = 1; hopscotch.endTour(); };
        if(self.winerror === 1){
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
            title:       'Get oriented to the DataSpace',
            content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        },{
            target:      'div.nav-label:nth-child(1)',
            placement:   'left',
            title:       'Getting around the DataSpace',
            content:     'Let\'s take a look at the main areas of the DataSpace.',
            yOffset:     -17
        },{
            target:      'div.nav-label:nth-child(2)',
            placement:   'left',
            title:       'Learn about',
            content:     'The Learn about section is where you\'ll find information about the studies conducted by the research networks, and the products, assays, and antibodies being evaluated in those studies. You can also search for publications and view reports from those studies.',
            yOffset:     -17
        },{
            target:      'div.nav-label:nth-child(3)',
            placement:   'left',
            title:       'Subject data',
            content:     'The Find subjects, Plot data, and View data grid sections are where you can explore the study subject data.',
            yOffset:     -17
        },{
            target:      'div.nav-label:nth-child(3)',
            placement:   'left',
            title:       'Find subjects',
            content:     'The Find subjects section helps you find subjects with common characteristics. You can also use it to profile the subject characteristics of a specific study or set of studies.',
            yOffset:     -17
        },{         
            target:      'div.nav-label:nth-child(4)',
            placement:   'left',
            title:       'Plot data',
            content:     'The Plot data section is where you can explore the subject data using simple plots that allow you to compare the data across studies and assays.',
            yOffset:     -17
        },{
            target:      'div.nav-label:nth-child(5)',
            placement:   'left',
            title:       'View data grid',
            content:     'The View data grid section let\'s you explore the subject data in a spreadsheet format. From this section, you can export the subject data for further exploration in your own analysis tools.',
            yOffset:     -17
        },{
            target:      'div.nav-label:nth-child(6)',
            placement:   'left',
            title:       'Monoclonal antibodies',
            content:     'The Monoclonal antibodies section is where you can explore data from monoclonal antibody characterization studies. In this section, you can search for antibodies and compare the neutralization curves and heatmaps for different antibody-virus combinations.',
            yOffset:     -17
        },{
            target:      'div[class*="filterpanel-header"]',
            placement:   'left',
            title:       'Active filters',
            content:     'The Active filter pane gives you a summary of the data being explored during your session and provides you with important context for selecting and interpreting the data.',
            yOffset:     -17,
            onNext:      function(){

                function getScrollParent(node) {
                    if (node == null) {
                        return null;
                    } else if (node.style.overflow == "hidden auto") {
                        return node;
                    } else {
                        return getScrollParent(node.parentNode);
                    }
                }

                nodeTextSearch(document.querySelectorAll('h2[class*="section-title"]'), "Groups and plots")[0].classList.add("groups-plots");
                getScrollParent(nodeTextSearch(document.querySelectorAll('h3'), "Explore relationships")[0]).classList.add("quick-link-scroll-frame");
                var smt = null;

                var checkExist_1 = setInterval(
                    function(){
                        var node = document.querySelector('h2[class*="groups-plots"]');
                        if(node !== null){
                            smt = Math.max(node.getBoundingClientRect().y - 200, 0);
                            clearInterval(checkExist_1);
                        }
                    }, 100); 
            
                var checkExist1 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="quick-link-scroll-frame"]');
                        if(node !== null && smt !== null){
                            node.scrollTo({left: 0, top: smt, behavior: 'smooth'});
                            clearInterval(checkExist1);
                       }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="quick-link-scroll-frame"]');
                        if(
                            node !== null &&
                                smt !== null &&
                                (node.scrollTop === smt ||
                                 Math.abs((node.clientHeight + node.scrollTop) - node.scrollHeight) < 3)
                          ){
                            checkTarget('h2[class*="groups-plots"]');
                            clearInterval(checkExist2);
                        }
                    }, 100);
                
            }, multipage: true
        },{
            target:      'h2[class*="groups-plots"]',
            placement:   'top',
            arrowOffset: 'left',
            title:       'Curated groups and plots',
            content:     'This Saved groups and plots section on the Home page is where the DataSpace team shares plots and subject groups with all members. You can save your own groups here, too.  Your groups will only be accessible to you.',
            yOffset:     -17
        },{
            target:      'div[id*="cds-news"]',
            placement:   'top',
            arrowOffset: 'left',
            title:       'News',
            content:     'The News section on the Home page is where you\'ll find blogs about how other members have used the DataSpace. We\'ll also let you know about new data, new features, and collaboration opportunities.',
            yOffset:     -17,
            onNext:    function(){

                var smt = null;

                var checkExist_1 = setInterval(
                    function(){
                        var node = document.querySelector('h3[class*="tour-section-title"]');
                        if(node !== null && smt === null){
                            smt = Math.max(node.getBoundingClientRect().y - 300, 0);
                            clearInterval(checkExist_1);
                        }
                    }, 100);
                
                var checkExist1 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="quick-link-scroll-frame"]');
                        if(node !== null && smt !== null){
                            node.scrollTo({left: 0, top: smt, behavior: 'smooth'});
                            clearInterval(checkExist1);
                       }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="quick-link-scroll-frame"]');
                        if(
                            node !== null &&
                                smt !== null &&
                                (node.scrollTop === smt ||
                                 node.scrollTop === 0)
                          ){
                            checkTarget('h3[class*="tour-section-title"]');
                            clearInterval(checkExist2);
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
