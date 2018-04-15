// Options for map
var options = {
    lat: 0,
    lng: 0,
    zoom: 1.5,
    style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
}
var checkbox;

// Create an instance of Leaflet
var mappa = new Mappa('Leaflet');
var myMap;
var table;
var canvas;
var yearCheckBox;
var monthCheckBox;
var data = {};

function preload() {

    //load the data
    table = loadTable('data.csv', 'csv', 'header')

}

function setup() {
    canvas = createCanvas(800, 700);


    for (var i = 0; i < table.getRowCount(); i++) {
        var country = table.getString(i, 'Country');
        var temperature = Number(table.getString(i, 'Temperature'));
        var tourists = Number(table.getString(i, 'Tourists'));


        try {
            data[country]['temp'].push(temperature);
            data[country]['totalTourist'] += tourists;
        } catch (err) {
            data[country] = {
                temp: [temperature],
                totalTourist: tourists,
            };
        }
    }
    var divYear = createDiv('');
    var years = createDiv('Year: ');
    divYear.id('year-main-div');
    years.parent('year-main-div');
    years.class('year');

    var divMonth = createDiv('');
    var months = createDiv('Month: ');
    divMonth.id('month-main-div');
    months.parent('month-main-div');
    months.class('month');

    textSize(16);
    textAlign(CENTER);
    text('Year', 50, 50);
    background(200);

    // Create a tile map and overlay the canvas on top.
    myMap = mappa.tileMap(options);
    myMap.overlay(canvas);
    years = table.rows.map(row => row.obj.Year);
    years = years.unique();
    selectedYears = years;
    months = table.rows.map(row => row.obj.Month);
    months = months.unique();
    selectedMonths = months;

    for (i = 0; i < years.length; i++) {
        yearCheckBox = createCheckbox(years[i], years[i]);
        // div.html(yearCheckBox.elt.innerHTML, true);
        yearCheckBox.changed(yearCheckedEvent);
        yearCheckBox.parent('year-main-div');
        yearCheckBox.id(years[i]);
        yearCheckBox.class('year');
        yearCheckBox.value(years[i])
    }
    for (i = 0; i < months.length; i++) {
        monthCheckBox = createCheckbox(months[i], months[i]);
        monthCheckBox.changed(monthCheckedEvent);
        monthCheckBox.parent('month-main-div');
        monthCheckBox.id(months[i]);
        monthCheckBox.class('month');
        monthCheckBox.value(months[i])
    }


    // Load the data
    //table = loadTable('data.csv', 'csv', 'header');

    // Only redraw the table when the map change and not every frame.
    myMap.onChange(drawMap);

    fill(70, 203, 31);
    stroke(100);
}

// The draw loop is fully functional but we are not using it for now.
function draw() {
}

function drawMap() {
    // Clear the canvas
    clear();

    for (var i = 0; i < table.getRowCount(); i++) {

        var year = table.getString(i, 'Year');
        var month = table.getString(i, 'Month');
        if (selectedYears.includes(year) && selectedMonths.includes(month)) {
            // Get the lat/lng of each map
            var latitude = Number(table.getString(i, 'Latitude'));
            var longitude = Number(table.getString(i, 'Longitude'));
            var country = table.getString(i, 'Country');

            // Only draw them if the position is inside the current map bounds. We use a
            // Leaflet method to check if the lat and lng are contain inside the current
            // map. This way we draw just what we are going to see and not everything. See
            // getBounds() in http://leafletjs.com/reference-1.1.0.html
            if (myMap.map.getBounds().contains({lat: latitude, lng: longitude})) {
                // Transform lat/lng to pixel position
                var pos = myMap.latLngToPixel(latitude, longitude);
                // Get the size of the map and map it.
                var size = table.getString(i, 'Tourists');
                size = map(size, 558, 60000000, 1, 25) + myMap.zoom();
                var latlng = myMap.fromPointToLatLng(pos.x, pos.y);

                ellipse(pos.x, pos.y, size, size);
                var circle = L.circle(latlng, {
                    color: 'green',
                    fillOpacity: 0.0,
                    opacity: 0.0

                }).addTo(myMap.map);

                var detail = "\
                <div>\
                    <strong>" + country + "</strong>\
                    <br>\
                    <strong>Highest Temperature: </strong>" + Math.max.apply(null, data[country]['temp']) + "\
                    <br>\
                    <strong>Lowest Temperature: </strong>" + Math.min.apply(null, data[country]['temp']) + "\
                    <br>\
                    <strong>Number of Tourists: </strong>" + data[country]['totalTourist'] + "\
                </div>";
                circle.bindPopup(detail);

                circle.on('mouseover', function (e) {
                    this.openPopup();
                });
                circle.on('mouseout', function (e) {
                    this.closePopup();
                });

            }
        }
    }
}

Array.prototype.unique = function () {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
};


function yearCheckedEvent() {
    var year = this.checked();
    if (year) {
        // console.log(this);
        var value = this.value();
        selectedYears.push(value);
    } else {
        var value = this.value();
        var index = selectedYears.indexOf(value);
        if (index > -1) {
            selectedYears.splice(index, 1)
        }
    }
    console.log(selectedYears);
    myMap.onChange(drawMap);
}

function monthCheckedEvent() {
    var month = this.checked();
    console.log(selectedMonths);
    if (month) {
        console.log(this);
        var value = this.value();
        console.log(value);
        selectedMonths.push(value);
    } else {
        var value = this.value();
        var index = selectedMonths.indexOf(value);
        if (index > -1) {
            selectedMonths.splice(index, 1)
        }
    }
    console.log(selectedMonths);
    myMap.onChange(drawMap);
}
