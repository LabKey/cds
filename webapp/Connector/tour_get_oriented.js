var tour_get_oriented = {
    title:       'Get-oriented',
    description: 'A tour for getting oriented with DataSpace.',
    id:          'tour-get-oriented',
    started:     0,
    i18n:        {
        skipBtn: 'Start The Tour'
    },
    onStart:     function(){
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
    onEnd:       function(){
        document.querySelector('div.nav-label:nth-child(1)').click();
        for(var i of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "clear")){
            i.click();
        };
        for(var j of nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Cancel")){
            j.click();
        };
        self.started = 0;
    },
    onClose:     function(){
        hopscotch.endTour();
    },
    onError:     function(){
        hopscotch.endTour();
    },
    steps:
    [
        {
            target:      'h3[class*="tour-section-title"]',
            placement:   'bottom',
            arrowOffset: 'center',
            title:       'DataSpace tours',
            content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. <br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
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
                var samt = scrollAmount(document.querySelector('div[class*="x-component grouplist-view x-component-default"]'));
                var node = document.querySelector('div[id*=homeheader]').nextSibling;
                node.scroll(samt.x, samt.y);
                var checkExist = setInterval(
                    function(){
                        var nloc = scrollAmount(document.querySelector('div[class*="x-component grouplist-view x-component-default"]'));
                        if(nloc.x == 0 && nloc.y == 0){
                            clearInterval(checkExist);
                            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
                        }
                    }, 100);  
            }
        },{
            target:      'div[class*="x-component grouplist-view x-component-default"]',
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
            content:     'We’re back on the Home page where we started. From here you can take another tour or try it out for yourself. Have any questions? Click the Help section at the top of the page or contact us for more information.',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        }
    ]
};
