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
var circMarker1Options = {
    radius:markerRadius,
    color:'#000000',
    weight:2,
    fill:true,
    fillColor:'#ffffff',
    fillOpacity: 0.9,
    interactive:true
};

var circMarker2Options = {
    radius:markerRadius,
    color:'#000000',
    weight:2,
    fill:true,
    fillColor:'#fea211',
    fillOpacity: 0.9,
    interactive:true
};

var clickOn = "#3e79d2";
var clickOff = "#eeede9";

var mapSettings = {
    zoomControl:false
};

/////////////////////////////////////
//
//            STATEMENTS
//
/////////////////////////////////////

document.getElementsByClassName('button')[0].addEventListener("click",animate);

//populate starting plot
drawMap('fireworks');

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

    var dotColor = dot.attributes.fill.value;
    //var dot = d3.select('#'+markerID);
    console.log("Dot color: " + dotColor);

    if(dotColor == clickOn){
        dot.style.fill = clickOff;
    } else {
        dot.style.fill = clickOn
    }
    // dot.style.fill='black';s
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

        if(id.length > 5) {
            markerList[id] = L.circleMarker ([lat,lng], circMarker1Options).addTo(mapDisplay)

        } else{
            markerList[id] = L.circleMarker ([lat,lng], circMarker2Options).addTo(mapDisplay);
        }

        markerList[id].bindPopup("<b>monitor: </b>" + id);
        markerList[id]._path.id = id;
        markerList[id].on("mouseover",mouseOverEvent);
        markerList[id].on("click", clickEvent);
        markerList[id].on('mouseout',mouseOutEvent);

    });

} // end drawMap
function openTab(evt, tabName) {

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
    startPlayer(activeTab,condition);

}// end animate
function startPlayer(tab,condition){

    var imgDirectory = "images/" + tab + "/" + condition;

    var x = document.getElementById('wrapper');
    x.innerHTML = "<div id='animation'></div>";

    var div = document.getElementById("animation");

    // create a new div element
    var newDiv = document.createElement("div");

    // and give it some content
    var newContent = document.createTextNode("you chose "+tab);

    // add the text node to the newly created div
    div.appendChild(newContent);






} // end startPlayer