Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

// Constant Variables
var FRAME_RATE = 10;
var REFRESH = 1000/FRAME_RATE;
var IS_PLAYING = false;
var SLIDER_MIN = 3;

/////////////////////////////////////
//
//            VARIABLES
//
/////////////////////////////////////

//Map Options
var activeTab = "";
var startZoom = 11;
var maxZoom = startZoom;
var minZoom = startZoom;
var slcLocation = [40.700,-111.870];
var mapSettings = {
    zoomControl:false,
    dragging: false,
    keyboard: false,
    doubleClickZoom: false,
    tap:false,
    center: [40.700,-111.870]
};



//Simulation Overlay Options
var imgOverlayOptions ={
    opacity:0.7,
    zIndex:100,
    className:'simulation',
};
var	imgBounds = [[40.810476,-112.001349],[40.598850,-111.713403]];



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
var condition ="";

var start_filename = "img_contours/" + activeTab + "/image0003.png";

//load new one
var overlay = L.imageOverlay(start_filename,imgBounds,imgOverlayOptions);
/////////////////////////////////////
//
//            STATEMENTS
//
/////////////////////////////////////


//Make map container
var container = document.getElementById('wrapper');
container.innerHTML = "<div id='map'></div>";
var mapDisplay = L.map('map',mapSettings).setView(slcLocation,startZoom);
paintMap(mapDisplay);

//Load sensor positions
var id = document.getElementsByClassName('is-active')[0].id;
loadSensorPositions(id);

//preloadImg();
//add player controls to tab
addPlayerControls();
addModelOptions();


/////////////////////////////////////
//
//            FUNCTIONS
//
/////////////////////////////////////

//==== Sensor placement functions
function loadSensorPositions(id){

    var sensorFilePath = "data/" + id +"Sensors.csv";
    var sensorPositions  = readTextFile(sensorFilePath);
    var sensorJSON =  csvJSON(sensorPositions);
    var markerList = {};

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

            markerList[id] = L.circleMarker ([lat,lng], daqMarker).addTo(mapDisplay);
        }

        markerList[id].bindPopup("<b>monitor: </b>" + id);
        markerList[id]._path.id = id;
        markerList[id].on("mouseover",mouseOverEvent);
        //markerList[id].on("click", clickEvent);
        markerList[id].on('mouseout',mouseOutEvent);

    });

} // end function loadSensorPositions(id)
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
    //
    //console.log("you hovered " + markerID);

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
    //console.log("you hovered " + markerID);

}


//==== Tab content Functions
function addMap(id){

    var x = document.getElementById('wrapper');
        x.innerHTML = "<div id='map'></div>";

    mapDisplay = L.map('map',mapSettings).setView(slcLocation,startZoom);

    // // Add tile layer to map -- MapBox Streets tile layer
    // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     maxZoom: maxZoom,
    //     minZoom: minZoom,
    //     id: 'mapbox.streets',
    //     accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
    // }).addTo(mapDisplay);

    paintMap(mapDisplay);

    loadSensorPositions(id);

} // end drawMap
function paintMap(map){
    // Add tile layer to map -- MapBox Streets tile layer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: maxZoom,
        minZoom: minZoom,
        id: 'mapbox.streets',
        accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
    }).addTo(map);
}
function openTab(evt, tabName) {

    if(tabName=='duststorm' & evt.altKey == true & evt.shiftKey==true){

        var audio = new Audio('images/duststorm/op1/SA.mp3');
        audio.play();
    }

    var tablinks = document.getElementsByClassName("tab");

    //de-activate old tab
    for (i = 0; i < 4; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }

    //activate current tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " is-active";

    addMap(tabName);
    addPlayerControls();
    addModelOptions();
}// end openTab

function addModelOptions(){

    var options = ["one","two","three","four"];
    var modelOptions = document.createElement('div');
    modelOptions.id = "modelOptions";
    container.appendChild(modelOptions);
    console.log(container);

    var modOpts = 4;
    for(i=1;i<=modOpts;i++){

        var button = document.createElement('input');
        button.id='option'+i.toString();
        button.className = "option";
        button.value = "Option "+i.toString();
        button.type="radio";
        button.name="modelOption";
        button.onclick = setOption;
        button.onmouseover = highlightSensors;
        button.onmouseleave = unstyleSensors;
        //assign first element as checked
        if(i==1){
            button.checked="checked";
        }
        modelOptions.appendChild(button);


        //make label
        var label = document.createElement('label');
        label.for="Option "+i.toString();
        label.innerHTML=options[i-1];
        modelOptions.appendChild(label)
    } // end for i


}
function highlightSensors(){
    var option=this.id;
    var sensorlist = getSensorList(option);

    for(key in sensorlist){
        var sensorID = sensorlist[key];
        //console.log("change: ", sensorlist[key]);
        var sensor = document.getElementById(sensorID);
        sensor.style.fill="#0FF";
        console.log(sensor);
        //sensor.className="simulationSelection";

        //todo: change style for monitors in  list
    }

}
function unstyleSensors(){

    var option=this.id;
    var sensorlist = getSensorList(option);

    for(key in sensorlist){
        var sensorID = sensorlist[key];
        var fillColor = getFillColor(sensorID);
        //console.log("change: ", sensorlist[key]);
        var sensor = document.getElementById(sensorID);
        sensor.style.fill=fillColor;
        console.log(sensor);
        //sensor.className="simulationSelection";

        //todo: change style for monitors in  list
    }
    //todo: remove style
}
function getFillColor(ID){

    var stringLength = ID.length;

    if(stringLength==5){
        return purpleAirMarker.fillColor;
    }else if(stringLength==3){
        return daqMarker.fillColor;
    }else{
        return airUMarker.fillColor;
    }
}
function getSensorList(option){
    var sensorList = [];

    //todo: make arrays for sensor IDs in each option
    switch(option){
        case 'option1':
            sensorList = ["6062'"];
            break;
        case 'option2':
            sensorList = ["7754'"];
            break;
        case 'option3':
            sensorList = ["1719'"];
            break;
        case 'option4':
            sensorList = ["7207'"];
            break;
        default:
            sensorList = ["d1","d2","d3"];
            break;
    } //end switch option

    return sensorList;
}
function setOption(){
    //this.classList.toggle("active");
    console.log(this.value)

}
function addPlayerControls(){
    activeTab = document.getElementsByClassName("is-active")[0].id;
    condition = "op1";

    var playerContainer = document.createElement('div');
    playerContainer.id = 'playerContainer';

    container.appendChild(playerContainer);

    //add HTML slider
    var input = document.createElement('input');

    input.id="slider";
    input.type="range";
    input.step='1';
    input.value="0";

    playerContainer.appendChild(input);

    //Add Button container
    var btnContainer = document.createElement('div');
    btnContainer.class = "btnContainer";
    playerContainer.appendChild(btnContainer);


    //Add Play buttons
    var playBtn = document.createElement("button");
    playBtn.innerHTML = "Play/Pause";
    playBtn.class="play";

    btnContainer.appendChild(playBtn);

    playBtn.addEventListener("click",function(){

        var extents = getSimulationExtent(activeTab);
        input.min = SLIDER_MIN;
        input.max = extents[1];

        //console.log("clicked play");
        togglePlay();
        //console.log("Playing is ",IS_PLAYING);

        if(IS_PLAYING){
            advanceSlider();
        }
    });

    //Add Reset Button
    var resetBtn = document.createElement("button");
    resetBtn.innerHTML = "Reset";
    resetBtn.class="reset";
    btnContainer.appendChild(resetBtn);

    resetBtn.addEventListener("click",function(){
        resetPlayer();
        //console.log("reset");
        loadIMG(SLIDER_MIN);
    });

    //Add readout text
    var timestamp = document.createElement("div");
    timestamp.id="timestamp";
    container.appendChild(timestamp);

}
function resetPlayer(){
    //console.log("Clicked 'RESET'");

    IS_PLAYING = false;

    var slider = document.getElementById("slider");
    slider.value=SLIDER_MIN;
    timestamp.innerHTML= "Start";
}

async function advanceSlider(){

    var slider = document.getElementById("slider");
    var sliderStart = parseInt(slider.value);
    var endVal = parseInt(slider.max);

    var timestamp = document.getElementById("timestamp");

    //console.log("endval",endVal);


    //preloadImg();

    for(i = sliderStart; i<=endVal; i++){

        if(IS_PLAYING){

            //var filename = "img_contours/" + activeTab + "/image" + pad(i,4) + ".png";
            //var image = L.imageOverlay(filename,imgBounds,imgOverlayOptions);

            // if (mapDisplay.hasLayer(image)) {
            //          mapDisplay.removeLayer(image);
            // }
            //

            //loadpaths(activeTab,condition,i);
            loadIMG(i);

            timestamp.innerHTML = i;
            slider.value = i;

            await sleep(REFRESH);
        } else{
            break;
        } //end if/else IS_PLAYING

    }// end for i

}// end function advance Slider

//==== Contours as Path elements
function setContour(theMap, simulationRun,step) {

        let k = 0;
        let contour = simulationRun[step];

        var contours = [];

        for (var key in contour) {
            if (contour.hasOwnProperty(key)) {
                // console.log(key, allContours[key]);
                var theContour = contour[key];
                var aContour = theContour.path;
                aContour.level = theContour.level;
                aContour.k = theContour.k;

                contours.push(aContour);
            }// end if
        }//end for

        contours.sort(function (a, b) {
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
            .data(contours, function (d) {
                return d;
            });

        contourPath.style("fill", function (d, i) {
            return levelColours[d.level];
        })
        // .style("stroke", defaultContourColor)
        // .style('stroke-width', defaultContourWidth)
            .style('opacity', 1)
            .on('mouseover', function (d) {
                d3.select(this).style('stroke', 'black');
            })
            .on('mouseout', function (d) {
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
            .style("fill", function (d, i) {
                return levelColours[d.level];
            })
            // .style("stroke", defaultContourColor)
            // .style('stroke-width', defaultContourWidth)
            .style('opacity', 0.6)
            .on('mouseover', function (d) {
                d3.select(this).style('stroke', 'black');
            })
            .on('mouseout', function (d) {
                d3.select(this).style('stroke', defaultContourColor);
            });

        contourPath.exit().remove();

        function resetView() {
            //console.log('reset:', mapDisplay.options.center);
            contourEnter.attr("d", function (d) {
                var pathStr = d.map(function (d1) {
                    var point = mapDisplay.latLngToLayerPoint(new L.LatLng(d1[2], d1[1]));
                    return d1[0] + point.x + "," + point.y;
                }).join('');

                //console.log('d', d);

                return pathStr;
            });
        }//end function reset view

        theMap.on("viewreset", resetView);
        //theMap.on("zoom", resetView);

        resetView();

}//end function set contour
function updateContour(tab,condition) {
   // console.log('updating the contours');

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
function loadpaths(folder,option,step){
    //console.log("loading paths...");

    //addAnimationControls(folder);
    readJSON(function(response) {
        // Parsing JSON string into object
        var actual_JSON = JSON.parse(response);
        //console.log("made it through!");
        //console.log("Returned Contours: ",actual_JSON);
        setContour(mapDisplay, actual_JSON,step);
    });

}//end loadpaths
function readJSON(callback) {

    var filepath = "paths/ExampleContour.json";

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
}//end function readJSON

//==== Contours as PNGs
function preloadImg() {
    document.body.innerHTML += '<div id="secretDiv"></div>';

    var sec = document.getElementById('secretDiv');
    //var secretDiv = document.createElement('div');

    for (i = 3; i < 50;){
        var img = document.createElement('img');
        var current_imgSuffix = pad(i, 4);
        var current_filename = "img_contours/" + activeTab + "/image" + current_imgSuffix + ".png";

        img.src = current_filename;

        sec.appendChild(img);
    }
}
function loadIMG(stepNumber){

    var new_imgSuffix = pad(stepNumber,4);
    var new_filename = "img_contours/" + activeTab + "/image" + new_imgSuffix + ".png";

    overlay.setUrl(new_filename).addTo(mapDisplay);

}// end loadIMG;


//====utilities
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
    function pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length-size);
    }
function togglePlay(){
    if(IS_PLAYING){
        IS_PLAYING = false;
    }
    else {
        IS_PLAYING = true;
    }
}
function getSimulationExtent(tab){

    var max = SLIDER_MIN; // number of simulation steps

    switch(tab){
        case "fireworks":
            max = 100;
            break;
        case "duststorm":
            max = 431;
            break;
        case "wildfire":
            max = 431;
            break;
        case "inversion":
            max=400;
            break;
        default:
            max = 10;
    } //end switch tab
    return [SLIDER_MIN, max]

}// end function getSimulation Extent
