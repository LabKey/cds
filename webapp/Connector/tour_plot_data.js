var tour_plot_data = {
    title:       'Plot-data',
    description: 'A tour for the "Plot data" section.',
    id:          'tour-plot-data',
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
            title:       'Plot data',
            content:     'This is a guided tour designed to take you on a specific path through the DataSpace. Clicking the \'Next\' button will advance you through the predefined steps of the tour. Please be aware that any additional clicking or scrolling during the tour (unless instructed) may cause the tour to terminate early. Some tours are not compatible with small screens. For best results, view tours in full screen mode.<br><br><b>Note: Taking this tour will change the filters in the Active filters pane. If you have applied filters during this session that you don\'t want to lose, save your data before proceeding on this tour. If you continue, your filters will be modified.</b>',
            xOffset:     (window.innerWidth / 2) - 280,
            showSkip:    true
        },{
            target:    'div.nav-label:nth-child(4)',
            placement: 'left',
            title:     'Creating subject data visualizations in Plot data',
            content:   'The Plot data section is where you can explore the subject data using simple plots that allow you to compare data across studies and assays.',
            yOffset:   -17,
            onNext:    function() {

                document.querySelector("div.nav-label:nth-child(4)").click();

                var checkExist1 = setInterval(
                    function() {
                        if (
                            document.querySelector('div[id*=plot') !== null &&
                                document.querySelector('div[id*=plot').style.display !== "none" &&
                                document.querySelector('.info_Study') !== null
                        ){
                            document.querySelector('.info_Study').click();
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function() {
                        if(document.querySelector('div[title*="CAVD 371"]') !== null &&
                           document.querySelector('div[title*="CAVD 434"]') !== null){
                            document.querySelector('div[title*="CAVD 371"]').click();
                            document.querySelector('div[title*="CAVD 434"]').parentElement.parentElement.previousSibling.click();
                            clearInterval(checkExist2);
                        }
                    }, 100);

                var checkExist3 = setInterval(
                    function() {
                        if(nodeDisplaySearch(
                            document.querySelectorAll('tr[class*="x-grid-row"][class*="x-grid-row-selected"][class*="x-grid-data-row"]')).length === 2
                          ){
                            document.querySelector('a[id*="button"][class*="x-btn filterinfoaction"]').click();
                            clearInterval(checkExist3);
                        }
                    }, 100);

                var checkExist4 = setInterval(
                    function() {
                        if(document.querySelector('div[class*="filterstatus-content"]') !== null &&
                           document.querySelector('div[class="sel-list-item memberloc"]') !== null &&
                           isVisCoords(document.querySelector('div[class*="filterstatus-content"]'))){
                            clearInterval(checkExist4);
                            checkTarget('div[class*="filterstatus-content"]');
                        }
                    }, 100);

            },
            multipage: true
        },{
            target:      'div[class*="filterstatus-content"]',
            placement:   'left',
            arrowOffset: 'top',
            content:     'Before you begin your plot, select the study or subject data you wish to explore. Use Learn about to identify studies of interest. Filter the data using the Active filters pane, Find subjects, or View data grid.',
            yOffset:     -12,
            onNext:      function(){

                var checkExist = setInterval(
                    function(){
                        if (
                            document.querySelector('a[class*="yaxisbtn"]') !== null &&
                                isVisCoords(document.querySelector('a[class*="yaxisbtn"]'))
                        ) {
                                clearInterval(checkExist);
                                checkTarget('a[class*="yaxisbtn"]');
                        };
                    }, 100);

            }, multipage: true
            
        },{
            target:      'a[class*="yaxisbtn"]',
            placement:   'right',
            arrowOffset: 'center',
            xOffset:     0,
            yOffset:     -50,
            title:       'Choosing the y-axis for your plot',
            content:     'We start our plot by selecting what data we want on the y-axis.',
            onNext:      function(){
                
                document.querySelector('a[class*="yaxisbtn"]').click();
                var checkExist1 = setInterval(
                    function(){
                        if (nodeDisplaySearch(nodePosCoordSearch(document.querySelectorAll('div[id*="dataview"]'))).length !== 0) {
                            nodeDisplaySearch(nodePosCoordSearch(document.querySelectorAll('div[id*="dataview"]')))[0].classList.add("yaxis-sources");
                            clearInterval(checkExist1);
                        };
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if (document.querySelector('div[id*="dataview"][class*="yaxis-sources"]') !== null &&
                            isVisCoords(document.querySelector('div[id*="dataview"][class*="yaxis-sources"]'))) {
                            clearInterval(checkExist2);
                            checkTarget('div[class*="yaxis-sources"]');
                        };
                    }, 100);

            }, multipage: true
            
        },{
            target:      'div[class*="yaxis-sources"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     -10,
            yOffset:     15,
            title:       'Choosing the type of data to plot',
            content:     'There are several different data sources that can be plotted. The number of subjects with data for that data source is shown next to the source.',
            onNext:      function(){

                // var checkExist_05 = setInterval(
                //     function(){
                //         var nodes = nodeTextSearch(document.querySelectorAll('span[id*="button"]'), 'Cancel');
                //         if(isVisible(nodes[0]) === 0){
                //             window.hopscotch.endTour();
                //         }
                //     }, 100);

                 
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), 'ICS (Intracellular Cytokine Staining)');
                        if(nodes.length > 0){
                            nodes[0].classList.add("ics-assay-label");
                            nodes[0].click();
                            clearInterval(checkExist1);
                        }
                    }, 100);
             
                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('span[class*="section-title"]'), "ICS (Intracellular Cytokine Staining)");
                        if ( nodes.length > 0 && isVisCoords(nodes[0]) ) {
                            nodes[0].classList.add("ics-source-title");  
                            clearInterval(checkExist2);
                        };
                    }, 100);

                var checkExist3 = setInterval(
                    function(){
                        if ( document.querySelector('span[class*="ics-source-title"]') !== null){
                            checkTarget('span[class*="ics-source-title"]');
                            clearInterval(checkExist3);
                        }
                    }, 100);

            }, multipage: true
        },{
            target:      'span[class*="ics-source-title"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     -80,
            yOffset:     -35,
            title:       'Choosing a measure to plot',
            content:     'Here we\'ve chosen the Intracellular Cytokine Staining assay. The recommended variables, highlighted in red, are the most commonly analyzed measures for this type of data.  Additional measures are also available to plot. Hover over the variable name to get a definition. We\'ll use the default measure (background-subtracted magnitude).',
            onNext:      function(){

                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="dimension-header"]'), "Assay Dimensions");
                        if(nodes.length > 0){
                            nodes[0].classList.add("assay-dim-header");
                            clearInterval(checkExist1);
                        };
                    }, 100);
                
                var checkExist2 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="assay-dim-header"]');
                        if(node !== null && isVisCoords(node)){
                            checkTarget('div[class*="assay-dim-header"]');
                            clearInterval(checkExist2);
                        }
                    },100);
            }, multipage: true

        },{
            target:      'div[class*="assay-dim-header"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     -10,
            yOffset:     -265,
            title:       'Choosing the assay dimensions',
            content:     'When plotting assay data, you will see an Assay Dimensions section which describes important elements specific to this data type. Many of the assay dimensions are also key fields that, when combined with other dimensions, are used to define unique records in the dataset. <br><br>Use this section to apply additional filters to the data for each of the assay dimensions. You\'ll want to review each dimension to make sure you haven\'t selected any values that are grayed out (i.e. not present in the filtered data). Selecting a value that is grayed out when that element can only have one value will result in a \"No data in the plot\" message. You can choose not to apply any filters to the assay dimensions, but your exploration will be more meaningful if your data is filtered with intention. <br><br>More information about the assay dimensions can be found on the assay pages in Learn about.',
            onNext:      function(){
                var event = new Event('mouseleave');
                var dd = document.querySelectorAll('div[class*="field-display"]');
                dd[1].click();
                var checkExist1 = setInterval(
                    function(){
                        var node = nodeDisplaySearch(document.querySelectorAll('div[class*="functional_marker_name-dropdown"]'))[0];
                        if(node !== null){
                            node = nodeTextSearch(node.querySelectorAll('label[id*="radiofield"][id*="boxLabelEl"]'), "IFNg")[0];
                            node.previousSibling.click();
                            node.previousSibling.classList.add("tour-checked-fmn");
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if(document.querySelector('input[class*="tour-checked-fmn"]') !== null){
                            var node = nodeDisplaySearch(document.querySelectorAll('div[class*="functional_marker_name-dropdown"]'))[0];
                            node.dispatchEvent(event);
                            clearInterval(checkExist2);
                        };
                    }, 100);

                dd[2].click();
                var checkExist3 = setInterval(
                    function(){
                        var node = nodeDisplaySearch(document.querySelectorAll('div[class*="summary_level-dropdown"]'))[0];
                        if(node !== null){
                            node = nodeTextSearch(node.querySelectorAll('label[id*="radiofield"][id*="boxLabelEl"]'), "Protein")[0];
                            node.previousSibling.click();
                            node.previousSibling.classList.add("tour-checked-sl");
                            clearInterval(checkExist3);
                        }
                    }, 100);

                var checkExist4 = setInterval(
                    function(){
                        var event = new Event('mouseleave');
                        if(document.querySelector('input[class*="tour-checked-sl"]') !== null){
                            var node = nodeDisplaySearch(document.querySelectorAll('div[class*="summary_level-dropdown"]'))[0];
                            node.dispatchEvent(event);
                            clearInterval(checkExist4);
                            
                        };
                    }, 100);

                var checkExist5 = setInterval(
                    function(){
                        if (document.querySelector('input[class*="tour-checked-sl"]') !== null &&
                            document.querySelector('input[class*="tour-checked-fmn"]') !== null)
                        {
                            
                            nodeTextSearch(document.querySelectorAll('span[id*="button"]'), 'Set y-axis')[0].classList.add("setYAxis");

                            if(document.querySelector('span[class*="setYAxis"]') !== null){
                                document.querySelector('input[class*="tour-checked-sl"]').classList.remove("tour-checked-sl");
                                document.querySelector('input[class*="tour-checked-fmn"]').classList.remove("tour-checked-fmn");
                                checkTarget('span[class*="setYAxis"]');
                                clearInterval(checkExist5);
                            }
                        };
                    }, 100);
                
            }, multipage: true
        },{
            target:      'span[class*="setYAxis"]',
            placement:   'right',
            arrowOffset: 'center',
            xOffset:     15,
            yOffset:     -80,
            title:       'Set the y-axis',
            content:     'When finished making selections for the y-axis, click the button to set the axis.',
            onNext:      function(){

                function getScrollParent(node) {
                    if (node == null) {
                        return null;
                    }
                    if (node.style.overflow === "hidden auto") {
                        return node;
                    } else {
                        return getScrollParent(node.parentNode);
                    }
                };
                
                document.querySelector('span[class*="setYAxis"]').click();

                var smt = null;
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeDisplaySearch(document.querySelectorAll('div[class*="AntigensInY"]'));
                        if (
                            nodes.length > 0 &&
                                document.querySelector('div[class="x-mask"]') !== null &&
                                !isVisCoords(document.querySelector('div[class="x-mask"]'))
                        ) {
                            getScrollParent(nodes[0]).classList.add("info-pane-scroll-frame");
                            clearInterval(checkExist1);
                        };
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if(
                            document.querySelector('div[class*="info-pane-scroll-frame"]') !== null &&
                                !isVisCoords(document.querySelector('div[class="x-mask"]')) &&
                                nodeDisplaySearch(
                                    nodeTextSearch(
                                        document.querySelectorAll('span[class*="statme status-label"]'),
                                        "Antigens in Y"
                                    )
                                ).length > 0
                    ){
                            smt = Math.max(document.querySelector('div[class*="AntigensInY"]').getBoundingClientRect().y - 200, 0);
                            document.querySelector('div[class*="info-pane-scroll-frame"]').scrollTo({left: 0, top: smt, behavior: 'smooth'});
                            clearInterval(checkExist2);
                        }
                    }, 100);

                var checkExist3 = setInterval(
                    function(){
                        var node = document.querySelector('div[class*="info-pane-scroll-frame"]');
                        if(
                            isVisCoords(document.querySelector('div[class*="AntigensInY"]')) &&
                                node !== null &&
                                (node.scrollTop === smt ||
                                 Math.abs((node.clientHeight + node.scrollTop) - node.scrollHeight) < 3)
                        ){      
                            checkTarget('div[class*="AntigensInY"]');
                            clearInterval(checkExist3);
                        }
                    }, 100);
            }
        },{
            target:      'div[class*="AntigensInY"]',
            placement:   'left',
            arrowOffset: 220,
            yOffset:     -225,
            content:     'We now have a one-dimensional plot. Hover over a single data point on the plot. The dark data points show data from the same subject. Click on a data point to see the details. Click outside the details to close the box. <br><br>In the Active Filters pane, we now have 2 new categories that describe the data in this plot. We see that the data is from 2 studies (CAVD 371 and 434) and includes 5 antigens across 11 time points. If we click on the \'Antigens in Y\'...',
            onNext:      function(){
                document.querySelector('div[class*="AntigensInY"]').click();
                
                var checkExist = setInterval(
                    function(){
                        if(
                            document.querySelector('span[class="section-title"]') !== null &&
                                isVisCoords(document.querySelector('span[class="section-title"]')) &&
                                nodeTextSearch(document.querySelectorAll('span[class="section-title"]'), "Magnitude (% cells) - Background subtracted")[0] !== "none found" &&
                                document.querySelector('label[test-data-value="study_ICS_protein_panel-Any_Antigen"]') !== null &&
                                document.querySelector('label[test-data-value="study_ICS_protein-Any_Antigen-Any_ENV"]') !== null
                        ){
                            document.querySelector('label[test-data-value="study_ICS_protein_panel-Any_Antigen"]').click();
                            document.querySelector('label[test-data-value="study_ICS_protein-Any_Antigen-Any_ENV"]').click();
                            clearInterval(checkExist);
                        };
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if(document.querySelector('div[class*="antigen-selection-panel"]') !== null &&
                           isVisCoords(document.querySelector('div[class*="antigen-selection-panel"]'))){
                            checkTarget('div[class*="antigen-selection-panel"]');
                            clearInterval(checkExist2);
                        };
                    }, 100);
            }, multipage: true

        },{
            target:      'div[class*="antigen-selection-panel"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     15,
            yOffset:     0,
            content:     'We see a list of the antigens (in this case, the proteins) included in the plot. Modifying the filters in this box will have the same effect as going back to the Y-axis to modify the Protein filter in the assay dimensions. Let\'s filter to just ENV proteins.',
            onNext:      function(){

                nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Done")[0].click();
                nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Set y-axis")[0].click();

                var checkExist = setInterval(
                    function(){
                        if (document.querySelectorAll('div[class="x-mask"]')[0].style.visibility === "hidden" ||
                            document.querySelectorAll('div[class="x-mask"]')[0].style.display === "none") {
                            checkTarget('div[id="xvarselector"]');
                            clearInterval(checkExist);
                        };
                    }, 100);

            }
        },{
            target:      'div[id="xvarselector"]',
            placement:   'top',
            arrowOffset: 'center',
            title:       'Choosing the x-axis for your plot',
            xOffset:     -60,
            yOffset:     0,
            content:     'Now let\'s select the type of data we want to plot on the x-axis. ',
            onNext:      function(){

                document.querySelector('div[id="xvarselector"]').click();
                var checkExist = setInterval(
                    function() {
                        if (isVisCoords(nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Time points")[0])) {
                            nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Time points")[0].classList.add("time-points-label");
                            if(document.querySelector('div[class*="time-points-label"]') !== null &&
                               isVisCoords(document.querySelector('div[class*="time-points-label"]'))){
                                clearInterval(checkExist);
                                checkTarget('div[class*="time-points-label"]');
                            };
                        };
                    }, 100);            
                
            }, multipage: true
            
        },{
            target:      'div[class*="time-points-label"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'You\'ll notice there are a few other data types that can be plotted on the x-axis. Plotting the measure over time gives you a good overview of the data.',
            xOffset:     -20,
            yOffset:     -85,
            onNext:      function() {
                
                nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Time points")[0].click();
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Study days");
                        if (nodes.length > 0 && isVisCoords(nodes[0])) {
                            nodes[0].classList.add("study-days-label");
                            clearInterval(checkExist1);
                        };
                    }, 100);

                var checkExist2  = setInterval(
                    function(){
                        if(document.querySelector('div[class*="study-days-label"]') !== null){
                            checkTarget('div[class*="study-days-label"]');
                            clearInterval(checkExist2);
                        }
                    }, 100);
                
            }, multipage: true
            
        },{
            target:      'div[class*="study-days-label"]',
            placement:   'left',
            arrowOffset: 'center',
            title:       'Plotting by time',
            content:     'The recommended time point is study days. By default, the study days are aligned by Day 0 (the study day when subjects received their first vaccination).',
            yOffset:     -75,
            xOffset:     -15,
            onNext:      function() {

                var event = new Event("mousedown");

                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('span[id*="button"][id*="btnInnerEl"]'), "Set x-axis");
                        if(nodes.length > 0){
                            nodes[0].click();
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="main-title"]'), "x-axis");
                        if(
                            nodes.length > 0 &&
                                !isVisCoords(nodes[0]) &&
                                document.querySelectorAll('g[class=study]').length === 2 ||
                                document.querySelectorAll('g[class=study]').length === 12
                        ) {
                            checkTarget('g[class*="study"]');
                            clearInterval(checkExist2);
                        };
                    }, 100);
                
            }, multipage: true
            
        },{
            target:      'g[class*="study"]',
            placement:   'top',
            arrowOffset: 'left',
            content:     'Now the plot shows the background-subtracted magnitude over time. Below the plot, you can see the different studies and treatment groups, and when the study visits occurred. <br><br> Click on the "+" sign to expand the study groups. <br><br> The syringe icons indicate when the vaccinations were given to the subjects in each group. Hover over one of the icons to see what products were given. Notice that the study day at which the last vaccination is given is different for the different groups. <br><br> Collapse the study groups by clicking on the "-" sign.',
            yOffset:     0,
            xOffset:     0,
            onNext:      function() {
                nodeTextSearch(document.querySelectorAll('h1[unselectable="on"]'), "x&nbsp;=")[0].click();
                
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('span[class*="section-title"]'),  "Time points");
                        if (nodes.length > 0 && isVisCoords(nodes[0])){
                            nodeTextSearch(document.querySelectorAll('div[class*="main-label"]'), "Aligned by Day 0")[0].click();
                            clearInterval(checkExist1);
                        };
                    }, 100);
                
                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeDisplaySearch(document.querySelectorAll('div[class*="advanced-dropdown undefined-dropdown"]'));
                        if(nodes.length !== 0){
                            nodeTextSearch(nodes[0].querySelectorAll('label[id*="radiofield"][id*="boxLabelEl"]'), "Last Vaccination")[0].previousSibling.click();
                            nodes[0].classList.add("aligned-by-dropdown");
                            nodeTextSearch(document.querySelectorAll('div[class*="field-label"]'), "Aligned by:")[0].classList.add("aligned-by-label");
                            clearInterval(checkExist2);
                        }
                    }, 100);

                var checkExist3 = setInterval(
                    function(){
                        if(document.querySelector('div[class*="aligned-by-label"]') !== null &&
                           document.querySelector("div[class*='aligned-by-dropdown']") !== null){
                            checkTarget('div[class*="aligned-by-label"]');
                            clearInterval(checkExist3);
                        }
                    }, 100);
                
            }, multipage: true
            
        },{
            target:      'div[class*="aligned-by-label"]',
            placement:   'left',
            arrowOffset: 'center',
            content:     'To make it easier to compare the immunogenicity measures at the \'peak time points\' across groups, we can re-align the study days by the last vaccination.',
            yOffset:     -98,
            xOffset:     -10,
            onNext:      function(){

                var nodes = nodeDisplaySearch(document.querySelectorAll("div[class*='aligned-by-dropdown']"));
                if(nodes.length > 0){
                    var event = new Event('mouseleave');
                    nodes[0].dispatchEvent(event);
                }
                
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeDisplaySearch(document.querySelectorAll("div[class*='aligned-by-dropdown']"));
                        if(nodes.length === 0){
                            nodeTextSearch(document.querySelectorAll('span[id*="button"][id*="btnInnerEl"]'), "Set x-axis")[0].click();
                            clearInterval(checkExist1)
                        };
                    }, 100);
                
                var checkExist2 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="main-title"]'), "x-axis");
                        if(nodes.length > 0 &&
                           !isVisCoords(nodes[0]) &&
                           document.querySelectorAll('g[class=study]').length === 2) {
                            checkTarget('g[class*="study"]');
                            clearInterval(checkExist2);
                        };
                    }, 100);

            }, multipage: true
        },{
            target:      'g[class*="study"]',
            placement:   'top',
            arrowOffset: 'left',
            content:     'Now our plot shows time points aligned by last vaccination. We can select the time point 14 days after the last vaccination and add it to our filters. To select the time point either (1) click on the visit icons or (2) use a click and drag motion to highlight the plot in teal. Click the Filter button to apply the filter.',
            yOffset:     0,
            xOffset:     0,
            onNext:      function() {
                nodeTextSearch(document.querySelectorAll('h1[unselectable="on"]'), "x&nbsp;=")[0].click();
                
                var checkExist1 = setInterval(
                    function(){
                        var nodes = nodeTextSearch(document.querySelectorAll('div[class*="main-title"]'), "x-axis");
                        if(nodes.length > 0 && isVisCoords(nodes[0])) {                            
                            for(var i of document.querySelectorAll('span[class*=arrow]')){
                                if(isVisCoords(i)){
                                    i.classList.add("back-to-sources");
                                };
                            };
                            clearInterval(checkExist1);
                        }
                    }, 100);
                
                var checkExist2 = setInterval(
                    function(){
                        if(document.querySelector('span[class="arrow back-to-sources"]') !== null){
                            checkTarget('span[class="arrow back-to-sources"]');
                            clearInterval(checkExist2);
                        };
                            
                    }, 100);

            }, multipage: true  // multipage... This is really more about if the node identifier is generated during onNext or not...
        },{
            target:      'span[class="arrow back-to-sources"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     15,
            yOffset:     -32,
            content:     'Clicking this back arrow, we can navigate back to select other sources for the x-axis.',
            onNext:      function(){
                document.querySelector('span[class="arrow back-to-sources"]').click();
                var checkExist1 = setInterval(
                    function(){
                        if (nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Study and treatment variables")[0].parentElement.parentElement.style.display === ""){
                            nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Study and treatment variables")[0].classList.add("study-treatment-vars");
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if (document.querySelector('div[class*="study-treatment-vars"]') !== null &&
                            isVisCoords(document.querySelector('div[class*="study-treatment-vars"]'))){
                            clearInterval(checkExist2);
                            checkTarget('div[class*="study-treatment-vars"]');
                        };
                    }, 100);
                
            }, multipage: true
            
        },{
            target:      'div[class*="study-treatment-vars"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     -10,
            yOffset:     -48,
            content:     'Next, let\'s select a study and treatment variable to plot.',
            onNext:      function(){

                document.querySelector('div[class*="study-treatment-vars"]').click();
                var checkExist1 = setInterval(
                    function(){
                        var nodes1 = nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Product Combination");
                        var nodes2 = nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Study Name");
                        if(nodes1.length !== 0 &&
                           nodes2.length !== 0 &&
                           nodes1[0].parentElement.parentElement.style.display === "" &&
                           nodes2[0].parentElement.className === "content-item content-selected"){
                            nodes1[0].classList.add("product-combination-label");
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        if(document.querySelector('div[class*="product-combination-label"]') !== null){
                            document.querySelector('div[class*="product-combination-label"]').click();
                            clearInterval(checkExist2);
                        };
                    }, 100);
                
                var checkExist3 = setInterval(
                    function(){
                        if(document.querySelector('div[class*="product-combination-label"]') !== null &&
                           document.querySelector('div[class*="product-combination-label"]').parentElement.className === "content-item content-selected"){
                            checkTarget('div[class*="content-label"][class*="product-combination-label"]');
                            clearInterval(checkExist3);
                        }
                    }, 100);
                
            }, multipage: true
            
        },{
            target:      'div[class*="content-label"][class*="product-combination-label"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     -10,
            yOffset:     -70,
            content:     'Plotting product combination on the x-axis will help us compare responses to the ENV protein at those peak time points across treatment groups receiving different product combinations.',
            onNext:      function(){
                nodeTextSearch(document.querySelectorAll('span[id*=button]'), "Set x-axis")[0].click();
                var checkExist = setInterval(
                    function(){
                        if (document.querySelectorAll('div[class="x-mask"]')[0].style.display === "none" ||
                            document.querySelectorAll('div[class="x-mask"]')[0].style.visibility === "hidden") {
                            checkTarget('div[id="colorvarselector"]');
                            clearInterval(checkExist);
                        }
                    }, 100);
            }, multipage: true
            
        },{
            target:      'div[id="colorvarselector"]',
            placement:   'bottom',
            arrowOffset: 'center',
            xOffset:     -35,
            title:       'Color as a third dimension',
            content:     'We can also add other variables as color.',
            onNext:      function(){
                document.querySelector('div[id="colorvarselector"]').click();
                var checkExist1 = setInterval(
                    function(){
                        if(isVisCoords(nodeTextSearch(document.querySelectorAll('div[class*="main-title"]'), "color")[0])) {
                            for(var i of nodeTextSearch(document.querySelectorAll('div[class*="content-label"]'), "Study and treatment variables")){
                                if(i.parentElement.parentElement.style.display !== "none"){
                                    i.click();
                                }
                            }
                            clearInterval(checkExist1);
                        }
                    }, 100);

                var checkExist2 = setInterval(
                    function(){
                        for(var i of nodeTextSearch(document.querySelectorAll('div[class="content-label"]'), "Study Name")){
                            if(isVisCoords(i)){
                                i.classList.add("color-study-name");
                                if(document.querySelector('div[class*="color-study-name"]') !== null){
                                    checkTarget('div[class*="color-study-name"]');
                                    clearInterval(checkExist2);
                                }
                            }
                        }
                    }, 100);
            }, multipage: true
            
        },{
            target:    'div[class*="color-study-name"]',
            placement: 'left',
            yOffset:   -23,
            xOffset:   -8,
            content:   'In this case, adding study name as color helps to also compare responses across studies.',
            onNext:    function(){
                nodeTextSearch(document.querySelectorAll('span[id*="button"]'), "Set color")[0].click();
                var checkExist = setInterval(
                    function(){
                        if (document.querySelectorAll('div[class="x-mask"]')[0].style.display === "none" ||
                            document.querySelectorAll('div[class="x-mask"]')[0].style.visibility === "hidden") {
                            checkTarget('h2[class*="filterheader-text section-title-filtered"]');
                            clearInterval(checkExist);
                        };
                        
                    }, 100);
            }, multipage: true
        },{
            target:      'h2[class*="filterheader-text section-title-filtered"]',
            placement:   'left',
            arrowOffset: 'center',
            xOffset:     5,
            yOffset:     -75,
            content:     'You can save your plot for further exploration during another session or go to View data grid to export the data. Saved data can also be accessed with our DataSpaceR API (see Tools & links for more details).',
            onNext:      function(){
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

