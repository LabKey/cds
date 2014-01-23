/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
var CUBE = LABKEY.cds.CUBE;
/*
CUBE.queryMembers({hierarchy:'Study', lnum:1, success:function(qr){console.log("--Studies: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Clade', lnum:1, success:function(qr){console.log("--Antigens.Clade: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Clade', lnum:2, success:function(qr){console.log("--Antigens.Clade: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Tier', lnum:1, success:function(qr){console.log("--Antigens.Tier: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Tier', lnum:2, success:function(qr){console.log("--Antigens.Tier: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Assay', lnum:1, success:function(qr){console.log("--Assay.Assay: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Gender', lnum:1, success:function(qr){console.log("--Demographics.Gender: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Location', lnum:1, success:function(qr){console.log("--Demographics.Location: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Infection Status', lnum:1, success:function(qr){console.log("--Demographics.Infection Status: Member Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMembers({hierarchy:'Contributor', lnum:1, success:function(qr){console.log("--Contributors.Lab: Member Query--"); console.log(Ext4.JSON.encode(qr));}});

CUBE.queryMeasures({onRows:{hierarchy:'Study', lnum:1}, success:function(qr){console.log("--Studies: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Clade', lnum:1}, success:function(qr){console.log("--Antigens.Clade: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Clade', lnum:2}, success:function(qr){console.log("--Antigens.Clade: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Tier', lnum:1}, success:function(qr){console.log("--Antigens.Tier: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Tier', lnum:2}, success:function(qr){console.log("--Antigens.Tier: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Assay', lnum:1}, success:function(qr){console.log("--Assay.Assay: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Gender', lnum:1}, success:function(qr){console.log("--Demographics.Gender: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Location', lnum:1}, success:function(qr){console.log("--Demographics.Location: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Infection Status', lnum:1}, success:function(qr){console.log("--Demographics.Infection Status: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});
CUBE.queryMeasures({onRows:{hierarchy:'Contributor', lnum:1}, success:function(qr){console.log("--Contributors.Labs: Measure Query--"); console.log(Ext4.JSON.encode(qr));}});

CUBE.queryMeasures(
{
    onRows:{hierarchy:'Study', lnum:1},
    filter:[{hierarchy:'Gender', members:[{uname:['m']}]}],
    success:function(qr){console.log("--Study M--"); console.log(Ext4.JSON.encode(qr));
}});
CUBE.queryMeasures(
{
    onRows:{hierarchy:'Study', lnum:1},
    filter:[{hierarchy:'Gender', members:[{uname:['f']}]}],
    success:function(qr){console.log("--Study F--"); console.log(Ext4.JSON.encode(qr));
}});
CUBE.queryMeasures(
{
    onRows:{hierarchy:'Study', lnum:1},
    filter:[{hierarchy:'Gender', members:[{uname:['m']},{uname:['f']}]}],
    success:function(qr){console.log("--Study MF--"); console.log(Ext4.JSON.encode(qr));
}});
CUBE.queryMeasures(
{
    onRows:{hierarchy:'Study', lnum:1},
//        filter:[{hierarchy:'Gender', members:[{uname:['m']}]}],
    success:function(qr){console.log("--Study ALL--"); console.log(Ext4.JSON.encode(qr));
}});
*/

var md = CUBE.getMDX();

var waitingFor = 0;
function decrementWaitFor(members, level)
{
    console.log("decrementWaitFor: " + level.name);
    waitingFor--;
    if (waitingFor == 0)
        nowIsTheTime();
}

function doNothing(members, level)
{
    console.log("doNothing: " + level.name);
    console.log("")
}

// PRELOAD MEMBERS (first level)
var dims = md.getDimensions();
for (var d=0 ; d<dims.length ; d++)
{
    var dim = dims[d];
    var hierarchies = dim.getHierarchies();
    for (var h=0 ; h<hierarchies.length ; h++)
    {
        var hier = hierarchies[h];
        var levels = hier.getLevels();
        for (var l=0 ; l<levels.length ; l++)
        {
            var level = levels[l];
            waitingFor++;
            level.listMembers({success:decrementWaitFor});
            level.listMembers({success:doNothing});
        }
    }
}


function nowIsTheTime()
{
    dumpMembers();
    testQueries();
}

function dumpMembers()
{
    console.log("Dimensions");
    var dims = md.getDimensions();
    for (var d=0 ; d<dims.length ; d++)
    {
        var dim = dims[d];
        console.log("    " + dim.getName());
        if (dim !== md.getDimension(dim.getName()))
            console.error("problem with dimension: " + dim.getName());
        var hierarchies = dim.getHierarchies();
        for (var h=0 ; h<hierarchies.length ; h++)
        {
            var hier = hierarchies[h];
            console.log("        " + hier.getName());
            var levels = hier.getLevels();
            for (var l=0 ; l<levels.length ; l++)
            {
                var level = levels[l];
                console.log("            " + level.getName());
//                if (level.lnum == 1)
                {
                    level.listMembers({success:function(members)
                    {
                        for (var m=0; m<members.length ; m++)
                            console.log("                " + memberToLongString(members[m]));
                    }});
                }
            }
        }
    }
}

function testQueries()
{
    var queries = [];
    queries.push({
        onRows: [ {hierarchy : 'Assay', lnum : 1} ],
        filter: [ {hierarchy : 'Study', members:[{uname:['Demo Study']}]} ],
        useNamedFilters : []
    });
    queries.push({
        onRows: [ {hierarchy : 'Assay', lnum : 1} ],
        filter: [ {hierarchy : 'Study', members:[{uname:['Demo Study']}]} ],
        useNamedFilters : ['filter']
    });
    queries.push({
        onRows: [ {hierarchy : 'Gender', lnum : 1} ],
        filter: [ {hierarchy : 'Study', members:[{uname:['Demo Study']}]} ],
        useNamedFilters : []
    });
    queries.push({
        onRows: [ {hierarchy : 'Gender', lnum : 1} ],
        filter: [ {hierarchy : 'Study', members:[{uname:['Demo Study']}]} ],
        useNamedFilters : ['filter']
    });
    queries.push({
        onRows: [ {hierarchy : 'Assay', lnum : 1} ],
        filter:
        [{
            hierarchy : 'Participant',
            membersQuery:{hierarchy : 'Assay', members:{uname:['HIV Test Results']}}
        }],
        useNamedFilters : ['filter']
    });
    md.setNamedFilter('filter', [ {hierarchy : 'Infection Status', members:[{uname:['confirmed']}]} ]);

//    var current = 0;
//    function next()
//    {
//        if (current >= queries.length)
//            return;
//        var config = queries[current++];
//        config.success = function(qr)
//        {
//            dumpQueryResult(qr);
//            next();
//        };
//        console.log("query");
//        console.log(config);
//        md.query(config);
//    }
//    next();

    var successFn = function(results, configs)
    {
        for (var r=0 ; r<results.length ; r++)
            dumpQueryResult(results[r]);
    };
    var failureFn = function()
    {
        alert("queryMultiple failed");
    };

    md.queryMultiple(queries, successFn, failureFn, null);
}

function dumpQueryResult(qr)
{
    var dump = [];
    var line = "", f, r;
    for (f=0 ; f<qr.metaData.fields.length ; f++)
        line += "\t" + qr.metaData.fields[f].name;
    dump.push(line);
    for (r=0 ; r<qr.rows.length ; r++)
    {
        line = "";
        for (f=0 ; f<qr.metaData.fields.length ; f++)
            line += "\t" + qr.rows[r][qr.metaData.fields[f].name].value;
        dump.push(line);
    }
    console.log(qr.rows.length + " rows");
    console.log(dump.join("\n"));
}

function memberToLongString(m)
{
    var s = "";
    var dot = "";
    for (var i=0 ; i<m.uname.length ; i++)
    {
        s += dot + "[" + m.uname[i] + "]";
        dot = ".";
    }
    if (m.caption)
        s += " " + m.caption;
    return s;
}

