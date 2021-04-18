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
var FRAME_RATE = 6;
var REFRESH = 1000/FRAME_RATE;
var IS_PLAYING = false;
var SLIDER_MIN = 3;
var SPLASHPAGE = "fireworks";
var STEP = 3;
/////////////////////////////////////
//
//            VARIABLES
//
/////////////////////////////////////

//Map Options
var activeTab = SPLASHPAGE;
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


var option ="option1";

var start_filename = "img_contours/" + activeTab + "/image0003.png";

//load new one
var overlay = L.imageOverlay(start_filename,imgBounds,imgOverlayOptions);

//load sensor list
// var sensor_list_fp = "data/sensor_list.csv";
// var sensorList = readTextFile(sensor_list_fp);
// var sensorList_json = csvJSON(sensorList);

/////////////////////////////////////
//
//            STATEMENTS
//
/////////////////////////////////////

addMapContainer();

//ADD COLORBAR HERE TO PLACE IT LEFT OF MAP

// Add a map div to mapContainer
var mapCont = document.getElementById('mapContainer');
var map = document.createElement('div');
map.id='map';
mapCont.appendChild(map);

// ADD COLOR BAR HERE TO PLACE IT RIGHT OF MAP
addColorBar();

var mapDisplay = L.map('map',mapSettings).setView(slcLocation,startZoom);
var id = document.getElementsByClassName('is-active')[0].id;

loadSensorPositions(activeTab);

paintMap(mapDisplay);
addPlayerControls();
addModelOptions(activeTab);

//To show full date, uncomment this line
//timestamp.innerHTML= getStartTime(activeTab);

//To hide full date and show only time of day uncomment this line
timestamp.innerHTML= getStartTime(activeTab).toLocaleTimeString();
//style monitors
var selected_monitors = loadOptionFile(option);
styleMonitors(selected_monitors);

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
}
function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                //console.log(allText);
            }// end if 200
        }// end if 4
    }// end statechange

    rawFile.send(null);
    return rawFile.responseText;
}
function mouseOverEvent(e){

    //var markerID = e.sourceTarget._path.id;
    this.openPopup();
}
function mouseOutEvent(e){

    //var markerID = e.sourceTarget._path.id;
    this.closePopup();
    //console.log("you hovered " + markerID);
}

//==== Tab content Functions
function addMap(id){

    paintMap(mapDisplay);
    loadSensorPositions(id);

} // end drawMap
function paintMap(map){
    // [OLD] Add tile layer to map -- MapBox Streets tile layer
  //  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  //      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  //      maxZoom: maxZoom,
   //     minZoom: minZoom,
  //      id: 'mapbox.streets',
  //      accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
   // }).addTo(map);
    
     // [OLD] Add tile layer to map -- MapBox Streets tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '&copy <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        maxZoom: maxZoom,
        minZoom: minZoom,
        id: 'mapbox/streets-v11',
        accessToken:'pk.eyJ1IjoiamFtb29yZTg0IiwiYSI6ImNqbm0zeWo5ZTAwcDIzcXM4NjJ4czBuODUifQ.cJSLiKVi7lbGzE4RQTRNHA'
    }).addTo(map);
}
function removeAllSensors(){
    var svg = document.getElementsByTagName('svg')[0];
    var group = svg.getElementsByTagName('g')[0];
    var paths = group.getElementsByTagName('path');
    //console.log("total paths on Screeen:",paths);
    paths.remove();
}
function openTab(evt, tabName) {

    resetPlayer();

    //REmove all sensors on the tab
    removeAllSensors();

    activeTab = tabName;

    var tablinks = document.getElementsByClassName("tab");

    if(tabName=='duststorm' & evt.altKey == true & evt.shiftKey==true){

        var audio = new Audio('images/duststorm/op1/SA.mp3');
        audio.play();
    }

    //de-activate old tab
    for (i = 0; i < 4; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }

    //activate current tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " is-active";

    // Look up what sensors should be on the map
    loadSensorPositions(activeTab);

    console.log(option);
    console.log(activeTab);

    option="option1";
    //addMapContainer();
    //addColorBar();

    mapDisplay.removeLayer(overlay);

    var monitors = loadOptionFile(option);
    styleMonitors(monitors);
    //paintMap(mapDisplay);
    //addPlayerControls();

    //remove and reload player controls
    document.getElementById('playerContainer').remove();
    //document.getElementById('timestamp');
    addPlayerControls();

    // Update the slider with the current max value
    var slider = document.getElementById('slider');
    var extents = getSimulationExtent(activeTab);
    slider.max=extents[1];

    //remove and reload model options data
    document.getElementById('modelOptions').remove();
    addModelOptions(tabName);

    //To show full date, uncomment this line
    //timestamp.innerHTML= getStartTime(activeTab);

    //to hide date and show only time of day, uncomment this line
    timestamp.innerHTML= getStartTime(activeTab).toLocaleTimeString();

}// end openTab
function addMapContainer(){
    var wrapper = document.getElementById('wrapper');
    var mapContainer = document.createElement('div');
    mapContainer.id='mapContainer';
    wrapper.appendChild(mapContainer);
}//end addMapContainer;
function addColorBar(){

    // select mapContainer
    var mapContainer = document.getElementById('mapContainer');

    //Add Color Bar Div
    var colorBar = document.createElement('div');
    colorBar.id = 'colorBar';
    mapContainer.appendChild(colorBar);

    //create image element
    var barImg = new Image(450,100);
    barImg.src = "images/colorbar.jpeg";
    barImg.className="colorBar";
    barImg.width="30px";

    //add image to colorbar Div
    var colorBarDiv = document.getElementById('colorBar');
    colorBarDiv.appendChild(barImg);

}// end addColorBar()
function getSimulationOptions(tab){

    // // // //
    //
    //  This switch statement lets you define per-event style simulation parameters, but
    //  it looks like we're going with uniform sensor selections for every tab.
    //
    // // // //

    var opts = [];

    switch(tab){
        case "fireworks":
            opts = ["option1", "option2", "option3", "option4","option5"];
            break;
        case "wildfire":
            opts = ["option1", "option2", "option3", "option4", "option5"];
            break;
        case "duststorm":
            opts = ["option1", "option2", "option3", "option4", "option5"];
            break;
        case "inversion":
            opts = ["option1", "option2", "option3", "option4"];
            break;
        default:
            opts=['def1','def2'];
            break;
    }//end switch(tab)

    return opts;
}

function addModelOptions(tabName){

    // //create model options HTML element
    var modelOptions = document.createElement('div');
    modelOptions.id = "modelOptions";
    wrapper.appendChild(modelOptions);

    //get option types
    var options = getSimulationOptions(tabName);

    //add options types to tab
    for(i=0;i<options.length;i++){
        var button = document.createElement('input');
        button.id='option'+(i+1).toString();
        button.className = "option";
        button.value = options[i];
        button.type="radio";
        button.name="modelOption";
        button.onclick = setOption;

        //Manually assign first option as default
        if(i==0){
            button.checked="checked";
        }

        modelOptions.appendChild(button);

        //make label
        var option_label_text = ["All Sensors", "Sparse", "NE Quadrant", "SW Quadrant", "DAQ Only"];
        var label = document.createElement('label');
        label.for=options[i];
        label.innerHTML=option_label_text[i];
        modelOptions.appendChild(label)
    } // end for i
}
function getFillColor(ID){

    var stringLength = ID.length;

    if(stringLength<=5){
        return purpleAirMarker.fillColor;
    }else if(ID=="Hawthorne" || ID=="Rose Park"){
        return daqMarker.fillColor;
    }else{
        return airUMarker.fillColor;
    }
}
function addMinutes(date, minutes) {

    //this returns a string only -- add "new Date (...) to return datetime object
    return new Date(date.getTime() + minutes*60000);
}
function styleMonitors(monitors){

    var sensorFilePath = "data/" + activeTab +"Sensors.csv";
    var sensorPositions  = readTextFile(sensorFilePath);
    var sensorList_json =  csvJSON(sensorPositions);

    for(i=0;i<monitors.length;i++){

        var id = sensorList_json[i].ID;
        var selected = monitors[i]["selected\r"];

        var sensor = document.getElementById(id);

        // console.log("mon ID: " +id + "Select:" + selected );

        if(selected){
            sensor.style.fill=getFillColor(id);
            sensor.style.opacity = 1;
            sensor.style.zIndex=1000;
        }else{
            sensor.style.opacity = 0.15;
            sensor.style.fill="#eeeeee";
            sensor.style.zIndex=0;
        }
    }// end for i

}
function setOption(){

    option = this.value;

    // Load option file
    var selected_monitors = loadOptionFile(option);

    //style monitors
    styleMonitors(selected_monitors);

    //Update image if player is paused
    if(!IS_PLAYING){
        loadIMG(STEP,activeTab,option);
    }//end if not playing

}
function loadOptionFile(option){

    var filename = "data/selections/" + activeTab + "/" +option+ ".csv";
    //load file
    var rawText= readTextFile(filename);
    var conditions = csvJSON(rawText);


    //convert text "TRUE/FALSE" to boolean
    conditions.forEach(function(sensor){

        var selection = sensor["selected\r"];

        if(selection =="TRUE\r" || selection =="TRUE"){
            sensor["selected\r"] = true;
        }else{
            sensor["selected\r"] = false;
        } // end if else

    });

    return conditions;
}

function addPlayerControls(){

    activeTab = document.getElementsByClassName("is-active")[0].id;

    var playerCont = document.createElement('div');
    playerCont.id = 'playerContainer';

    var tabWrapper = document.getElementById('wrapper');
    tabWrapper.appendChild(playerCont);

    var playerContainer = document.getElementById('playerContainer');

    //add HTML slider
    var input = document.createElement('input');

    input.id="slider";
    input.type="range";
    input.step='1';
    input.value="0";

    playerContainer.appendChild(input);

    //add code to detect dynamic click events
    var inpt = document.getElementById('slider');
    inpt.addEventListener('input',(evt)=>{
        STEP = evt.target.value;
        console.log("you clicked:", STEP);
        updateAnonTimestamp(STEP);
        loadIMG(STEP, activeTab,option);

        console.log('changed',STEP);
    });
    //input.onChange = sliderTest;

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
    });

    //Add readout text
    //var playerContainer = document.getElementById('playerContainer');
    var timestamp = document.createElement("div");
    timestamp.id="timestamp";
    playerContainer.appendChild(timestamp);

}
function resetPlayer(){

    IS_PLAYING = false;

    var slider = document.getElementById("slider");

    //Reset slider to beginning
    slider.value=0;
    STEP = 3;

    //Reset timestamp to beginning
    //To show full date, uncomment this line
    //timestamp.innerHTML= getStartTime(activeTab);

    //To hide full date and show only time of day, uncomment this line
    timestamp.innerHTML= getStartTime(activeTab).toLocaleTimeString();


    mapDisplay.removeLayer(overlay);

}
async function advanceSlider(){

    var slider = document.getElementById("slider");
    var sliderStart = parseInt(slider.value);
    var endVal = parseInt(slider.max);

    for(STEP; STEP<=endVal; STEP++){
        //var t0 = performance.now();

        if(IS_PLAYING){

            loadIMG(STEP,activeTab,option);

            //updateTimestamp(STEP);
            updateAnonTimestamp(STEP);
            slider.value = STEP;

            await sleep(REFRESH);
            //setDelay();
        } else{

           break;
        } //end if/else IS_PLAYING
        //var t1 = performance.now();
        //console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    }// end for i

}// end function advance Slider
function updateTimestamp(step){

    var timestamp = document.getElementById("timestamp");

    var startTime = getStartTime(activeTab);

    var stepIncrement = getStepIncrement(activeTab);
    var newTime = addMinutes(startTime, step*stepIncrement);

    timestamp.innerHTML = newTime.toLocaleTimeString();
}

function updateAnonTimestamp(step){

    // This function is for giveing the times without the date

    var timestamp = document.getElementById("timestamp");
    var startTime = getStartTime(activeTab);
    var stepIncrement = getStepIncrement(activeTab);
    var newTime = addMinutes(startTime, step*stepIncrement);
    //console.log(newTime);
    timestamp.innerHTML = newTime.toLocaleTimeString();
}
function getStepIncrement(activeTab){

    //controls how many minutes the timestep advances per step
    var minutesToIncrement = 10;

    switch(activeTab){
        case "fireworks":
            minutesToIncrement = 10;
            break;
        case "wildfire":
            minutesToIncrement = 10;
            break;
        case "inversion":
            minutesToIncrement = 60;
            break;
        case "duststorm":
            minutesToIncrement = 10;
            break;
        default:
            minutesToIncrement = 10;
            break;
    }

    return minutesToIncrement;
}
function getStartTime(tab){
    var time = new Date(2001,0,0);
    switch(tab){
        case 'fireworks':
            time = new Date(2018,6,4,17,0,0,0);
            break;
        case 'wildfire':
            time = new Date(2018,6,5,19,0,0,0);
            break;
        case 'inversion':
            time = new Date(2017,11,28);
            break;
        case 'duststorm':
            time = new Date(2017,9,20);
            break;
        default:
            time=new Date(1984,7,28)
    }//end switch tab

    return time;
}

//==== Contours as PNGs
function loadIMG(stepNumber,tab,option){

    var new_imgSuffix = pad(stepNumber,4);
    var new_filename = "img_contours/" + tab + "/" + option +"/image" + new_imgSuffix + ".png";

    //overlay.setUrl(new_filename).addTo(mapDisplay);

    // **** Alex's Link
    //https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Fetching_data#A_more_complex_example

    fetch(new_filename).then(function(response) {

        return response.blob();

    }).then(function(blob) {

        // Convert the blob to an object URL — this is basically an temporary internal URL
        // that points to an object stored inside the browser
        var objectURL = URL.createObjectURL(blob);

        // put image on map
        overlay.setUrl(objectURL).addTo(mapDisplay);
    });

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
            max = 93;
            break;
        case "wildfire":
            max = 176;
            break;
        case "duststorm":
            max = 146;
            break;
        case "inversion":
            max=74;
            break;
        default:
            max = SLIDER_MIN;
    } //end switch tab
    return [SLIDER_MIN, max]

}// end function getSimulation Extent
