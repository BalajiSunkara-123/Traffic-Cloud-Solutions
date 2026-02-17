// 1. Initialize the map
var map = L.map('map').setView([20.5937, 78.9629], 15);

// 2. Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// 3. Define imaginary junctions
var junctions = [
  { id: 'J1', lat: 20.5937, lng: 78.9629 },
  { id: 'J2', lat: 20.5945, lng: 78.964 },
  { id: 'J3', lat: 20.5928, lng: 78.9615 },
  { id: 'J4', lat: 20.5952, lng: 78.9632 },
];

var roads = [
  { from: 'J1', to: 'J2' },
  { from: 'J1', to: 'J3' },
  { from: 'J2', to: 'J4' },
  { from: 'J3', to: 'J4' },
];
var signalStates = {
  J1: 'red',
  J2: 'green',
  J3: 'yellow',
  J4: 'red',
};
// 4. Add junction markers
junctions.forEach(function (junction) {
  L.marker([junction.lat, junction.lng])
    .addTo(map)
    .bindPopup('Junction ID: ' + junction.id);
});

function getJunctionById(id) {
  return junctions.find((j) => j.id === id);
}

roads.forEach(function (road) {
  var from = getJunctionById(road.from);
  var to = getJunctionById(road.to);

  L.polyline(
    [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    {
      color: 'black',
      weight: 4,
    },
  ).addTo(map);
});

function getColor(state) {
  if (state === 'red') return 'red';
  if (state === 'green') return 'green';
  return 'orange';
}

var signalMarkers = {};

junctions.forEach(function (junction) {
  var marker = L.circleMarker([junction.lat, junction.lng], {
    radius: 10,
    color: getColor(signalStates[junction.id]),
    fillColor: getColor(signalStates[junction.id]),
    fillOpacity: 1,
  })
    .addTo(map)
    .bindPopup(
      'Junction ID: ' +
        junction.id +
        '<br>Signal: ' +
        signalStates[junction.id],
    );

  signalMarkers[junction.id] = marker;
});

function nextState(current) {
  if (current === 'red') return 'green';
  if (current === 'green') return 'yellow';
  return 'red';
}

setInterval(function () {
  for (var id in signalStates) {
    signalStates[id] = nextState(signalStates[id]);

    var color = getColor(signalStates[id]);
    signalMarkers[id].setStyle({
      color: color,
      fillColor: color,
    });
  }
}, 3000);
