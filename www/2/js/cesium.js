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

function absoluteUrl(path) {
    return window.location.protocol + "//" + window.location.hostname + path;
}

function startup(Cesium) {
    'use strict';
    
    // var terrainProviders = Cesium.createDefaultTerrainProviderViewModels();
    var imageryProviders = Cesium.createDefaultImageryProviderViewModels();
    
    console.log("IMAGE PROVIDERS ", imageryProviders);

    var terrain = Cesium.createWorldTerrain();
    
    var viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        infoBox: false,
        selectionIndicator: false,
        timeline: false,
        shadows: true,
        //terrainProviderViewModels: terrainProviders,
        // terrainProvider: terrainProviders[1],
        imageryProviderViewModels       : imageryProviders,
        selectedImageryProviderViewModel: imageryProviders[11]
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    var longitude = sofiaCityCenter.longitude;
    var latitude = sofiaCityCenter.latitude;
    var height = 2000.0;

    // Set the initial camera view to look at Manhattan
    var initialPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 753);
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
    var initialView = {
        destination: initialPosition,
        orientation: initialOrientation,
        endTransform: Cesium.Matrix4.IDENTITY
    };

    if (false) {
        // Load the NYC buildings tileset
        var tileset = new Cesium.Cesium3DTileset({
            url: Cesium.IonResource.fromAssetId(5741)
        });
        viewer.scene.primitives.add(tileset);
    }
    
    var geojsonsToLoad = ['/geojson/sofia.geojson'];
   
    if (true)
        geojsonsToLoad = ["/geojson_sample/18507_12078.json",
                          "/geojson_sample/18508_12078.json"];

    geojsonsToLoad = ["/geojson_sample/18507_12078.json"];

    Cesium.GeoJsonDataSource.clampToGround = true;

    terrain.readyPromise.then(function(t) {
        console.log("TERRAIN LOADED");

        for (var i = 0; i < geojsonsToLoad.length; ++i) {
            Cesium.GeoJsonDataSource.load(absoluteUrl(geojsonsToLoad[i])).then(function(dataSource) {
                var p = dataSource.entities.values;
                for (var i = 0; i < p.length; i++) {
                    p[i].polygon.extrudedHeight = p[i].properties["height"];
                }
                viewer.dataSources.add(dataSource);
                viewer.zoomTo(dataSource);
            });
        }
    });

    // HTML overlay for showing feature name on mouseover
    var nameOverlay = document.createElement('div');
    viewer.container.appendChild(nameOverlay);
    nameOverlay.className = 'backdrop';
    nameOverlay.style.display = 'none';
    nameOverlay.style.position = 'absolute';
    nameOverlay.style.bottom = '0';
    nameOverlay.style.left = '0';
    nameOverlay.style['pointer-events'] = 'none';
    nameOverlay.style.padding = '4px';
    nameOverlay.style.backgroundColor = 'black';

    // Information about the currently selected feature
    var selected = {
        feature: undefined,
        originalColor: new Cesium.Color()
    };

    // An entity object which will hold info about the currently selected feature for infobox display
    var selectedEntity = new Cesium.Entity();

    // Get default left click handler for when a feature is not picked on left click
    var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
    // If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
    if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
        // Silhouette a feature blue on hover.
        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
            // If a feature was previously highlighted, undo the highlight

            if (false) {
            // Pick a new feature
            var pickedFeature = viewer.scene.pick(movement.endPosition);
            if (!Cesium.defined(pickedFeature)) {
                nameOverlay.style.display = 'none';
                return;
            }

            var ray = viewer.camera.getPickRay(movement.endPosition);
            var position = viewer.scene.globe.pick(ray, viewer.scene);
            console.log("MOUSE", position);

            // A feature was picked, so show it's overlay content
            nameOverlay.style.display = 'block';
            nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
            nameOverlay.style.left = movement.endPosition.x + 'px';
            var name = pickedFeature.getProperty('name');
            if (!Cesium.defined(name)) {
                name = pickedFeature.getProperty('id');
            }
            nameOverlay.textContent = name;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Silhouette a feature on selection and show metadata in the InfoBox.
        viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
            // Pick a new feature
            var pickedFeature = viewer.scene.pick(movement.position);
            if (!Cesium.defined(pickedFeature)) {
                clickHandler(movement);
                return;
            }

            // Set feature infobox description
            var featureName = pickedFeature.getProperty('name');
            selectedEntity.name = featureName;
            selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
            viewer.selectedEntity = selectedEntity;
            selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
                '<tr><th>BIN</th><td>' + pickedFeature.getProperty('BIN') + '</td></tr>' +
                '<tr><th>DOITT ID</th><td>' + pickedFeature.getProperty('DOITT_ID') + '</td></tr>' +
                '<tr><th>SOURCE ID</th><td>' + pickedFeature.getProperty('SOURCE_ID') + '</td></tr>' +
                '</tbody></table>';
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    var scene = viewer.scene;
    var camera = scene.camera;
    scene.debugShowFramesPerSecond = true;

    function addPrimitive(lon, deltaLon, lat, height) {
        var center = Cesium.Cartesian3.fromDegrees(lon + deltaLon, lat, 10000);
        var pointLightCamera = new Cesium.Camera(scene);
        pointLightCamera.position = center;
        var target = new Cesium.Cartesian3(1333658.289206456, -4654575.173536042, 4137766.8335933625);
        var altTarget = new Cesium.Cartesian3.fromDegrees(lon, lat, 0);
        console.log("TARGET", target);
        console.log("ALT TARGET", altTarget);
        camera.lookAt(center, target);
        console.log("CAMERA CENTER", center);
        // camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        var shadowMap = new Cesium.ShadowMap({
            context: scene.context,
            lightCamera: pointLightCamera,
            isPointLight: true,
            softShadows: false
        });
        shadowMap.enabled = true;
        shadowMap.maximumDistance = 100000;

        return shadowMap;
    }

    if (false) {
        var shadowMap1 = addPrimitive(longitude, +0.0005, latitude, height);
        var shadowMap2 = addPrimitive(longitude, -0.0005, latitude, height);
        shadowMap1.debugShow = false;
        shadowMap2.debugShow = false;
        scene.shadowMap = shadowMap1;

        // TODO : workaround until Cesium supports multiple light sources
        var CustomPrimitive = function(shadowMap) {
            this.shadowMap = shadowMap;
        };
        CustomPrimitive.prototype.update = function(frameState) {
            frameState.shadowMaps.push(this.shadowMap);
        };
        scene.primitives.add(new CustomPrimitive(shadowMap2));
    }

    viewer.scene.camera.setView(initialView);
}
