var tour_learn_about = {
    title:       'Learn-about',
    description: 'A tour for the "Learn about" section.',
    id:          'tour-learn-about',
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
    onEnd:       function(){
        self.started = 0;
        document.querySelector('div.nav-label:nth-child(1)').click();
        var node = null;
        var promise = new Promise(function(resolve, reject) {
            node = document.querySelector('input[class*="search-studies"]');
            if(node !== null){
                resolve();
            }
        }).then(function(result) {
            node.value = "";
            if(node.value === ""){

            }
        }).then(function(result) {
            var event = new Event("change");
            node.dispatchEvent(event);

        });

    },
    onClose:     function(){
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
                    title:       'Learn about',
                    content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.<br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
                    xOffset:     (window.innerWidth / 2) - 280,
                    showSkip:    true
                },{
                target:    'div.nav-label:nth-child(2) > span:nth-child(2)',
                placement: 'left',
                title:     'Finding information in Learn about',
                content:   'The Learn about section is where you\'ll find information about the studies conducted by the research networks, and the products, assays, and antibodies being evaluated in those studies.',
                yOffset:   -17,
                onNext:    function() {
                    document.querySelector('div.nav-label:nth-child(2) > span:nth-child(2)').click();
                    var checkExist = setInterval(
                            function() {
                                if (document.querySelector('div[class*="learn-dim-selector"]') !== null &&
                                        document.querySelector('div[id*=learnheaderdataview]') !== null &&
                                        isVisCoords(document.querySelector('div[id*=learnheaderdataview]')) &&
                                        nodeDisplaySearch(document.querySelectorAll('td[class*=x-grid-cell]')).length > 0
                                ) {
                                    window.location = 'cds-app.view?#learn/learn/Study';
                                    checkTarget('div[id*=learnheaderdataview]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                },
                multipage: true
            },{
                target:       'div[id*=learnheaderdataview]',
                placement:    'bottom',
                arrowOffset:  'center',
                xOffset:      64,
                yOffset:      25,
                title:        'Select a topic',
                content:      'In the Learn about section, there are 5 categories to explore -- Studies, Assays, Products, Monoclonal antibodies, Publications, and Reports.',
                onNext:       function() {

                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h1[class*="lhdv"]'), "Studies"));
                                if(nodes.length > 0) {
                                    nodes[0].classList.add("learn-studies-tab");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelector('h1[class*="learn-studies-tab"]') !== null) {
                                    checkTarget('h1[class*="learn-studies-tab"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:       'h1[class*="learn-studies-tab"]',
                placement:    'bottom',
                arrowOffset:  'left',
                yOffset:      0,
                content:      'The Studies tab, contains a list of the studies conducted by the research networks contributing data and information to the DataSpace. Studies are listed by the network-assigned study number. Because not everyone is familiar with the study numbers, there are other ways to search for studies of interest. Each study in this view has a brief description and other summary information such as the study type, investigator, vaccine strategy used, products used, and study status.',
                onNext:       function() {
                    document.querySelector('div[id^="templatecolumn"][id*="-titleEl"]').classList.add("x-column-header-over");
                    var checkExist = setInterval(
                            function(){
                                if(
                                        document.querySelector('div[id^="templatecolumn"][id*="-triggerEl"][class*="x-column-header-over"]') !== null
                                ){
                                    checkTarget('div[id^="templatecolumn"][id*="-triggerEl"]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                }
            },{
                target:    'div[id^="templatecolumn"][id*="-triggerEl"]',
                placement: 'top',
                title:     'Learn about - Studies',
                content:   'Use the column headers to sort and filter the list of studies.',
                xOffset:   -20,
                onNext:    function() {
                    document.querySelector('div[id^="templatecolumn"][id*="-triggerEl"]').click();
                    var checkExist = setInterval(
                            function() {
                                if (
                                        document.querySelector('a[class*="x-btn filter-btn x-unselectable x-box-item x-toolbar-item"]') !== null &&
                                        document.querySelectorAll('a[class*="x-btn filter-btn x-unselectable x-box-item x-toolbar-item"]').length === 3 &&
                                        document.querySelector('button[class*=sortDropdown][class*=ipdropdown]')
                                ) {
                                    document.querySelector('div[id^="templatecolumn"][id*="-titleEl"]').classList.remove("x-column-header-over");
                                    document.querySelector('button[class*=sortDropdown][class*=ipdropdown]').click();
                                    checkTarget('button[class*=sortDropdown][class*=ipdropdown]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                },
                multipage: true
            },{
                target:      'button[class*=sortDropdown][class*=ipdropdown]',
                placement:   'top',
                content:     'Each column has 2 related fields that can be filtered. To see the other fields available, click on the red arrow next to the category to expand the list. In this case, you can choose to filter on study name or network.',
                placement:   'top',
                arrowOffset: 'right',
                yOffset:     0,
                xOffset:     -15,
                onNext:      function(){

                    var checkExist_4 = setInterval(
                            function(){
                                var nodes = nodeDisplaySearch(document.querySelectorAll('div[id*="menuitem"]'));
                                if ( nodes.length > 0 ) {
                                    nodes[0].classList.add("search-by-menu-dropdown");
                                    clearInterval(checkExist_4);
                                }
                            }, 100);

                    var checkExist_3 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="search-by-menu-dropdown"]');
                                if ( node !== null ) {
                                    node.click();
                                    clearInterval(checkExist_3);
                                }
                            }, 100);

                    var checkExist_2 = setInterval(
                            function(){
                                var nodes = nodeDisplaySearch(document.querySelectorAll('a[class*="x-btn-custom-toolbar-small x-noicon x-btn-noicon"]'));
                                if ( nodes.length > 0 ) {
                                    nodes[0].click();
                                    clearInterval(checkExist_2);
                                }
                            }, 100
                    );

                    var checkExist_1 = setInterval(
                            function() {
                                if(
                                        nodeDisplaySearch(document.querySelectorAll('div[class*=window-body-filterwindow]')).length === 0 &&
                                        nodeDisplaySearch(document.querySelectorAll('input')).length !== 0
                                ){
                                    nodeDisplaySearch(document.querySelectorAll('input'))[0].classList.add("search-studies");
                                    clearInterval(checkExist_1);
                                }
                            }, 100);

                    var checkExist1 = setInterval(
                            function(){
                                var node = document.querySelector('input[class*="search-studies"]');
                                if(node !== null){
                                    node.value = "434";
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('input[class*="search-studies"]');
                                var event = new Event("change");
                                if(node !== null && node.value === "434"){
                                    node.dispatchEvent(event);
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                    var checkExist3 = setInterval(
                            function(){
                                var node1 = document.querySelector('tr[id*="gridview"][id*="record-cvd434"]');
                                var node2 = document.querySelector('input[class*="search-studies"]');
                                if(
                                        node1 !== null &&
                                        node2 !== null &&
                                        node1.nextSibling === null &&
                                        node1.previousSibling === null &&
                                        isVisCoords(node1) &&
                                        node2.value == "434"
                                ){
                                    checkTarget('input[class*="search-studies"]');
                                    clearInterval(checkExist3);
                                }
                            },100);

                }, multipage: true
            },{
                target:    'input[class*="search-studies"]',
                placement: 'left',
                content:   'You can also use the search bar to find a specific study.',
                yOffset:   -17,
                onNext:    function(){
                    var checkExist = setInterval(
                            function() {
                                if(
                                        document.querySelector('tr[id*="gridview"][id*="record-cvd434"]') !== null &&
                                        isVisCoords(document.querySelector('tr[id*="gridview"][id*="record-cvd434"]'))
                                ){
                                    checkTarget('tr[id*="record-cvd434"]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                }, multipage: true
            },{
                target:      'tr[id*="record-cvd434"]',
                placement:   'top',
                arrowOffset: 'center',
                content:     'Clicking anywhere in the row takes you to the study page.',
                onNext:      function(){
                    document.querySelector('tr[id*="record-cvd434"]').click();
                    var checkExist = setInterval(
                            function() {
                                if(document.querySelectorAll("div[class*='x-container modulecontainercolumn x-box-item']").length === 2){
                                    checkTarget('div[id*="app-module-studyheader"]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                }, multipage: true

            },{
                target:      'div[id*="app-module-studyheader"]',
                placement:   'right',
                arrowOffset: 'top',
                xOffset:     -200,
                yOffset:     -75,
                content:     'On the study pages, you\'ll find background information about the study, including the type of study, the species being studied, the grant under which it was conducted, as well as the study objectives, rationale, and methods.  Treatment and assay schemas provide a summary view of vaccination administration and assay testing schedules.',
                onNext:       function(){

                    function getScrollParent(node) {
                        if (node == null) {
                            return null;
                        }
                        if (node.scrollHeight > node.clientHeight) {
                            return node;
                        } else {
                            return getScrollParent(node.parentNode);
                        }
                    }

                    var smt = null;
                    var checkExist_2 = setInterval(
                            function(){
                                var nodes = nodeTextSearch('h3', "Findings");
                                if(nodes.length > 0){
                                    nodes[0].classList.add("findings-header");
                                    clearInterval(checkExist_2);
                                }
                            }, 100);

                    var checkExist_1 = setInterval(
                            function(){
                                var node = document.querySelector('h3[class*="findings-header"]');
                                if(node !== null && smt === null){
                                    smt = Math.max(node.getBoundingClientRect().y - 300, 0);
                                    clearInterval(checkExist_1);
                                }
                            }, 100);

                    var checkExist1 = setInterval(
                            function(){
                                if(document.querySelector('h3[class*="findings-header"]') !== null && smt !== null) {
                                    getScrollParent(document.querySelector('div[class="x-container auto-scroll-y x-container-default"]')).classList.add("find-scroll-frame");
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    // if(smt + node.clientHeight > node.scrollHeight) smt = node.scrollHeight - node.clientHeight

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if(node !== null){
                                    node.scrollTo({left: 0, top: smt, behavior: 'smooth'});
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                    var checkExist3 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if (
                                        node !== null && smt != null &&
                                        ( Math.abs(node.scrollTop - smt) < 3  ||
                                                Math.abs((node.clientHeight + node.scrollTop) - node.scrollHeight) < 3)
                                ){
                                    checkTarget('h3[class*="findings-header"]');
                                    clearInterval(checkExist3);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'h3[class*="findings-header"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     -200,
                yOffset:     -55,
                content:     'Completed studies include a summary of findings and links to publications.',
                onNext:      function(){

                    var snd = null;
                    var smt = null;
                    var checkExist1 = setInterval(
                            function(){
                                snd = document.querySelector('div[class*="find-scroll-frame"]');
                                if( snd !== null ){
                                    smt = Math.max((snd.scrollTop + document.querySelector('div[id*="app-module-contactcds"]').getBoundingClientRect().y - 300), 0);
                                    document.querySelector('div[class*="find-scroll-frame"]').scrollTo({left: 0, top: smt, behavior: 'smooth'});
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if (
                                        node !== null &&
                                        smt != null &&
                                        Math.abs(node.scrollTop - smt) < 3
                                ) {
                                    checkTarget('div[id*="app-module-contactcds"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'div[id*="app-module-contactcds"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     -200,
                yOffset:     -60,
                content:     'Additional resources and contact information are available for follow up questions.',
            },{
                target:      'div[id*="app-module-studyproducts"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     -200,
                yOffset:     -60,
                content:     'Links to the Product pages in Learn about provide more information for the products tested in the study.',
                onNext:      function(){

                    var smt = Math.max(document.querySelector('div[id*="app-module-dataavailability"]').getBoundingClientRect().y - 300, 0);
                    var checkExist1 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if(node !== null){
                                    document.querySelector('div[class*="find-scroll-frame"]').scrollTo({left: 0, top: smt, behavior: 'smooth'});
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if(
                                        node !== null && smt != null &&
                                        ( Math.abs(node.scrollTop - smt) < 3 ||
                                                Math.floor(node.clientHeight + node.scrollTop) === Math.floor(node.scrollHeight) )
                                ){
                                    checkTarget('div[id*="app-module-dataavailability"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'div[id*="app-module-dataavailability"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     -200,
                yOffset:     -78,
                content:     'This section gives you a summary of the data collected during the study and whether the data is available via the DataSpace. Hover over the data type to get the status.  Assays highlighted in red are links to the Assay pages in Learn about.',
                onNext:      function(){

                    var smt = null;
                    var node = null;
                    var checkExist1 = setInterval(
                            function(){
                                node = document.querySelector('div[class*="find-scroll-frame"]');
                                smt = Math.max(document.querySelector('div[id*="app-module-studyreports"]').getBoundingClientRect().y - 100, 0);
                                if(node !== null && smt !== null){
                                    node.scrollTo({left: 0, top: smt, behavior: 'smooth'});
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if(
                                        node !== null && smt != null &&
                                        ( Math.abs(node.scrollTop - smt) < 3 ||
                                                Math.floor(node.clientHeight + node.scrollTop) === Math.floor(node.scrollHeight) )
                                ){
                                    checkTarget('div[id*="app-module-studyreports"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'div[id*="app-module-studyreports"]',
                placement:   'right',
                arrowOffset: 'center',
                xOffset:     -200,
                yOffset:     -60,
                content:     'Some studies have additional reports or presentations to summarize study findings.',
                onNext:      function(){

                    var smt = null;
                    var node = null;
                    var checkExist1 = setInterval(
                            function(){
                                node = document.querySelector('div[class*="find-scroll-frame"]');
                                smt = Math.max(document.querySelector('.iarrow').getBoundingClientRect().y - 300, 0);
                                if(node !== null && smt !== null){
                                    document.querySelector('div[class*="find-scroll-frame"]').scrollTo({left: 0, top: smt, behavior: 'smooth'});
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                var node = document.querySelector('div[class*="find-scroll-frame"]');
                                if (
                                        node !== null && smt != null &&
                                        ( Math.abs(node.scrollTop - smt) < 3  ||
                                                Math.floor(node.clientHeight + node.scrollTop) === Math.floor(node.scrollHeight) )
                                ){
                                    checkTarget('.iarrow');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      '.iarrow',
                placement:   'right',
                arrowOffset: 'top',
                content:     'Clicking this arrow sends the page back to Learn about.',
                onNext:      function(){

                    document.querySelector('.iarrow').click();
                    var event = new Event("change");

                    var ck1 = setInterval(
                            function(){
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null){
                                    document.querySelector('input[id*=learn-search]').value = "";
                                    clearInterval(ck1);
                                }
                            }, 100);

                    var ck2 = setInterval(
                            function(){
                                var event = new Event("change");
                                var node = document.querySelector('input[id*="learn-search"]');
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null &&
                                        document.querySelector('input[id*=learn-search]').value === ""){
                                    document.querySelector('input[id*=learn-search]').dispatchEvent(event);
                                    clearInterval(ck2);
                                }
                            }, 100);

                    var ck3 = setInterval(
                            function(){
                                var nodes =  nodeDisplaySearch(document.querySelectorAll('h1[class*="lhdv"][class*=active]'));
                                if( nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h2'), 'CAVD 434')).length > 0 &&
                                        !isVisCoords(nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h2'), 'CAVD 434'))[0]) &&
                                        nodes.length > 0
                                ){
                                    nodes[0].nextSibling.click();
                                    nodes[0].nextSibling.classList.add("learn-assay-tab");
                                    clearInterval(ck3);
                                }
                            }, 100);

                    var ck5 = setInterval(
                            function(){
                                if(document.querySelector('h1[class*="learn-assay-tab"]') !== null){
                                    checkTarget('h1[class*="learn-assay-tab"]');
                                    clearInterval(ck5);
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'h1[class*="learn-assay-tab"]',
                placement:   'right',
                arrowOffset: 'bottom',
                title:       'Learn about - Assays',
                content:     'Assay pages describe the assay methods and endpoints and show which studies have data for the assay. Each assay page contains assay dimensions and variable definitions to provide background on the assay data.',
                onNext:      function(){

                    var event = new Event("change");
                    nodeDisplaySearch(document.querySelectorAll('h1[class*="lhdv"]'))[2].click();

                    var checkExist1 = setInterval(
                            function() {
                                if(document.querySelector('input[placeholder*="Search products"]') !== null){
                                    var inbox = document.querySelector('input[placeholder*="Search products"]');
                                    inbox.value = "ALVAC";
                                    inbox.dispatchEvent(event);
                                    clearInterval(checkExist1);
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function() {
                                if(nodeDisplaySearch(document.querySelectorAll('h2'))[1].innerHTML === "ALVAC (vCP1521)"){
                                    checkTarget('input[placeholder*="Search products"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);


                }, multipage: true

            },{
                target:      'input[placeholder*="Search products"]',
                placement:   'left',
                arrowOffset: 'center',
                title:       'Learn about - Products',
                yOffset:     -55,
                content:     'On the Products page, use the column filters or search bar to find specific products.',
                onNext:      function(){

                    var checkExist1 = setInterval(
                            function(){
                                var nodes = nodeTextSearch(document.querySelectorAll('h2'), "ALVAC (vCP1521)");
                                if(nodes.length > 0){
                                    nodes = nodeDisplaySearch(nodes);
                                    if(nodes.length > 0){
                                        nodes[0].classList.add("ALVACvCP15");
                                        clearInterval(checkExist1);
                                    }
                                }
                            }, 100);

                    var checkExist2 = setInterval(
                            function(){
                                if(document.querySelector('h2[class*="ALVACvCP15"]') !== null &&
                                        isVisCoords(document.querySelector('h2[class*="ALVACvCP15"]'))){
                                    checkTarget('h2[class*="ALVACvCP15"]');
                                    clearInterval(checkExist2);
                                }
                            }, 100);

                }, multipage: true

            },{
                target:      'h2[class*="ALVACvCP15"]',
                placement:   'top',
                arrowOffset: 'center',
                content:     'Clicking anywhere in the row takes you to the product page.',
                onNext:      function(){
                    document.querySelector('h2[class*="ALVACvCP15"]').click();
                    var checkExist = setInterval(
                            function() {
                                if(document.querySelectorAll("div[class*='x-container modulecontainercolumn x-box-item']").length === 2){
                                    checkTarget('div[id*="app-module-productheader"]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                }, multipage: true
            },{
                target:      'div[id*="app-module-productheader"]',
                placement:   'top',
                arrowOffset: 'left',
                content:     'Get product details, see what studies used that product, and see what other products have been tested in combination with the product.',
            },{
                target:      '.iarrow',
                placement:   'right',
                arrowOffset: 'top',
                content:     'Clicking this arrow sends the page back to Learn about.',
                onNext:      function(){

                    document.querySelector('.iarrow').click();
                    var event = new Event("change");

                    var ck1 = setInterval(
                            function(){
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null){
                                    document.querySelector('input[id*=learn-search]').value = "";
                                    clearInterval(ck1);
                                }
                            }, 100);

                    var ck2 = setInterval(
                            function(){
                                var event = new Event("change");
                                var node = document.querySelector('input[id*="learn-search"]');
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null &&
                                        document.querySelector('input[id*=learn-search]').value === ""){
                                    document.querySelector('input[id*=learn-search]').dispatchEvent(event);
                                    clearInterval(ck2);
                                }
                            }, 100);

                    var ck3 = setInterval(
                            function(){
                                var nodes =  nodeDisplaySearch(document.querySelectorAll('h1[class*="lhdv"][class*=active]'));
                                if( nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h2'), 'ALVAC (vCP1521)')).length > 0 &&
                                        !isVisCoords(nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h2'), 'ALVAC (vCP1521)'))[0]) &&
                                        nodes.length > 0
                                ){
                                    nodes[0].nextSibling.click();
                                    nodes[0].nextSibling.classList.add("learn-mab-tab");
                                    clearInterval(ck3);
                                }
                            }, 100);

                    var ck5 = setInterval(
                            function(){
                                if(nodeDisplaySearch(document.querySelectorAll('input[id*="learn-search"]')).length > 0 &&
                                        document.querySelector('h1[class*="learn-mab-tab"][class*=active]') !== null &&
                                        document.querySelector('input[placeholder*="Search mabs"]') !== null){
                                    var inbox = document.querySelector('input[placeholder*="Search mabs"]');
                                    inbox.value = "PGT";
                                    inbox.dispatchEvent(event);
                                    clearInterval(ck5);
                                }
                            }, 100);

                    var ck6 = setInterval(
                            function(){
                                if(document.querySelector('input[placeholder*="Search mabs"]') !== null &&
                                        document.querySelector('input[placeholder*="Search mabs"]').value === "PGT" &&
                                        nodeDisplaySearch(nodeTextSearch('h2', 'PGT121 + PGDM1400')).length > 0 &&
                                        isVisCoords(nodeDisplaySearch(nodeTextSearch('h2', 'PGT121 + PGDM1400'))[0])
                                ){
                                    checkTarget('h1[class*="learn-mab-tab"]');
                                    clearInterval(ck6);
                                }
                            }, 100);


                }, multipage: true

            },{
                target:      'h1[class*="learn-mab-tab"]',
                placement:   'right',
                arrowOffset: 'top',
                title:       'Learn about - MAbs',
                content:     'On the MAbs page, use the column filters or search bar to find specific monoclonal antibodies.',
                onNext:      function(){

                    var promise = new Promise(function(resolve, reject){
                        if(nodeDisplaySearch(nodeTextSearch('h2', 'PGT121 + PGDM1400')).length > 0){
                            resolve();
                        }
                    }).then(function(){
                        var nodes = nodeDisplaySearch(document.querySelectorAll('tr[id*="record-PGT121 + PGDM1400"]'));
                        if( nodes.length > 0  &&
                                isVisCoords(nodes[0])
                        ){
                            nodes[0].classList.add("record-pgt121-pgdm1400");

                        }
                    }).then(function(){
                        if(document.querySelector('tr[class*="record-pgt121-pgdm1400"]') !== null){
                            checkTarget('tr[class*="record-pgt121-pgdm1400"]');

                        }
                    });

                }, multipage: true
            },{
                target:      'tr[class*="record-pgt121-pgdm1400"]',
                placement:   'top',
                arrowOffset: 'center',
                title:       'Learn about - MAbs',
                content:     'Get details about monoclonal antibodies and see what studies tested them. For more details, follow the link to the Los Alamos National Lab antibody database.',
                onNext:      function(){

                    var event = new Event("change");

                    var ck1 = setInterval(
                            function(){
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null){
                                    document.querySelector('input[id*=learn-search]').value = "";
                                    clearInterval(ck1);
                                }
                            }, 100);

                    var ck2 = setInterval(
                            function(){
                                var event = new Event("change");
                                var node = document.querySelector('input[id*="learn-search"]');
                                if(document.querySelector('input[id*=learn-search]').offsetParent !== null &&
                                        document.querySelector('div[id*="learnheader"]').offsetParent !== null &&
                                        document.querySelector('input[id*=learn-search]').value === ""){
                                    document.querySelector('input[id*=learn-search]').dispatchEvent(event);
                                    clearInterval(ck2);
                                }
                            }, 100);

                    var ck3 = setInterval(
                            function(){
                                if( nodeDisplaySearch(document.querySelectorAll('tr[id*="record-PGT121 + PGDM1400"]')).length > 0 &&
                                        !isVisCoords(nodeDisplaySearch(document.querySelectorAll('tr[id*="record-PGT121 + PGDM1400"]'))[0])
                                ){
                                    document.querySelector('h1[class*="learn-mab-tab"]').nextSibling.click();
                                    document.querySelector('h1[class*="learn-mab-tab"]').nextSibling.classList.add("learn-reports-tab");
                                    clearInterval(ck3);
                                }
                            }, 100);

                    var checkExist = setInterval(
                            function(){
                                if(document.querySelector('h1[class*="learn-reports-tab"][class*=active]') !== null){
                                    checkTarget('h1[class*="learn-reports-tab"]');
                                    console.log("test");
                                    clearInterval(checkExist);
                                }
                            }, 100);

                }, multipage: true
            },{
                target:      'h1[class*="learn-reports-tab"]',
                placement:   'right',
                arrowOffset: 'top',
                title:       'Learn about - Reports',
                content:     'On the Reports page, you\'ll find use cases describing how others have used the DataSpace and reports summarizing the studies and data in the DataSpace.',
                onNext:      function(){
                    nodeDisplaySearch(document.querySelectorAll('h1[class*="lhdv"]'))[5].click();
                    var checkExist = setInterval(
                            function(){
                                if(nodeDisplaySearch(document.querySelectorAll('h1[class*="lhdv"]'))[5].className === 'lhdv active'){
                                    checkTarget('h1[class*="lhdv"][class*="lhdv active"]');
                                    clearInterval(checkExist);
                                }
                            }, 100);
                }

            },{
                target:      'h1[class*="lhdv"][class*="lhdv active"]',
                placement:   'right',
                arrowOffset: 'top',
                title:       'Learn about - Publications',
                content:     'The Publications page combines publications across the contributing networks. Search publications by title, author, journal, and related studies.',
                onNext:      function(){

                    var node = null;
                    var promise = new Promise(function(resolve, reject) {
                        document.querySelector('h1[class*="learn-studies-tab"]').click();
                        if(document.querySelector('h1[class*="learn-studies-tab"][class*="active"]') !== null){
                            resolve();
                        }
                    }).then(function(result) {
                        var nodes = nodeDisplaySearch(nodeTextSearch(document.querySelectorAll('h2'), "CAVD 434"));
                        if(nodes.length > 0){

                        }
                    }).then(function(result) {
                        node = document.querySelector('input[class*="search-studies"]');
                        if(node !== null){
                            return;
                        }
                    }).then(function(result) {
                        node.value = "";
                        if(node.value === ""){

                        }
                    }).then(function(result) {
                        var event = new Event("change");
                        node.dispatchEvent(event);
                        if(nodeTextSearch(document.querySelectorAll('h2'), "CAVD 434").length >= 0 &&
                                isVisCoords(nodeTextSearch(document.querySelectorAll('h2'), "CAVD 434")[0])){
                            checkTarget('div.nav-label:nth-child(1)');

                        }
                    });

                }
            },{
                target:      'div.nav-label:nth-child(1)',
                placement:   'left',
                yOffset:     -17,
                content:     'The menu bar takes you back to the Home page',
                onNext:    function(){
                    document.querySelector('div.nav-label:nth-child(1)').click();
                    checkTarget('h3[class*="tour-section-title"]');
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