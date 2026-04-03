// // ===============================
// // 1. Initialize Map
// // ===============================

// var map = L.map('map').setView([16.96, 82.23], 14);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
// }).addTo(map);

// // ===============================
// // 2. Storage Variables
// // ===============================

// let signalReferences = [];
// let detectedJunctions = [];
// let usedJunctions = new Set();

// // ===============================
// // 3. Load Signal Reference Points
// // ===============================

// fetch('/static/city/kakinada.geojson')
//   .then((res) => res.json())
//   .then((data) => {
//     data.features.forEach((feature) => {
//       if (feature.geometry.type === 'Point') {
//         signalReferences.push([
//           feature.geometry.coordinates[1], // lat
//           feature.geometry.coordinates[0], // lon
//         ]);
//       }
//     });
//   });

// // ===============================
// // 4. Fetch Roads from Overpass
// // ===============================

// const query = `
// [out:json][timeout:25];
// (
//   way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](16.94,82.21,16.98,82.26);
// );
// (._;>;);
// out body;
// `;

// // fetch('https://overpass-api.de/api/interpreter', {
// //   method: 'POST',
// //   body: query,
// // })
// //   .then((res) => res.json())
// //   .then((data) => processOSM(data));

// // ===============================
// // 5. Process OSM Data
// // ===============================

// fetch('/static/city/kakinada_roads.json')
//   .then((res) => res.json())
//   .then((data) => processOSM(data));

// function processOSM(data) {
//   let nodes = {};
//   let ways = [];

//   data.elements.forEach((el) => {
//     if (el.type === 'node') {
//       nodes[el.id] = [el.lat, el.lon];
//     }

//     if (el.type === 'way') {
//       let type = el.tags?.highway;

//       // only keep major roads
//       if (
//         ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(type)
//       ) {
//         ways.push({
//           nodes: el.nodes,
//           type: type,
//         });
//       }
//     }
//   });

//   drawRoads(nodes, ways);
// }

// // ===============================
// // 6. Draw Roads + Detect Junctions
// // ===============================

// function drawRoads(nodes, ways) {
//   let junctionCount = {};

//   ways.forEach((way) => {
//     let coords = way.nodes
//       .map((id) => nodes[id])
//       .filter((c) => c !== undefined);

//     L.polyline(coords, {
//       color: 'blue',
//       weight: 3,
//     }).addTo(map);

//     // count node usage
//     way.nodes.forEach((nodeID) => {
//       if (!junctionCount[nodeID]) junctionCount[nodeID] = 0;

//       junctionCount[nodeID]++;
//     });
//   });

//   detectJunctions(nodes, ways);
// }

// // ===============================
// // 7. Detect Real Intersections
// // ===============================
// function detectJunctions(nodes, ways) {
//   let junctionMap = {};

//   ways.forEach((way) => {
//     way.nodes.forEach((nodeID, index) => {
//       if (!junctionMap[nodeID]) {
//         junctionMap[nodeID] = [];
//       }

//       let prev = way.nodes[index - 1];
//       let next = way.nodes[index + 1];

//       let center = nodes[nodeID];

//       if (prev && nodes[prev]) {
//         let angle = getAngle(center, nodes[prev]);
//         junctionMap[nodeID].push(angle);
//       }

//       if (next && nodes[next]) {
//         let angle = getAngle(center, nodes[next]);
//         junctionMap[nodeID].push(angle);
//       }
//     });
//   });

//   Object.keys(junctionMap).forEach((nodeID) => {
//     let angles = junctionMap[nodeID];

//     let unique = mergeSimilarAngles(angles);

//     if (unique.length >= 3) {
//       detectedJunctions.push({
//         coord: nodes[nodeID],
//         roads: unique.length,
//       });
//     }
//   });

//   matchSignals();
// }

// function getAngle(a, b) {
//   let dx = b[1] - a[1];
//   let dy = b[0] - a[0];

//   return (Math.atan2(dy, dx) * 180) / Math.PI;
// }

// function mergeSimilarAngles(angles) {
//   let unique = [];

//   angles.forEach((angle) => {
//     let found = unique.some((a) => Math.abs(a - angle) < 25);

//     if (!found) {
//       unique.push(angle);
//     }
//   });

//   return unique;
// }
// // ===============================
// // 8. Match Reference Points to
// //    Real Junctions
// // ===============================

// function matchSignals() {
//   signalReferences.forEach((ref) => {
//     let nearest = null;
//     let minDist = Infinity;

//     detectedJunctions.forEach((j) => {
//       let d = map.distance(ref, j.coord);

//       if (d < minDist) {
//         minDist = d;
//         nearest = j;
//       }
//     });

//     if (nearest) {
//       let key = nearest.coord.join(',');

//       if (!usedJunctions.has(key)) {
//         usedJunctions.add(key);
//         placeSignal(nearest.coord, nearest.roads);
//       }
//     }
//   });
// }

// // ===============================
// // 9. Place Traffic Signal
// // ===============================
// let signals = [];

// function placeSignal(coord, roadCount) {
//   let marker = L.marker(coord).addTo(map).bindPopup('Traffic Signal');

//   let poles = createPoles(coord, roadCount);

//   signals.push({
//     coord: coord,
//     poles: poles,
//     roadCount: roadCount,
//     phase: 0,
//   });
// }
// // ===============================
// // 10. Create Signal Poles
// // ===============================

// function createPoles(center, roadCount) {
//   roadCount = Math.min(roadCount, 4);

//   let poles = [];

//   let offset = 0.00012;

//   for (let i = 0; i < roadCount; i++) {
//     let angle = ((360 / roadCount) * i * Math.PI) / 180;

//     let lat = center[0] + offset * Math.cos(angle);
//     let lng = center[1] + offset * Math.sin(angle);

//     let pole = L.circleMarker([lat, lng], {
//       radius: 7,
//       color: 'red',
//       fillColor: 'red',
//       fillOpacity: 1,
//     }).addTo(map);

//     poles.push(pole);
//   }

//   return poles;
// }

// function updateSignals() {
//   signals.forEach((signal) => {
//     let poles = signal.poles;
//     let count = signal.roadCount;

//     if (count === 4) {
//       // 4-road junction
//       signal.phase = (signal.phase + 1) % 4;

//       poles.forEach((pole, i) => {
//         if (signal.phase === 0) {
//           if (i === 0) pole.setStyle({ color: 'green', fillColor: 'green' });
//           else pole.setStyle({ color: 'red', fillColor: 'red' });
//         }

//         if (signal.phase === 1) {
//           if (i === 1) pole.setStyle({ color: 'green', fillColor: 'green' });
//           else pole.setStyle({ color: 'red', fillColor: 'red' });
//         }
//         if (signal.phase === 2) {
//           if (i === 2) pole.setStyle({ color: 'green', fillColor: 'green' });
//           else pole.setStyle({ color: 'red', fillColor: 'red' });
//         }
//         if (signal.phase === 3) {
//           if (i === 3) pole.setStyle({ color: 'green', fillColor: 'green' });
//           else pole.setStyle({ color: 'red', fillColor: 'red' });
//         }
//       });
//     } else if (count === 3) {
//       // T junction
//       signal.phase = (signal.phase + 1) % 3;

//       poles.forEach((pole, i) => {
//         if (i === signal.phase)
//           pole.setStyle({ color: 'green', fillColor: 'green' });
//         else pole.setStyle({ color: 'red', fillColor: 'red' });
//       });
//     }
//   });
// }

// setInterval(updateSignals, 5000);

// // ═══════════════════════════════════════════
// //  city.js  –  Traffic Simulation + Road Graph
// // ═══════════════════════════════════════════
// \
// // ── 1. Map ──────────────────────────────────
// var map = L.map('map').setView([16.96, 82.23], 14);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

// // ── 2. Globals ───────────────────────────────
// var signalReferences = [];
// var detectedJunctions = [];
// var usedJunctions = new Set();
// var signals = [];
// var roadLayers = [];

// // Graph
// var roadGraph = {}; // nodeId -> [ { to, distM, timeSec, edgeMidLat, edgeMidLng } ]
// var roadNodes = {}; // nodeId -> [lat, lng]
// var roadWays = [];

// var _geojsonDone = false;
// var _roadsDone = false;

// var SPEED_KMH = {
//   motorway: 80,
//   trunk: 60,
//   primary: 50,
//   secondary: 40,
//   tertiary: 30,
// };

// // ── 3. Fetch both files in parallel ─────────
// fetch(geojsonUrl)
//   .then((r) => r.json())
//   .then((data) => {
//     data.features.forEach((f) => {
//       if (f.geometry.type === 'Point')
//         signalReferences.push([
//           f.geometry.coordinates[1],
//           f.geometry.coordinates[0],
//         ]);
//     });
//     _geojsonDone = true;
//     _tryStart();
//   });

// fetch('/static/city/kakinada_roads.json')
//   .then((r) => r.json())
//   .then((data) => {
//     data.elements.forEach((el) => {
//       if (el.type === 'node') roadNodes[el.id] = [el.lat, el.lon];
//       if (el.type === 'way') {
//         var type = el.tags && el.tags.highway;
//         if (
//           ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(
//             type,
//           )
//         )
//           roadWays.push({ nodes: el.nodes, type: type });
//       }
//     });
//     _roadsDone = true;
//     _tryStart();
//   });

// function _tryStart() {
//   if (!_geojsonDone || !_roadsDone) return;
//   buildGraph();
//   drawRoads();
// }

// // ── 4. Haversine distance (metres) ──────────
// function haversine(a, b) {
//   var R = 6371000;
//   var lat1 = (a[0] * Math.PI) / 180,
//     lat2 = (b[0] * Math.PI) / 180;
//   var dLat = ((b[0] - a[0]) * Math.PI) / 180;
//   var dLon = ((b[1] - a[1]) * Math.PI) / 180;
//   var x =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
// }

// // ── 5. Build road graph ──────────────────────
// function buildGraph() {
//   roadWays.forEach(function (way) {
//     var spd = SPEED_KMH[way.type] || 30;
//     for (var i = 0; i < way.nodes.length - 1; i++) {
//       var idA = way.nodes[i];
//       var idB = way.nodes[i + 1];
//       var nA = roadNodes[idA];
//       var nB = roadNodes[idB];
//       if (!nA || !nB) continue;

//       var distM = haversine(nA, nB);
//       var timeSec = (distM / 1000 / spd) * 3600;
//       var midLat = (nA[0] + nB[0]) / 2;
//       var midLng = (nA[1] + nB[1]) / 2;

//       if (!roadGraph[idA]) roadGraph[idA] = [];
//       if (!roadGraph[idB]) roadGraph[idB] = [];

//       roadGraph[idA].push({
//         to: idB,
//         distM: distM,
//         timeSec: timeSec,
//         coordA: nA,
//         coordB: nB,
//         midLat: midLat,
//         midLng: midLng,
//       });
//       roadGraph[idB].push({
//         to: idA,
//         distM: distM,
//         timeSec: timeSec,
//         coordA: nB,
//         coordB: nA,
//         midLat: midLat,
//         midLng: midLng,
//       });
//     }
//   });
// }

// // ── 6. Live traffic multiplier for an edge ──
// function getLiveMultiplier(midLat, midLng) {
//   var best = null,
//     bestD = Infinity;
//   for (var i = 0; i < roadLayers.length; i++) {
//     var road = roadLayers[i];
//     var mid = road.coords[Math.floor(road.coords.length / 2)];
//     var d = Math.abs(mid[0] - midLat) + Math.abs(mid[1] - midLng);
//     if (d < bestD) {
//       bestD = d;
//       best = road;
//     }
//   }
//   if (!best) return 1;
//   if (best.blocked) return 4.0;
//   return [1.0, 1.8, 3.0][best.trafficLevel];
// }

// // ── 7. Dijkstra ──────────────────────────────
// // Returns { nodeIds: [...], totalDistM, totalTimeSec }  or null
// function dijkstra(startId, endId, mode) {
//   var cost = {};
//   var prev = {};
//   var visited = {};

//   Object.keys(roadGraph).forEach(function (n) {
//     cost[n] = Infinity;
//   });
//   cost[startId] = 0;

//   // Simple priority queue using sorted array
//   var queue = [{ id: startId, c: 0 }];

//   while (queue.length > 0) {
//     queue.sort(function (a, b) {
//       return a.c - b.c;
//     });
//     var cur = queue.shift();
//     var u = cur.id;

//     if (visited[u]) continue;
//     visited[u] = true;
//     if (u == endId) break;

//     var edges = roadGraph[u] || [];
//     for (var i = 0; i < edges.length; i++) {
//       var e = edges[i];
//       if (visited[e.to]) continue;

//       var mult = getLiveMultiplier(e.midLat, e.midLng);
//       var w;
//       if (mode === 'distance') w = e.distM;
//       else if (mode === 'time') w = e.timeSec;
//       else w = e.timeSec * mult; // traffic-aware

//       var nc = cost[u] + w;
//       if (nc < (cost[e.to] || Infinity)) {
//         cost[e.to] = nc;
//         prev[e.to] = { from: u, edge: e };
//         queue.push({ id: e.to, c: nc });
//       }
//     }
//   }

//   if (!prev[endId] && startId != endId) return null;

//   // Reconstruct ordered node list and collect edges
//   var nodeIds = [];
//   var edges = [];
//   var cur = endId;
//   while (cur && cur != startId) {
//     nodeIds.unshift(cur);
//     if (prev[cur]) {
//       edges.unshift(prev[cur].edge);
//       cur = prev[cur].from;
//     } else break;
//   }
//   nodeIds.unshift(startId);

//   // Build a flat [lat,lng] coordinate array for drawing
//   var coords = [];
//   if (edges.length > 0) {
//     coords.push(edges[0].coordA);
//     edges.forEach(function (e) {
//       coords.push(e.coordB);
//     });
//   } else if (roadNodes[startId] && roadNodes[endId]) {
//     coords = [roadNodes[startId], roadNodes[endId]];
//   }

//   // Compute totals directly from edges (no re-hashing)
//   var totalDistM = 0;
//   var totalTimeSec = 0;
//   edges.forEach(function (e) {
//     totalDistM += e.distM;
//     totalTimeSec += e.timeSec;
//   });

//   return {
//     coords: coords,
//     edges: edges,
//     totalDistM: totalDistM,
//     totalTimeSec: totalTimeSec,
//   };
// }

// // ── 8. Nearest graph node to [lat,lng] ──────
// function nearestNode(latLng) {
//   var best = null,
//     bestD = Infinity;
//   var ids = Object.keys(roadNodes);
//   for (var i = 0; i < ids.length; i++) {
//     var n = roadNodes[ids[i]];
//     var d = Math.abs(n[0] - latLng[0]) + Math.abs(n[1] - latLng[1]);
//     if (d < bestD) {
//       bestD = d;
//       best = ids[i];
//     }
//   }
//   return best;
// }

// // ── 9. Public entry point called by dashboard ─
// function findRoutes(startLatLng, endLatLng) {
//   return new Promise(function (resolve, reject) {
//     var sNode = nearestNode(startLatLng);
//     var eNode = nearestNode(endLatLng);
//     if (!sNode || !eNode) {
//       reject(new Error('Could not snap locations to road network.'));
//       return;
//     }

//     var rDist = dijkstra(sNode, eNode, 'distance');
//     var rTime = dijkstra(sNode, eNode, 'time');
//     var rTraffic = dijkstra(sNode, eNode, 'traffic');

//     if (!rDist && !rTime && !rTraffic) {
//       reject(new Error('No route found between these two locations.'));
//       return;
//     }

//     function buildInfo(r, avgSpeedKmh) {
//       if (!r) return null;
//       var distKm = r.totalDistM / 1000;
//       var estMinutes = Math.round(r.totalTimeSec / 60);

//       // Count congested edges
//       var redCount = r.edges.filter(function (e) {
//         return getLiveMultiplier(e.midLat, e.midLng) >= 3;
//       }).length;
//       var trafficScore =
//         r.edges.length > 0
//           ? Math.round((1 - redCount / r.edges.length) * 100)
//           : 100;

//       return {
//         coords: r.coords,
//         distKm: distKm.toFixed(2),
//         estMinutes: estMinutes,
//         trafficScore: trafficScore,
//       };
//     }

//     resolve({
//       shortest: buildInfo(rDist, 40),
//       fastest: buildInfo(rTime, 50),
//       traffic: buildInfo(rTraffic, 35),
//     });
//   });
// }

// // ── 10. Color/label helpers ──────────────────
// function trafficColor(level) {
//   return ['#27ae60', '#f39c12', '#e74c3c'][level];
// }
// function trafficLabel(level) {
//   return ['🟢 Free Flow', '🟡 Moderate Traffic', '🔴 Heavy Traffic'][level];
// }

// // ── 11. Draw Roads ───────────────────────────
// function drawRoads() {
//   roadWays.forEach(function (way) {
//     var coords = way.nodes
//       .map(function (id) {
//         return roadNodes[id];
//       })
//       .filter(Boolean);
//     if (coords.length < 2) return;
//     var level = Math.floor(Math.random() * 3);
//     var poly = L.polyline(coords, {
//       color: trafficColor(level),
//       weight: 5,
//       opacity: 0.85,
//     }).addTo(map);
//     poly.bindPopup(trafficLabel(level));
//     roadLayers.push({
//       polyline: poly,
//       coords: coords,
//       trafficLevel: level,
//       nearSignalIdx: -1,
//       blocked: false,
//     });
//   });
//   detectJunctions();
// }

// // ── 12. Junctions ────────────────────────────
// function detectJunctions() {
//   var jMap = {};
//   roadWays.forEach(function (way) {
//     way.nodes.forEach(function (nodeID, i) {
//       if (!jMap[nodeID]) jMap[nodeID] = [];
//       var prev = way.nodes[i - 1],
//         next = way.nodes[i + 1],
//         c = roadNodes[nodeID];
//       if (!c) return;
//       if (prev && roadNodes[prev])
//         jMap[nodeID].push(getAngle(c, roadNodes[prev]));
//       if (next && roadNodes[next])
//         jMap[nodeID].push(getAngle(c, roadNodes[next]));
//     });
//   });
//   Object.keys(jMap).forEach(function (id) {
//     var u = mergeSimilarAngles(jMap[id]);
//     if (u.length >= 3 && roadNodes[id])
//       detectedJunctions.push({ coord: roadNodes[id], roads: u.length });
//   });
//   matchSignals();
// }

// function getAngle(a, b) {
//   return (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
// }
// function mergeSimilarAngles(angles) {
//   var u = [];
//   angles.forEach(function (a) {
//     if (
//       !u.some(function (x) {
//         return Math.abs(x - a) < 25;
//       })
//     )
//       u.push(a);
//   });
//   return u;
// }

// // ── 13. Signals ──────────────────────────────
// function matchSignals() {
//   signalReferences.forEach(function (ref) {
//     var nearest = null,
//       minD = Infinity;
//     detectedJunctions.forEach(function (j) {
//       var d = map.distance(ref, j.coord);
//       if (d < minD) {
//         minD = d;
//         nearest = j;
//       }
//     });
//     if (nearest) {
//       var key = nearest.coord.join(',');
//       if (!usedJunctions.has(key)) {
//         usedJunctions.add(key);
//         placeSignal(nearest.coord, nearest.roads);
//       }
//     }
//   });
//   linkRoadsToSignals();
// }

// function placeSignal(coord, roadCount) {
//   L.marker(coord).addTo(map).bindPopup('🚦 Traffic Signal');
//   var count = Math.min(roadCount, 4),
//     poles = [],
//     offset = 0.00012;
//   for (var i = 0; i < count; i++) {
//     var angle = ((360 / count) * i * Math.PI) / 180;
//     var pole = L.circleMarker(
//       [
//         coord[0] + offset * Math.cos(angle),
//         coord[1] + offset * Math.sin(angle),
//       ],
//       { radius: 7, color: 'red', fillColor: 'red', fillOpacity: 1 },
//     ).addTo(map);
//     poles.push(pole);
//   }
//   signals.push({
//     coord: coord,
//     poles: poles,
//     roadCount: count,
//     phase: Math.floor(Math.random() * count),
//     greenPhase: 0,
//   });
// }

// var SIGNAL_RADIUS = 150;

// function linkRoadsToSignals() {
//   roadLayers.forEach(function (road) {
//     var mid = road.coords[Math.floor(road.coords.length / 2)];
//     var minD = Infinity,
//       nearIdx = -1;
//     signals.forEach(function (sig, idx) {
//       var d = map.distance(mid, sig.coord);
//       if (d < minD) {
//         minD = d;
//         nearIdx = idx;
//       }
//     });
//     if (minD <= SIGNAL_RADIUS) road.nearSignalIdx = nearIdx;
//   });
//   updateAll();
//   setInterval(updateAll, 5000);
//   setInterval(driftTraffic, 9000);
// }

// // ── 14. Update signals + road colours ────────
// function updateAll() {
//   signals.forEach(function (sig) {
//     sig.phase = (sig.phase + 1) % sig.roadCount;
//     sig.greenPhase = sig.phase;
//     sig.poles.forEach(function (pole, i) {
//       var g = i === sig.greenPhase;
//       pole.setStyle({
//         color: g ? 'green' : 'red',
//         fillColor: g ? 'green' : 'red',
//       });
//     });
//   });

//   roadLayers.forEach(function (road, idx) {
//     var color, label;
//     if (road.nearSignalIdx >= 0) {
//       var sig = signals[road.nearSignalIdx];
//       var isGreen = idx % sig.roadCount === sig.greenPhase;
//       road.blocked = !isGreen;
//       color = isGreen ? trafficColor(road.trafficLevel) : '#e74c3c';
//       label = isGreen ? trafficLabel(road.trafficLevel) : '🔴 Signal Red';
//     } else {
//       road.blocked = false;
//       color = trafficColor(road.trafficLevel);
//       label = trafficLabel(road.trafficLevel);
//     }
//     road.polyline.setStyle({ color: color, opacity: 0.85, weight: 5 });
//     road.polyline.setPopupContent(label);
//   });
// }

// function driftTraffic() {
//   roadLayers.forEach(function (road) {
//     if (road.blocked) return;
//     var r = Math.random();
//     if (r < 0.25 && road.trafficLevel > 0) road.trafficLevel--;
//     else if (r > 0.75 && road.trafficLevel < 2) road.trafficLevel++;
//   });
// }

// ═══════════════════════════════════════════════════════
//  city.js  –  Kakinada Traffic Engine
//  Shared by dashboard.html + traffic_police_dashboard.html
//  Cross-tab sync via localStorage
// ═══════════════════════════════════════════════════════

// ── 1. Map ──────────────────────────────────────────────
var map = L.map('map').setView([16.96, 82.23], 14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// ── 2. State ────────────────────────────────────────────
var signalReferences = [];
var detectedJunctions = [];
var usedJunctions = new Set();
var signals = []; // { coord, poles[], roadCount, phase, greenPhase, overrideColor, overrideUntil, id }
var roadLayers = [];
var roadGraph = {};
var roadNodes = {};
var roadWays = [];
var _geojsonDone = false;
var _roadsDone = false;
var SPEED_KMH = {
  motorway: 80,
  trunk: 60,
  primary: 50,
  secondary: 40,
  tertiary: 30,
};

// Sync key (localStorage)
var SYNC_KEY = 'kakinada_traffic_state';

// ── 3. Parallel data fetches ────────────────────────────
fetch(geojsonUrl)
  .then((r) => r.json())
  .then((data) => {
    data.features.forEach((f) => {
      if (f.geometry.type === 'Point')
        signalReferences.push([
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
        ]);
    });
    _geojsonDone = true;
    _tryStart();
  });

fetch('/static/city/kakinada_roads.json')
  .then((r) => r.json())
  .then((data) => {
    data.elements.forEach((el) => {
      if (el.type === 'node') roadNodes[el.id] = [el.lat, el.lon];
      if (el.type === 'way') {
        var t = el.tags && el.tags.highway;
        if (
          ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(t)
        )
          roadWays.push({ nodes: el.nodes, type: t });
      }
    });
    _roadsDone = true;
    _tryStart();
  });

function _tryStart() {
  if (!_geojsonDone || !_roadsDone) return;
  buildGraph();
  drawRoads();
}

// ── 4. Haversine ────────────────────────────────────────
function haversine(a, b) {
  var R = 6371000,
    φ1 = (a[0] * Math.PI) / 180,
    φ2 = (b[0] * Math.PI) / 180,
    dφ = ((b[0] - a[0]) * Math.PI) / 180,
    dλ = ((b[1] - a[1]) * Math.PI) / 180,
    x =
      Math.sin(dφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── 5. Graph ────────────────────────────────────────────
function buildGraph() {
  roadWays.forEach(function (way) {
    var spd = SPEED_KMH[way.type] || 30;
    for (var i = 0; i < way.nodes.length - 1; i++) {
      var idA = way.nodes[i],
        idB = way.nodes[i + 1],
        nA = roadNodes[idA],
        nB = roadNodes[idB];
      if (!nA || !nB) continue;
      var d = haversine(nA, nB),
        t = (d / 1000 / spd) * 3600,
        mLat = (nA[0] + nB[0]) / 2,
        mLng = (nA[1] + nB[1]) / 2;
      if (!roadGraph[idA]) roadGraph[idA] = [];
      if (!roadGraph[idB]) roadGraph[idB] = [];
      roadGraph[idA].push({
        to: idB,
        distM: d,
        timeSec: t,
        coordA: nA,
        coordB: nB,
        midLat: mLat,
        midLng: mLng,
      });
      roadGraph[idB].push({
        to: idA,
        distM: d,
        timeSec: t,
        coordA: nB,
        coordB: nA,
        midLat: mLat,
        midLng: mLng,
      });
    }
  });
}

// ── 6. Traffic multiplier ───────────────────────────────
function getLiveMultiplier(midLat, midLng) {
  var best = null,
    bestD = Infinity;
  roadLayers.forEach(function (r) {
    var m = r.coords[Math.floor(r.coords.length / 2)];
    var d = Math.abs(m[0] - midLat) + Math.abs(m[1] - midLng);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  });
  if (!best) return 1;
  if (best.blocked) return 4;
  return [1, 1.8, 3][best.trafficLevel];
}

// ── 7. Dijkstra ─────────────────────────────────────────
function dijkstra(sId, eId, mode) {
  var cost = {},
    prev = {},
    vis = {};
  Object.keys(roadGraph).forEach((n) => {
    cost[n] = Infinity;
  });
  cost[sId] = 0;
  var q = [{ id: sId, c: 0 }];
  while (q.length) {
    q.sort((a, b) => a.c - b.c);
    var cur = q.shift();
    var u = cur.id;
    if (vis[u]) continue;
    vis[u] = true;
    if (u == eId) break;
    (roadGraph[u] || []).forEach((e) => {
      if (vis[e.to]) return;
      var m = getLiveMultiplier(e.midLat, e.midLng);
      var w =
        mode === 'distance'
          ? e.distM
          : mode === 'time'
            ? e.timeSec
            : e.timeSec * m;
      var nc = cost[u] + w;
      if (nc < (cost[e.to] || Infinity)) {
        cost[e.to] = nc;
        prev[e.to] = { from: u, edge: e };
        q.push({ id: e.to, c: nc });
      }
    });
  }
  if (!prev[eId] && sId != eId) return null;
  var edges = [],
    cur2 = eId;
  while (cur2 && cur2 != sId) {
    if (!prev[cur2]) break;
    edges.unshift(prev[cur2].edge);
    cur2 = prev[cur2].from;
  }
  var coords = [];
  if (edges.length) {
    coords.push(edges[0].coordA);
    edges.forEach((e) => coords.push(e.coordB));
  } else if (roadNodes[sId] && roadNodes[eId])
    coords = [roadNodes[sId], roadNodes[eId]];
  var totD = 0,
    totT = 0;
  edges.forEach((e) => {
    totD += e.distM;
    totT += e.timeSec;
  });
  return { coords, edges, totalDistM: totD, totalTimeSec: totT };
}

function nearestNode(ll) {
  var best = null,
    bestD = Infinity;
  Object.keys(roadNodes).forEach((id) => {
    var n = roadNodes[id],
      d = Math.abs(n[0] - ll[0]) + Math.abs(n[1] - ll[1]);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  });
  return best;
}

function findRoutes(startLL, endLL) {
  return new Promise(function (resolve, reject) {
    var s = nearestNode(startLL),
      e = nearestNode(endLL);
    if (!s || !e) {
      reject(new Error('Cannot snap to road network.'));
      return;
    }
    var rD = dijkstra(s, e, 'distance'),
      rT = dijkstra(s, e, 'time'),
      rR = dijkstra(s, e, 'traffic');
    if (!rD && !rT && !rR) {
      reject(new Error('No route found.'));
      return;
    }
    function info(r) {
      if (!r) return null;
      var red = r.edges.filter(
        (e) => getLiveMultiplier(e.midLat, e.midLng) >= 3,
      ).length;
      return {
        coords: r.coords,
        distKm: (r.totalDistM / 1000).toFixed(2),
        estMinutes: Math.round(r.totalTimeSec / 60),
        trafficScore: r.edges.length
          ? Math.round((1 - red / r.edges.length) * 100)
          : 100,
      };
    }
    resolve({ shortest: info(rD), fastest: info(rT), traffic: info(rR) });
  });
}

// ── 8. Draw roads ───────────────────────────────────────
function trafficColor(l) {
  return ['#27ae60', '#f39c12', '#e74c3c'][l];
}
function trafficLabel(l) {
  return ['🟢 Free Flow', '🟡 Moderate', '🔴 Heavy'][l];
}

function drawRoads() {
  roadWays.forEach(function (way) {
    var coords = way.nodes.map((id) => roadNodes[id]).filter(Boolean);
    if (coords.length < 2) return;
    var level = Math.floor(Math.random() * 3);
    var poly = L.polyline(coords, {
      color: trafficColor(level),
      weight: 5,
      opacity: 0.85,
    }).addTo(map);
    poly.bindPopup(trafficLabel(level));
    roadLayers.push({
      polyline: poly,
      coords,
      trafficLevel: level,
      nearSignalIdx: -1,
      blocked: false,
    });
  });
  detectJunctions();
}

// ── 9. Junction detection ───────────────────────────────
function detectJunctions() {
  var jMap = {};
  roadWays.forEach(function (way) {
    way.nodes.forEach(function (nID, i) {
      if (!jMap[nID]) jMap[nID] = [];
      var p = way.nodes[i - 1],
        nx = way.nodes[i + 1],
        c = roadNodes[nID];
      if (!c) return;
      if (p && roadNodes[p]) jMap[nID].push(ang(c, roadNodes[p]));
      if (nx && roadNodes[nx]) jMap[nID].push(ang(c, roadNodes[nx]));
    });
  });
  Object.keys(jMap).forEach((id) => {
    var u = mergeAngles(jMap[id]);
    if (u.length >= 3 && roadNodes[id])
      detectedJunctions.push({ coord: roadNodes[id], roads: u.length });
  });
  matchSignals();
}
function ang(a, b) {
  return (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
}
function mergeAngles(a) {
  var u = [];
  a.forEach((x) => {
    if (!u.some((y) => Math.abs(y - x) < 25)) u.push(x);
  });
  return u;
}

// ── 10. Signal placement ─────────────────────────────────
function matchSignals() {
  signalReferences.forEach(function (ref) {
    var nearest = null,
      minD = Infinity;
    detectedJunctions.forEach((j) => {
      var d = map.distance(ref, j.coord);
      if (d < minD) {
        minD = d;
        nearest = j;
      }
    });
    if (nearest) {
      var key = nearest.coord.join(',');
      if (!usedJunctions.has(key)) {
        usedJunctions.add(key);
        placeSignal(nearest.coord, nearest.roads);
      }
    }
  });
  linkRoadsToSignals();
}

var _sigId = 0;

function placeSignal(coord, roadCount) {
  var count = Math.min(roadCount, 4),
    poles = [],
    offset = 0.00012;
  var sid = 'sig_' + ++_sigId;

  // Clickable marker for police override
  var marker = L.circleMarker(coord, {
    radius: 10,
    color: '#fff',
    weight: 2,
    fillColor: '#333',
    fillOpacity: 0.85,
  }).addTo(map);
  marker.bindPopup('🚦 Signal #' + _sigId);

  for (var i = 0; i < count; i++) {
    var angle = ((360 / count) * i * Math.PI) / 180;
    var pole = L.circleMarker(
      [
        coord[0] + offset * Math.cos(angle),
        coord[1] + offset * Math.sin(angle),
      ],
      { radius: 7, color: 'red', fillColor: 'red', fillOpacity: 1 },
    ).addTo(map);
    poles.push(pole);
  }

  var sigObj = {
    id: sid,
    coord: coord,
    marker: marker,
    poles: poles,
    roadCount: count,
    phase: Math.floor(Math.random() * count),
    greenPhase: 0,
    overrideColor: null, // 'green'|'red'|null
    overrideUntil: 0, // timestamp ms
    vipCleared: false,
  };
  signals.push(sigObj);

  // Police click handler — exposed via window.onSignalClick
  marker.on('click', function () {
    if (typeof window.onSignalClick === 'function')
      window.onSignalClick(sigObj);
  });
}

var SIGNAL_RADIUS = 150;

function linkRoadsToSignals() {
  roadLayers.forEach(function (road) {
    var mid = road.coords[Math.floor(road.coords.length / 2)];
    var minD = Infinity,
      nearIdx = -1;
    signals.forEach(function (s, i) {
      var d = map.distance(mid, s.coord);
      if (d < minD) {
        minD = d;
        nearIdx = i;
      }
    });
    if (minD <= SIGNAL_RADIUS) road.nearSignalIdx = nearIdx;
  });

  // Load any persisted overrides from other tab
  _applySyncState();

  updateAll();
  setInterval(updateAll, 5000);
  setInterval(driftTraffic, 9000);
  setInterval(_applySyncState, 1000); // poll cross-tab state every 1s
}

// ── 11. Master update ────────────────────────────────────
function updateAll() {
  var now = Date.now();

  signals.forEach(function (sig) {
    // Check override
    var overrideActive = sig.overrideColor && now < sig.overrideUntil;
    var vipActive = sig.vipCleared;

    if (overrideActive || vipActive) {
      var col = vipActive ? 'green' : sig.overrideColor;
      sig.poles.forEach((p) => p.setStyle({ color: col, fillColor: col }));
      sig.greenPhase = col === 'green' ? 0 : -1;
      return; // skip normal phase advance
    }

    // Normal cycle
    sig.overrideColor = null;
    sig.phase = (sig.phase + 1) % sig.roadCount;
    sig.greenPhase = sig.phase;
    sig.poles.forEach(function (p, i) {
      var g = i === sig.greenPhase;
      p.setStyle({
        color: g ? 'green' : 'red',
        fillColor: g ? 'green' : 'red',
      });
    });
  });

  roadLayers.forEach(function (road, idx) {
    var color, label;
    if (road.nearSignalIdx >= 0) {
      var sig = signals[road.nearSignalIdx];
      var overrideActive = sig.overrideColor && now < sig.overrideUntil;
      var isGreen;
      if (sig.vipCleared) isGreen = true;
      else if (overrideActive) isGreen = sig.overrideColor === 'green';
      else isGreen = idx % sig.roadCount === sig.greenPhase;

      road.blocked = !isGreen;
      color = isGreen ? trafficColor(road.trafficLevel) : '#e74c3c';
      label = isGreen ? trafficLabel(road.trafficLevel) : '🔴 Signal Red';
    } else {
      road.blocked = false;
      color = trafficColor(road.trafficLevel);
      label = trafficLabel(road.trafficLevel);
    }
    road.polyline.setStyle({ color, opacity: 0.85, weight: 5 });
    road.polyline.setPopupContent(label);
  });

  // Push state to other tab
  _pushSyncState();
}

function driftTraffic() {
  roadLayers.forEach(function (r) {
    if (r.blocked) return;
    var x = Math.random();
    if (x < 0.25 && r.trafficLevel > 0) r.trafficLevel--;
    else if (x > 0.75 && r.trafficLevel < 2) r.trafficLevel++;
  });
}

// ══════════════════════════════════════════════
//  12. Cross-tab Sync (localStorage)
// ══════════════════════════════════════════════

function _pushSyncState() {
  var state = {
    signals: signals.map(function (s) {
      return {
        id: s.id,
        phase: s.phase,
        greenPhase: s.greenPhase,
        overrideColor: s.overrideColor,
        overrideUntil: s.overrideUntil,
        vipCleared: s.vipCleared,
      };
    }),
    roads: roadLayers.map(function (r) {
      return { trafficLevel: r.trafficLevel, blocked: r.blocked };
    }),
    ts: Date.now(),
  };
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(state));
  } catch (e) {}
}

function _applySyncState() {
  try {
    var raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return;
    var state = JSON.parse(raw);
    if (!state || !state.signals) return;

    // Apply signal overrides from remote tab
    state.signals.forEach(function (ss) {
      var sig = signals.find((s) => s.id === ss.id);
      if (!sig) return;

      // Only apply overrides (manual/vip) — not the automatic phase
      // to avoid fighting loops; phase is driven locally
      if (
        ss.overrideColor !== sig.overrideColor ||
        ss.overrideUntil !== sig.overrideUntil ||
        ss.vipCleared !== sig.vipCleared
      ) {
        sig.overrideColor = ss.overrideColor;
        sig.overrideUntil = ss.overrideUntil;
        sig.vipCleared = ss.vipCleared;
        _repaintSignal(sig);
      }
    });
  } catch (e) {}
}

// Listen for changes written by the other tab
window.addEventListener('storage', function (e) {
  if (e.key === SYNC_KEY) _applySyncState();
});

function _repaintSignal(sig) {
  var now = Date.now();
  var overrideActive = sig.overrideColor && now < sig.overrideUntil;
  if (sig.vipCleared || overrideActive) {
    var col = sig.vipCleared ? 'green' : sig.overrideColor;
    sig.poles.forEach((p) => p.setStyle({ color: col, fillColor: col }));
  }
}

// ══════════════════════════════════════════════
//  13. Police API (called by police dashboard)
// ══════════════════════════════════════════════

// Force a single signal to a colour for `durationMs` milliseconds
function policeOverrideSignal(sigId, color, durationMs) {
  var sig = signals.find((s) => s.id === sigId);
  if (!sig) return;
  sig.overrideColor = color;
  sig.overrideUntil = Date.now() + durationMs;
  sig.vipCleared = false;
  _repaintSignal(sig);
  _pushSyncState();
}

// Clear all signals along a VIP path for `durationMs` milliseconds,
// then restore normal operation.
// `pathCoords` is a [[lat,lng],...] array (the route).
function policeVipClearance(pathCoords, durationMs) {
  // Find every signal within SIGNAL_RADIUS of any coord in the path
  var cleared = [];
  signals.forEach(function (sig) {
    for (var i = 0; i < pathCoords.length; i++) {
      var d = map.distance(sig.coord, pathCoords[i]);
      if (d <= SIGNAL_RADIUS * 2) {
        sig.vipCleared = true;
        sig.overrideColor = null;
        _repaintSignal(sig);
        cleared.push(sig.id);
        break;
      }
    }
  });
  _pushSyncState();

  // Auto-restore after duration
  setTimeout(function () {
    cleared.forEach(function (id) {
      var s = signals.find((x) => x.id === id);
      if (s) {
        s.vipCleared = false;
        _repaintSignal(s);
      }
    });
    _pushSyncState();
  }, durationMs);

  return cleared.length;
}

// Restore a signal to normal auto-cycle
function policeRestoreSignal(sigId) {
  var sig = signals.find((s) => s.id === sigId);
  if (!sig) return;
  sig.overrideColor = null;
  sig.overrideUntil = 0;
  sig.vipCleared = false;
  _pushSyncState();
}
