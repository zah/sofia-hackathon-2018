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
    timeRangeLabel, dateRangeLabel,
    sunrise, sunset;

function relativePosInTheDay(time) {
    return (time.getHours() * 60 + time.getMinutes()) / (24 * 60);
}

function formatTime(time) {
    return pad(time.getHours()) + ":" + pad(time.getMinutes());
}

function changeDate() {
    var Y = now.getFullYear(),
        M = now.getMonth(),
        D = now.getDate(),
        h = now.getHours(),
        m = 0;

    timeRangeLabel.innerText = pad(h) + ':' + pad(m);
    dateRangeLabel.innerText = Y + '-' + pad(M + 1) + '-' + pad(D);

    osmb.setDate(new Date(Y, M, D, h, m));

    var times = SunCalc.getTimes(now, sofiaCityCenter.latitude, sofiaCityCenter.longitude);
    var markersRange = timeRange.offsetWidth;
    var sunriseMarkerPos = markersRange * relativePosInTheDay(times.sunrise);
    var sunsetMarkerPos = markersRange * relativePosInTheDay(times.sunset);

    sunriseMarker.style.left = Math.floor(sunriseMarkerPos) + "px";
    sunsetMarker.style.left = Math.floor(sunsetMarkerPos) + "px";

    sunriseMarker.innerHTML = "<div>" + "Изгрев " + formatTime(times.sunrise) + "</div>";
    sunsetMarker.innerHTML = "<div>" + "Залез " + formatTime(times.sunset) + "</div>";
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
sunriseMarker = document.getElementById('sunrise-marker');
sunsetMarker = document.getElementById('sunset-marker');
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
