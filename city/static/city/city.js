// // 1. Initialize map
// var map = L.map('map').setView([16.9597, 82.228], 15);

// // 2. Add tiles
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
// }).addTo(map);

// // 3. Fetch GeoJSON
// fetch(geojsonUrl)
//   .then((response) => response.json())
//   .then((data) => {
//     console.log('GeoJSON loaded:', data);

//     let junctions = {};
//     let roads = [];

//     L.geoJSON(data, {
//       onEachFeature: function (feature, layer) {
//         if (feature.geometry.type === 'Point') {
//           let id = feature.id || Math.random();

//           junctions[id] = {
//             id: id,
//             latlng: layer.getLatLng(),
//             connectedRoads: [],
//             poles: [],
//             signalState: 0,
//           };
//         }

//         if (feature.geometry.type === 'LineString') {
//           roads.push(layer);
//         }
//       },
//     }).addTo(map);

//     // Detect connections AFTER geojson is added
//     roads.forEach((road) => {
//       let coords = road.getLatLngs();

//       for (let id in junctions) {
//         let center = junctions[id].latlng;

//         let closestPoint = null;
//         let minDist = Infinity;

//         coords.forEach((pt) => {
//           let dist = pt.distanceTo(center);

//           if (dist < minDist) {
//             minDist = dist;
//             closestPoint = pt;
//           }
//         });

//         // if road passes near junction
//         if (minDist < 30) {
//           junctions[id].connectedRoads.push({
//             road: road,
//             point: closestPoint,
//           });
//         }
//       }
//     });

//     for (let id in junctions) {
//       let seen = new Set();

//       junctions[id].connectedRoads = junctions[id].connectedRoads.filter(
//         (item) => {
//           if (seen.has(item.road._leaflet_id)) return false;

//           seen.add(item.road._leaflet_id);
//           return true;
//         },
//       );
//     }
//     // Add signals
//     for (let id in junctions) {
//       let junction = junctions[id];
//       let center = junction.latlng;

//       junction.connectedRoads.forEach((item) => {
//         let point = item.point;

//         let dx = point.lng - center.lng;
//         let dy = point.lat - center.lat;

//         let length = Math.sqrt(dx * dx + dy * dy);

//         dx /= length;
//         dy /= length;

//         let offset = 0.00015;

//         let poleLat = center.lat + dy * offset;
//         let poleLng = center.lng + dx * offset;

//         let pole = L.circleMarker([poleLat, poleLng], {
//           radius: 6,
//           color: 'red',
//           fillColor: 'red',
//           fillOpacity: 1,
//         }).addTo(map);

//         junction.poles.push(pole);
//       });
//     }
//     for (let id in junctions) {
//       console.log(
//         'Junction',
//         id,
//         'roads:',
//         junctions[id].connectedRoads.length,
//       );
//     }
//     // Signal cycle
//     function updateSignals() {
//       for (let id in junctions) {
//         let j = junctions[id];

//         if (j.poles.length === 0) continue;

//         j.signalState = (j.signalState + 1) % j.poles.length;

//         j.poles.forEach((pole, index) => {
//           if (index === j.signalState) {
//             pole.setStyle({ color: 'green', fillColor: 'green' });
//           } else {
//             pole.setStyle({ color: 'red', fillColor: 'red' });
//           }
//         });
//       }
//     }

//     setInterval(updateSignals, 4000);
//   });

// ===============================
// 1. Initialize Map
// ===============================

var map = L.map('map').setView([16.96, 82.23], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// ===============================
// 2. Storage Variables
// ===============================

let signalReferences = [];
let detectedJunctions = [];
let usedJunctions = new Set();

// ===============================
// 3. Load Signal Reference Points
// ===============================

fetch('/static/city/kakinada.geojson')
  .then((res) => res.json())
  .then((data) => {
    data.features.forEach((feature) => {
      if (feature.geometry.type === 'Point') {
        signalReferences.push([
          feature.geometry.coordinates[1], // lat
          feature.geometry.coordinates[0], // lon
        ]);
      }
    });
  });

// ===============================
// 4. Fetch Roads from Overpass
// ===============================

const query = `
[out:json][timeout:25];
(
  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](16.94,82.21,16.98,82.26);
);
(._;>;);
out body;
`;

// fetch('https://overpass-api.de/api/interpreter', {
//   method: 'POST',
//   body: query,
// })
//   .then((res) => res.json())
//   .then((data) => processOSM(data));

// ===============================
// 5. Process OSM Data
// ===============================

fetch('/static/city/kakinada_roads.json')
  .then((res) => res.json())
  .then((data) => processOSM(data));

function processOSM(data) {
  let nodes = {};
  let ways = [];

  data.elements.forEach((el) => {
    if (el.type === 'node') {
      nodes[el.id] = [el.lat, el.lon];
    }

    if (el.type === 'way') {
      let type = el.tags?.highway;

      // only keep major roads
      if (
        ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(type)
      ) {
        ways.push({
          nodes: el.nodes,
          type: type,
        });
      }
    }
  });

  drawRoads(nodes, ways);
}

// ===============================
// 6. Draw Roads + Detect Junctions
// ===============================

function drawRoads(nodes, ways) {
  let junctionCount = {};

  ways.forEach((way) => {
    let coords = way.nodes
      .map((id) => nodes[id])
      .filter((c) => c !== undefined);

    L.polyline(coords, {
      color: 'blue',
      weight: 3,
    }).addTo(map);

    // count node usage
    way.nodes.forEach((nodeID) => {
      if (!junctionCount[nodeID]) junctionCount[nodeID] = 0;

      junctionCount[nodeID]++;
    });
  });

  detectJunctions(nodes, ways);
}

// ===============================
// 7. Detect Real Intersections
// ===============================
function detectJunctions(nodes, ways) {
  let junctionMap = {};

  ways.forEach((way) => {
    way.nodes.forEach((nodeID, index) => {
      if (!junctionMap[nodeID]) {
        junctionMap[nodeID] = [];
      }

      let prev = way.nodes[index - 1];
      let next = way.nodes[index + 1];

      let center = nodes[nodeID];

      if (prev && nodes[prev]) {
        let angle = getAngle(center, nodes[prev]);
        junctionMap[nodeID].push(angle);
      }

      if (next && nodes[next]) {
        let angle = getAngle(center, nodes[next]);
        junctionMap[nodeID].push(angle);
      }
    });
  });

  Object.keys(junctionMap).forEach((nodeID) => {
    let angles = junctionMap[nodeID];

    let unique = mergeSimilarAngles(angles);

    if (unique.length >= 3) {
      detectedJunctions.push({
        coord: nodes[nodeID],
        roads: unique.length,
      });
    }
  });

  matchSignals();
}

function getAngle(a, b) {
  let dx = b[1] - a[1];
  let dy = b[0] - a[0];

  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function mergeSimilarAngles(angles) {
  let unique = [];

  angles.forEach((angle) => {
    let found = unique.some((a) => Math.abs(a - angle) < 25);

    if (!found) {
      unique.push(angle);
    }
  });

  return unique;
}
// ===============================
// 8. Match Reference Points to
//    Real Junctions
// ===============================

function matchSignals() {
  signalReferences.forEach((ref) => {
    let nearest = null;
    let minDist = Infinity;

    detectedJunctions.forEach((j) => {
      let d = map.distance(ref, j.coord);

      if (d < minDist) {
        minDist = d;
        nearest = j;
      }
    });

    if (nearest) {
      let key = nearest.coord.join(',');

      if (!usedJunctions.has(key)) {
        usedJunctions.add(key);
        placeSignal(nearest.coord, nearest.roads);
      }
    }
  });
}

// ===============================
// 9. Place Traffic Signal
// ===============================
let signals = [];

function placeSignal(coord, roadCount) {
  let marker = L.marker(coord).addTo(map).bindPopup('Traffic Signal');

  let poles = createPoles(coord, roadCount);

  signals.push({
    coord: coord,
    poles: poles,
    roadCount: roadCount,
    phase: 0,
  });
}
// ===============================
// 10. Create Signal Poles
// ===============================

function createPoles(center, roadCount) {
  roadCount = Math.min(roadCount, 4);

  let poles = [];

  let offset = 0.00012;

  for (let i = 0; i < roadCount; i++) {
    let angle = ((360 / roadCount) * i * Math.PI) / 180;

    let lat = center[0] + offset * Math.cos(angle);
    let lng = center[1] + offset * Math.sin(angle);

    let pole = L.circleMarker([lat, lng], {
      radius: 7,
      color: 'red',
      fillColor: 'red',
      fillOpacity: 1,
    }).addTo(map);

    poles.push(pole);
  }

  return poles;
}

function updateSignals() {
  signals.forEach((signal) => {
    let poles = signal.poles;
    let count = signal.roadCount;

    if (count === 4) {
      // 4-road junction
      signal.phase = (signal.phase + 1) % 4;

      poles.forEach((pole, i) => {
        if (signal.phase === 0) {
          if (i === 0) pole.setStyle({ color: 'green', fillColor: 'green' });
          else pole.setStyle({ color: 'red', fillColor: 'red' });
        }

        if (signal.phase === 1) {
          if (i === 1) pole.setStyle({ color: 'green', fillColor: 'green' });
          else pole.setStyle({ color: 'red', fillColor: 'red' });
        }
        if (signal.phase === 2) {
          if (i === 2) pole.setStyle({ color: 'green', fillColor: 'green' });
          else pole.setStyle({ color: 'red', fillColor: 'red' });
        }
        if (signal.phase === 3) {
          if (i === 3) pole.setStyle({ color: 'green', fillColor: 'green' });
          else pole.setStyle({ color: 'red', fillColor: 'red' });
        }
      });
    } else if (count === 3) {
      // T junction
      signal.phase = (signal.phase + 1) % 3;

      poles.forEach((pole, i) => {
        if (i === signal.phase)
          pole.setStyle({ color: 'green', fillColor: 'green' });
        else pole.setStyle({ color: 'red', fillColor: 'red' });
      });
    }
  });
}

setInterval(updateSignals, 5000);
