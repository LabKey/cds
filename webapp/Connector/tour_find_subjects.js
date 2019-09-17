var tour_find_subjects = {
    title:       'Find-subjects',
    description: 'A tour for the "Find subjects" section.',
    id:          'tour-find-subjects',
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
            target:    'div.nav-label:nth-child(3)',
            placement: 'left',
            title:     'Finding subjects and studies of interest',
            content:   'The Find subjects section helps you find subjects with common characteristics. You can also use it to profile the subject characteristics of a specific study or set of studies.',
            yOffset:   -17,
            onNext:    function() {
                document.querySelector('div.nav-label:nth-child(3) > span:nth-child(2)').click();
                var checkExist = setInterval(
                    function() {
                        if(nodeDisplaySearch(document.querySelectorAll('div[id*=summarydataview]')).length > 0){
                            window.location = 'cds-app.view?#summary';
                            checkTarget('div[id*=summarydataview]');
                            clearInterval(checkExist);
                        }
                    }, 100);
            },
            multipage: true
        },{
            target:      'div[id*=summarydataview]',
            placement:   'top',
            arrowOffset: 'center',
            xOffset:     70,
            content:     'Here we see a set of parameters we can use to search for subjects and studies.',
            onNext:      function(){
                document.querySelector('div[id*=summarydataview]').firstChild.nextSibling.classList.add("by-products-row");
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('div[class*="by-products-row"]') !== null){
                            checkTarget('div.row:nth-child(2)');
                            clearInterval(checkExist);
                        }
                    }, 100);
            },
            multipage: true
        },{
            target:      'div.row:nth-child(2)',
            placement:   'top',
            arrowOffset: 'center',
            xOffset:     70,
            content:     'Clicking the "Products" row will let you find the products for which there is data available in DataSpace.',
            onNext:      function(){
                document.querySelector("div.row:nth-child(2)").click();
                var checkExist = setInterval(
                    function(){
                        if (document.querySelector('#sae-hierarchy-dropdown') !== null && document.querySelectorAll('span[class="parrow"]') !== null) {
                            document.querySelector('#sae-hierarchy-dropdown').click();
                            checkTarget('span[class="parrow"]');
                            clearInterval(checkExist);
                        };
                    }, 100);
            },
            multipage: true
        },{
            target:      'span[class="parrow"]',
            placement:   'top',
            arrowOffset: 'left',
            xOffset:     -20,
            content:     'Each category has other related categories that can be viewed. When we click on the red arrow next to the category, it expands the list',
            onNext:      function(){
                document.querySelector('div[class*="x-container titlepanel secondary"]').click();
                checkTarget('.bargroup');
            }, multipage: true
            
        },{
            target:      '.bargroup',
            placement:   'top',
            arrowOffset: 'left',
            xOffset:     70,
            content:     'This column shows the products by name.',
            onNext:      function(){
                function nodeSearch(nodeList, strVal){
                    for(i = 0; i < bars.length; i++){
                        if(bars[i].innerHTML === strVal){
                            bars[i].nextSibling.nextSibling.classList.add('index-selected', 'inactive');
                            return(bars[i]);
                        }
                    }
                    return("none found");
                };
                var bars = document.querySelectorAll('span[class="barlabel"]');
                var topElem = nodeSearch(bars, "AIDSVAX B/E");
                var botElem = nodeSearch(bars, "ALVAC (vCP1521)");
                nodeSearch(bars, "Alum");
                topElem.classList.add('bubblePoint');
                botElem.scrollIntoView(alignToTop = false);
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('span[class*="bubblePoint"]') !== null){
                            checkTarget('span[class*="bubblePoint"]');
                            clearInterval(checkExist);
                        };
                    }, 100);

            }, multipage: true
        },{
            target:      'span[class*="bubblePoint"]',
            placement:   'top',
            arrowOffset: 'left',
            xOffset:     70,
            content:     'Find a product of interest. When hovering over the text, teal indicates other products that have been administered with this product.',
            onNext:      function(){
                var bars = document.querySelectorAll('span[class="barlabel"]');
                var botElem = nodeTextSearch(bars, "ALVAC (vCP1521)")[0];
                var checkExist = setInterval(
                    function(){
                        if(nodeTextSearch(bars, "ALVAC (vCP1521)").length > 0){
                            nodeTextSearch(bars, "ALVAC (vCP1521)")[0].click();
                            checkTarget('h2[class*="filterheader-text"]');
                            clearInterval(checkExist);
                        };
                    }, 100);
            }
        },{
            target:      'h2[class*="filterheader-text"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     0,
            yOffset:     0,
            content:     'Clicking on a product will select that product. The Active filters show the impact of that selection on your data filters prior to applying the filter. The counts in teal show how many subjects received this product.',
        },{
            target:      'a[class="x-btn x-unselectable x-btn-toolbar x-box-item x-toolbar-item x-btn-rounded-inverted-accent-toolbar-small x-noicon x-btn-noicon x-btn-rounded-inverted-accent-toolbar-small-noicon"]',
            placement:   'bottom',
            arrowOffset: '250',
            xOffset:     -250,
            content:     'Clicking the Filter button applies the filter to the data in your session.',
            onNext:      function(){
                document.getElementsByClassName('x-btn x-unselectable x-btn-toolbar x-box-item x-toolbar-item x-btn-rounded-inverted-accent-toolbar-small x-noicon x-btn-noicon x-btn-rounded-inverted-accent-toolbar-small-noicon')[0].click();
                var checkExist = setInterval(
                    function(){
                        if (false){
                            checkTarget('ul[class="detailstatus"]');
                        }
                    }, 100);
            }
        },{
            target:      'ul[class="detailstatus"]',
            placement:   'bottom',
            arrowOffset: '250',
            xOffset:     -110,
            yOffset:     10,
            content:     'The total number of subjects has been reduced and a summary of those subjects is seen here.'
        },{
            target:      'h2[class*="filterheader-text"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     0,
            yOffset:     -45,
            content:     'You can save your filter or clear it by clicking the "clear" or "save" buttons.',
            onNext:      function(){

                var hedr = document.querySelectorAll('h1[class*="lhdv"]');
                var shdr = nodeTextSearch(hedr, "Subject characteristics")[0];
                shdr.click();
                shdr.classList.add("find-subj-char");

                var checkExist = setInterval(
                    function() {
                        var node = document.querySelector('h1[class*="find-subj-char"]');
                        if (
                            node !== null &&
                                node.className.match("active") !== null &&
                                isVisCoords(node)
                        ) {
                            checkTarget('h1[class*="find-subj-char"]');
                            clearInterval(checkExist);
                        }
                    }, 100);            
                
            }, multipage: true
        },{
            target:    'h1[class*="find-subj-char"]',
            placement: 'top',
            content:   'Looking at Subject characteristics...',
            yOffset:   20,
            onNext:    function() {
                document.querySelector('span[class*="parrow"]').click();                
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('div[id*="boundlist"]').style.display !== "none") {
                            var subj = document.querySelectorAll('li[class*="x-boundlist-item"]');
                            var ages = nodeTextSearch(subj, "Age")[0];
                            var spec = nodeTextSearch(subj, "Species")[0];
                            ages.classList.add("x-boundlist-selected");
                            spec.classList.remove("x-boundlist-selected");
                            checkTarget('span[class*="parrow"]');
                            clearInterval(checkExist);
                        }

                    }, 100);            
            }, multipage: true            
        },{
            target:    'span[class*="parrow"]',
            placement: 'top',
            content:   'Clicking Age...',
            yOffset:   0,
            xOffset:   -20,
            onNext:    function() {
                document.querySelector('span[class*="parrow"]').click();
                document.querySelector('li[class*="x-boundlist-selected"]').click();
                var checkExist = setInterval(
                    function(){
                        if(document.querySelectorAll('div[class*="saeparent"]').length > 0) {
                            document.querySelectorAll('div[class="saeparent"]')[3].firstChild.classList.add("age-elem");
                            document.querySelector("div[class*='age-elem']").click();
                            clearInterval(checkExist);
                            checkTarget('div[class*="age-elem"]');
                        }
                    }, 100);
                
            }, multipage: true
        },{
            target:      'div[class*="age-elem"]',
            placement:   'top',
            arrowOffset: 'left',
            content:     'Now that we\'ve identified a group of subjects, we can look at their subject characteristics, e.g. by age category, by expanding with the plus sign.',
            xOffset:     -20,
            onNext:      function(){
                var node = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Hide empty"))[0];
                node.classList.add("hide-empty-btn");
                var checkExist = setInterval(
                    function(){
                        if(document.querySelector('span[class*="hide-empty-btn"]') !== null){
                            checkTarget('span[class*="hide-empty-btn"]');
                            clearInterval(checkExist);
                        }
                    }, 100);

            }, multipage: true
        },{
            target:      'span[class*="hide-empty-btn"]',
            placement:   'left',
            arrowOffset: 'center',
            yOffset:     -47,
            content:     'Click on the Hide/Show empty button to remove categories that don\'t have subjects.',
            onNext:      function(){
                document.querySelector('span[class*="hide-empty-btn"]').click();
                var checkExist = setInterval(
                    function(){
                        var node = document.querySelector('h3[class*="tour-section-title"]');
                        if(node !== null && isVisCoords(node)){
                            checkTarget('h3[class*="tour-section-title"]');
                            clearInterval(checkExist);
                        }
                    }, 100);

                checkTarget('div.nav-label:nth-child(1)');
            }, multipage: true
        },{
            target:    'div.nav-label:nth-child(1)',
            placement: 'left',
            yOffset:   -17,
            content:   'Clicking home takes send you back to the front page.',
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
