/////////////////////////////////////
//
//            VARIABLES
//
/////////////////////////////////////

var startZoom = 11;
var maxZoom = startZoom;
var minZoom = startZoom;
var slcLocation = [40.700,-111.870];

var markerRadius = 6;
var purpleAirMarker = {
    radius:markerRadius,
    color:'#000000',
    weight:2,
    fill:true,
    fillColor:'#ff96fd',
    fillOpacity: 0.9,
    interactive:true
};

var airUMarker = {
    radius:markerRadius,
    color:'#000000',
    weight:2,
    fill:true,
    fillColor:'#fe6e5e',
    fillOpacity: 0.9,
    interactive:true
};

var daqMarker = {
    radius:markerRadius,
    color:'#000000',
    weight:2,
    fill:true,
    fillColor:'#fef39a',
    fillOpacity: 0.9,
    interactive:true
};

var clickOn = "#3e79d2";
var clickOff = "#eeede9";

var mapSettings = {
    zoomControl:false,
    dragging: false,
    keyboard: false,
    doubleClickZoom: false,
    tap:false,
    center: [40.700,-111.870]
};

/////////////////////////////////////
//
//            STATEMENTS
//
/////////////////////////////////////

document.getElementsByClassName('button')[0].addEventListener("click",animate);

//populate starting plot

//drawMap('fireworks');

var x = document.getElementById('wrapper');
x.innerHTML = "<div id='map'></div>";
var id = 'fireworks';
var sensorFilePath = "data/" + id +"Sensors.csv";
var sensorPositions  = readTextFile(sensorFilePath);
var sensorJSON =  csvJSON(sensorPositions);
var markerList = {};

var mapDisplay = L.map('map',mapSettings).setView(slcLocation,startZoom);

// Add tile layer to map -- MapBox Streets tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: maxZoom,
    minZoom: minZoom,
    id: 'mapbox.streets',
    accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
}).addTo(mapDisplay);


Object.keys(sensorJSON).forEach(function(k,i){

    var sensor = sensorJSON[i];
    var lat = parseFloat(sensor.lat);
    var lng = parseFloat(sensor.long);
    var id  = sensor.ID;
    var type = sensor.type;

    // console.log("sensor number: ", i);
    // console.log(type);

    if(type == 'PMS5003\'' | type == 'PMS1003\'') {
        markerList[id] = L.circleMarker ([lat,lng], purpleAirMarker).addTo(mapDisplay)

    } else if(type == 'H1.1\'') {
        markerList[id] = L.circleMarker ([lat,lng], airUMarker).addTo(mapDisplay);
    } else{
        print
        markerList[id] = L.circleMarker ([lat,lng], daqMarker).addTo(mapDisplay);
    }

    markerList[id].bindPopup("<b>monitor: </b>" + id);
    markerList[id]._path.id = id;
    markerList[id].on("mouseover",mouseOverEvent);
    markerList[id].on("click", clickEvent);
    markerList[id].on('mouseout',mouseOutEvent);

});

/////////////////////////////////////
//
//            FUNCTIONS
//
/////////////////////////////////////
function csvJSON(csv){

    var lines=csv.split('\n');

    var result = [];

    var headers=lines[0].split(',');
    lines.splice(0, 1);
    lines.forEach(function(line) {
        var obj = {};
        var currentline = line.split(',');
        headers.forEach(function(header, i) {
            obj[header] = currentline[i];
        });
        result.push(obj);
    });

    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
}
function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                //console.log(allText);

            }
        }
    }
    rawFile.send(null);
    return rawFile.responseText;
}
function mouseOverEvent(e){

    var markerID = e.sourceTarget._path.id;
    this.openPopup();
    console.log("you hovered " + markerID);

}
function clickEvent(e){

    var markerID = e.sourceTarget._path.id;
    var dot = document.getElementById(markerID);

    // console.log(dot.getAttribute("class"));
    // console.log("dot classname pre-click: ",dot.classList);
    // console.log("dot: ",dot);

    // toggle dot marker styling
    if (dot.classList.contains('selected')){
        dot.classList.remove('selected');
    } else{
        dot.classList.add('selected');
    }

}
function mouseOutEvent(e){

    var markerID = e.sourceTarget._path.id;
    this.closePopup();
    console.log("you hovered " + markerID);

}
function drawMap(id){

    var x = document.getElementById('wrapper');
        x.innerHTML = "<div id='map'></div>";

    var sensorFilePath = "data/" + id +"Sensors.csv";
    var sensorPositions  = readTextFile(sensorFilePath);
    var sensorJSON =  csvJSON(sensorPositions);
    var markerList = {};

    var mapDisplay = L.map('map',mapSettings).setView(slcLocation,startZoom);

    // Add tile layer to map -- MapBox Streets tile layer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: maxZoom,
        minZoom: minZoom,
        id: 'mapbox.streets',
        accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
    }).addTo(mapDisplay);


    Object.keys(sensorJSON).forEach(function(k,i){

        var sensor = sensorJSON[i];
        var lat = parseFloat(sensor.lat);
        var lng = parseFloat(sensor.long);
        var id  = sensor.ID;
        var type = sensor.type;

        // console.log("sensor number: ", i);
        // console.log(type);

        if(type == 'PMS5003\'' | type == 'PMS1003\'') {
            markerList[id] = L.circleMarker ([lat,lng], purpleAirMarker).addTo(mapDisplay)

        } else if(type == 'H1.1\'') {
            markerList[id] = L.circleMarker ([lat,lng], airUMarker).addTo(mapDisplay);
        } else{
            print
            markerList[id] = L.circleMarker ([lat,lng], daqMarker).addTo(mapDisplay);
        }

        markerList[id].bindPopup("<b>monitor: </b>" + id);
        markerList[id]._path.id = id;
        markerList[id].on("mouseover",mouseOverEvent);
        markerList[id].on("click", clickEvent);
        markerList[id].on('mouseout',mouseOutEvent);

    });

} // end drawMap
function openTab(evt, tabName) {
    console.log(evt);
    if(tabName=='duststorm' & evt.altKey == true & evt.shiftKey==true){

        var audio = new Audio('images/duststorm/op1/SA.mp3');
        audio.play();
    }
    var tablinks = document.getElementsByClassName("tab");

    for (i = 0; i < 4; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " is-active";

    drawMap(tabName);

}// end openTab
function animate(e){
    console.log("You clicked!");



    var activeTab = document.getElementsByClassName("is-active")[0].id;
    var condition = "op1";

    updateContour(activeTab,condition);

    // startPlayer(activeTab,condition);

}// end animate
function setContour(theMap, theContourData) {

  var contours = [];
  //var allContours = theContourData.contour;
  for (var key in theContourData) {
    if (theContourData.hasOwnProperty(key)) {
        // console.log(key, allContours[key]);
        var theContour = theContourData[key];
        var aContour = theContour.path;
        aContour.level = theContour.level;
        aContour.k = theContour.k;

        contours.push(aContour);
    }
  }

  contours.sort(function(a,b) {
      return b.level - a.level;
  });

  // var levelColours = ['#a6d96a', '#ffffbf', '#fdae61', '#d7191c', '#bd0026', '#a63603'];
  var levelColours = ['#31a354', '#a1d99b', '#e5f5e0', '#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
  var defaultContourColor = 'black';
  var defaultContourWidth = 1;

  var mapSVG = d3.select("#map").select("svg.leaflet-zoom-animated");
  var g = mapSVG.select("g");  //.attr("class", "leaflet-zoom-hide").attr('opacity', 0.8);

  // var contourPath = g.selectAll("path")
  //         .data(contours)
  //       .enter().append("path")
  //       .style("fill", function(d, i) { return levelColours[d.level];})
  //       .style("stroke", defaultContourColor)
  //       .style('stroke-width', defaultContourWidth)
  //       .style('opacity', 1)
  //       .on('mouseover', function(d) {
  //           d3.select(this).style('stroke', 'black');
  //       })
  //       .on('mouseout', function(d) {
  //           d3.select(this).style('stroke', defaultContourColor);
  //       });

  var contourPath = g.selectAll("path")
          .data(contours, function(d) { return d; });

  contourPath.style("fill", function(d, i) { return levelColours[d.level];})
            // .style("stroke", defaultContourColor)
            // .style('stroke-width', defaultContourWidth)
            .style('opacity', 1)
            .on('mouseover', function(d) {
                d3.select(this).style('stroke', 'black');
            })
            .on('mouseout', function(d) {
                d3.select(this).style('stroke', defaultContourColor);
            });

  var contourEnter = contourPath.enter().append("path")
    // .merge(contourPath)
    //   .attr("d", function(d) {
    //     var pathStr = d.map(function(d1) {
    //       var point = theMap.latLngToLayerPoint(new L.LatLng(d1[1], d1[2]));
    //       return d1[0] + point.x + "," + point.y;
    //     }).join('');
    //     return pathStr;
    //   })
      .style("fill", function(d, i) { return levelColours[d.level];})
      // .style("stroke", defaultContourColor)
      // .style('stroke-width', defaultContourWidth)
      .style('opacity', 0.6)
      .on('mouseover', function(d) {
          d3.select(this).style('stroke', 'black');
      })
      .on('mouseout', function(d) {
          d3.select(this).style('stroke', defaultContourColor);
      });

  contourPath.exit().remove();

  function resetView() {
    console.log('reset:', mapDisplay.options.center);
    contourEnter.attr("d", function(d) {
      var pathStr = d.map(function(d1) {
        var point = mapDisplay.latLngToLayerPoint(new L.LatLng(d1[2], d1[1]));
        return d1[0] + point.x + "," + point.y;
      }).join('');

      //console.log('d', d);

      return pathStr;
    });
  }

  theMap.on("viewreset", resetView);
  //theMap.on("zoom", resetView);

  resetView();
}

function updateContour(tab,condition) {
    console.log('updating the contours');

    //todo: choose  the contour set based on active tab and condition

    loadpaths(tab,condition);
    // getDataFromDB(lastContourURL).then(data => {
    //
    //     console.log(data);
    // // process contours data
    // setContour(slcMap, data);
    //
    // }).catch(function(err){
    //     // alert("error, request failed!");
    //     console.log("Error when updating the contour: ", err)
    // });
}

function loadpaths(folder,option){
    console.log("loading paths...");
    var filepath = "../paths/pathTest.json";

    readJSON(function(response) {
        // Parsing JSON string into object
        var actual_JSON = JSON.parse(response);
        console.log("made it through!");
        console.log("Returned Contours: ",actual_JSON);
        setContour(mapDisplay, actual_JSON);
    });

}//end loadpaths


function readJSON(callback) {

    var filepath="pathTest.json";

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filepath, true); // Replace 'appDataServices' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}//end function