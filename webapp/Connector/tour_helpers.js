// Helper functions for DataSpace tours

// searches innerHTML in node list for a given string
//////////
function nodeTextSearch(nodeList, strVal){
    if(nodeList.constructor.name === "String") { nodeList = document.querySelectorAll(nodeList); };
    var nodes = [];
    for(var i of nodeList){
        if(i.innerHTML === strVal){
            nodes.push(i);
        }
    }
    return(nodes);
};

// checks all nodes in a NodeList and return the first where display
// does not equal none.
//////////
function nodeDisplaySearch(nodeList){
    var nodes = [];
    for(var i of nodeList){
        if(i.offsetParent !== null){
            nodes.push(i);
        }
    }
    return(nodes);
};

// checks which members of a node list have positive coordinates
// would be nice if this was a part of display search
//////////
function nodePosCoordSearch(nodeList){
    var nodes = [];
    for(var i of nodeList){
        var bb = i.getBoundingClientRect();
        if(bb.x > 0 && bb.y > 0){
            nodes.push(i);
        }
    }
    return(nodes);
};

// checks if a given node has coordinates that are within the window.
 //////////
function isVisCoords(node){
    var nod = node.getBoundingClientRect();
    var win = document.body.getBoundingClientRect();
    if(JSON.stringify(win) === JSON.stringify(nod) ||
       (nod.left >= win.left &&
        nod.top >= win.top &&
        nod.right < win.right &&
        nod.right > 0 && 
        nod.bottom < win.bottom &&
        nod.bottom > 0 &&
        node.offeseParent !== null)
      ){
        return(true);
    }
    return(false);
};

// returns how much to scroll by. will return values of zero when
// scrolling not required.
//////////
function scrollAmount(node, amount = 60){
    var ndm = node.getBoundingClientRect();
    var bdm = document.body.getBoundingClientRect();
    var right = ndm.right + amount;
    var bottom = ndm.bottom + amount;
    var ret = { x: 0, y:0 };

    if( ndm.left < bdm.left ){
        ret.x = ndm.left - bdm.left;  
    } else if( right > bdm.right ){
        ret.x = ndm.right - bdm.right;
    };

    if(ndm.top < bdm.top){
        ret.y = ndm.top - bdm.top;
    } else if( bottom > bdm.bottom ){
        ret.y = bottom - bdm.bottom;
    };
    
    return(ret);
}

// starts the next step of the tour if the next target is valid.
//////////
function checkTarget(target){
    var nod = document.querySelector(target);
    var xbd = window.innerWidth;
    var ybd = window.innerHeight;

    if ( nod !== null && nod.offsetParent !== null ) {
        var dim = nod.getBoundingClientRect();
        if ( dim.x >= 0 || dim.y >= 0 || dim.top > ybd || dim.left > xbd ) {
            window.hopscotch.startTour(window.hopscotch.getCurrTour(), window.hopscotch.getCurrStepNum());
        }
    } else {
        window.hopscotch.endTour();
    }
};
