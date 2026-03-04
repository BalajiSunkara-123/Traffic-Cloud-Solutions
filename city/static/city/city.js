// // 1. Initialize the map
// var map = L.map('map').setView([20.5937, 78.9629], 15);

// // 2. Add tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
// }).addTo(map);

// // 3. Define imaginary junctions
// var junctions = [
//   { id: 'J1', lat: 20.5937, lng: 78.9629 },
//   { id: 'J2', lat: 20.5945, lng: 78.964 },
//   { id: 'J3', lat: 20.5928, lng: 78.9615 },
//   { id: 'J4', lat: 20.5952, lng: 78.9632 },
// ];

// var roads = [
//   { from: 'J1', to: 'J2' },
//   { from: 'J1', to: 'J3' },
//   { from: 'J2', to: 'J4' },
//   { from: 'J3', to: 'J4' },
// ];
// var signalStates = {
//   J1: 'red',
//   J2: 'green',
//   J3: 'yellow',
//   J4: 'red',
// };
// // 4. Add junction markers
// junctions.forEach(function (junction) {
//   L.marker([junction.lat, junction.lng])
//     .addTo(map)
//     .bindPopup('Junction ID: ' + junction.id);
// });

// function getJunctionById(id) {
//   return junctions.find((j) => j.id === id);
// }

// roads.forEach(function (road) {
//   var from = getJunctionById(road.from);
//   var to = getJunctionById(road.to);

//   L.polyline(
//     [
//       [from.lat, from.lng],
//       [to.lat, to.lng],
//     ],
//     {
//       color: 'black',
//       weight: 4,
//     },
//   ).addTo(map);
// });

// function getColor(state) {
//   if (state === 'red') return 'red';
//   if (state === 'green') return 'green';
//   return 'orange';
// }

// var signalMarkers = {};

// junctions.forEach(function (junction) {
//   var marker = L.circleMarker([junction.lat, junction.lng], {
//     radius: 10,
//     color: getColor(signalStates[junction.id]),
//     fillColor: getColor(signalStates[junction.id]),
//     fillOpacity: 1,
//   })
//     .addTo(map)
//     .bindPopup(
//       'Junction ID: ' +
//         junction.id +
//         '<br>Signal: ' +
//         signalStates[junction.id],
//     );

//   signalMarkers[junction.id] = marker;
// });

// function nextState(current) {
//   if (current === 'red') return 'green';
//   if (current === 'green') return 'yellow';
//   return 'red';
// }

// setInterval(function () {
//   for (var id in signalStates) {
//     signalStates[id] = nextState(signalStates[id]);

//     var color = getColor(signalStates[id]);
//     signalMarkers[id].setStyle({
//       color: color,
//       fillColor: color,
//     });
//   }
// }, 3000);
// 1. Initialize map
var map = L.map('map').setView([16.9597, 82.228], 15);

// 2. Add tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// 3. Fetch GeoJSON
fetch(geojsonUrl)
  .then((response) => response.json())
  .then((data) => {
    console.log('GeoJSON loaded:', data);

    let junctions = {};
    let roads = [];

    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        if (feature.geometry.type === 'Point') {
          let id = feature.id || Math.random();

          junctions[id] = {
            id: id,
            latlng: layer.getLatLng(),
            connectedRoads: [],
            signalState: 0,
          };
        }

        if (feature.geometry.type === 'LineString') {
          roads.push(layer);
        }
      },
    }).addTo(map);

    // Detect connections AFTER geojson is added
    roads.forEach((road) => {
      let coords = road.getLatLngs();
      let start = coords[0];
      let end = coords[coords.length - 1];

      for (let id in junctions) {
        let jLatLng = junctions[id].latlng;

        if (start.distanceTo(jLatLng) < 15 || end.distanceTo(jLatLng) < 15) {
          junctions[id].connectedRoads.push(road);
        }
      }
    });

    // Add signals
    let signalMarkers = {};

    for (let id in junctions) {
      let j = junctions[id];

      let marker = L.circleMarker(j.latlng, {
        radius: 8,
        color: 'red',
        fillColor: 'red',
        fillOpacity: 1,
      }).addTo(map);

      signalMarkers[id] = marker;
    }

    // Signal cycle
    function updateSignals() {
      for (let id in junctions) {
        let j = junctions[id];
        let totalRoads = j.connectedRoads.length;

        if (totalRoads >= 4) j.signalState = (j.signalState + 1) % 4;
        else if (totalRoads === 3) j.signalState = (j.signalState + 1) % 3;
        else j.signalState = 0;

        if (j.signalState === 0)
          signalMarkers[id].setStyle({ color: 'green', fillColor: 'green' });
        else signalMarkers[id].setStyle({ color: 'red', fillColor: 'red' });
      }
    }

    setInterval(updateSignals, 4000);
  });
