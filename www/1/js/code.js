var sofiaCityCenter = {
    latitude: 42.6977,
    longitude: 23.3219
};

var izgrev = {
    latitude: 42.6700,
    longitude: 23.3483
};

var oborishte = {
    latitude: 42.6964,
    longitude: 23.3408
};

var osmb = new OSMBuildings({
    container: 'map',
    position: oborishte,
    zoom: 16,
    minZoom: 15,
    maxZoom: 20,
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'

});

function absoluteUrl(path) {
    return window.location.protocol + "//" + window.location.hostname + path;
}

osmb.addMapTiles('https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png');
osmb.addGeoJSON(absoluteUrl('/geojson/sofia.geojson'));

//********************************************************

var
    now,
    date, time,
    timeRange, dateRange,
    timeRangeLabel, dateRangeLabel;

function changeDate() {
    var Y = now.getFullYear(),
        M = now.getMonth(),
        D = now.getDate(),
        h = now.getHours(),
        m = 0;

    timeRangeLabel.innerText = pad(h) + ':' + pad(m);
    dateRangeLabel.innerText = Y + '-' + pad(M + 1) + '-' + pad(D);

    osmb.setDate(new Date(Y, M, D, h, m));
}

function onTimeChange() {
    now.setHours(this.value);
    now.setMinutes(0);
    changeDate();
}

function onDateChange() {
    now.setMonth(0);
    now.setDate(this.value);
    changeDate();
}

function pad(v) {
    return (v < 10 ? '0' : '') + v;
}

timeRange = document.getElementById('time');
dateRange = document.getElementById('date');
timeRangeLabel = document.querySelector('*[for=time]');
dateRangeLabel = document.querySelector('*[for=date]');

now = new Date;
changeDate();

// init with day of year
var Jan1 = new Date(now.getFullYear(), 0, 1);
dateRange.value = Math.ceil((now - Jan1) / 86400000);

timeRange.value = now.getHours();

timeRange.addEventListener('change', onTimeChange);
dateRange.addEventListener('change', onDateChange);
timeRange.addEventListener('input', onTimeChange);
dateRange.addEventListener('input', onDateChange);
