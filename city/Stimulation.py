import folium
import json
import math
import random
import time   # ✅ added
import os 

# -------------------------------
# Function: distance
# -------------------------------
def distance(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

# -------------------------------
# 🔄 LOOP FOR DYNAMIC SIMULATION
# -------------------------------
while True:

    # Load file
    with open("static\city\kakinada_roads.json") as f:
        data = json.load(f)

    # Create map
    m = folium.Map(location=[16.96, 82.23], zoom_start=14)

    roads = []
    junctions = []

    # -------------------------------
    # Extract features
    # -------------------------------
    for feature in data["features"]:
        geom = feature["geometry"]

        if geom["type"] == "LineString":
            coords = geom["coordinates"]

            # FIX: convert lon,lat → lat,lon
            latlon = [[pt[1], pt[0]] for pt in coords]

            roads.append({
                "coords": latlon
            })

        elif geom["type"] == "Point":
            lon, lat = geom["coordinates"]
            junctions.append([lat, lon])

    # -------------------------------
    # Draw base roads (gray)
    # -------------------------------
    for road in roads:
        folium.PolyLine(
            locations=road["coords"],
            color="gray",
            weight=3,
            opacity=0.4
        ).add_to(m)

    # -------------------------------
    # Traffic simulation
    # -------------------------------
    for junction in junctions:

        nearby_roads = []

        for road in roads:
            for pt in road["coords"]:
                if distance(junction, pt) < 0.001:
                    nearby_roads.append(road)
                    break

        # remove duplicates
        nearby_roads = list(set([id(r) for r in nearby_roads]))
        nearby_roads = [r for r in roads if id(r) in nearby_roads]

        if len(nearby_roads) == 0:
            continue

        # RANDOM GREEN SIGNAL
        green_index = random.randint(0, len(nearby_roads) - 1)

        for i, road in enumerate(nearby_roads):

            if i == green_index:
                color = "green"
                status = "🟢 GO"
            else:
                color = "red"
                status = "🔴 STOP"

            folium.PolyLine(
                locations=road["coords"],
                color=color,
                weight=6,
                opacity=0.9,
                popup=status
            ).add_to(m)

    # -------------------------------
    # Draw signals (FIX: always visible)
    # -------------------------------
    for junction in junctions:
        folium.CircleMarker(
            location=junction,
            radius=8,
            color="black",
            fill=True,
            fill_color="blue",
            fill_opacity=1,
            popup="🚦 Traffic Signal"
        ).add_to(m)
# -------------------------------
# Add AUTO REFRESH (FIXED POSITION)
# -------------------------------
    refresh_script = f"""
    <script>
    setTimeout(function(){{
        window.location.reload(1);
    }}, {20000});
    </script>
    """

    m.get_root().html.add_child(folium.Element(refresh_script))

# -------------------------------
# Save map
# -------------------------------
    os.makedirs("city/templates", exist_ok=True)
    m.save("city/templates/traffic_dynamic.html")

    print("🔄 Traffic Updated... Auto-refresh enabled")

# wait 20 seconds
    time.sleep(20)
    
            ## -------------------------------
# Draw signals with ICONS
# -------------------------------
    for junction in junctions:

    # Random signal state
        signal_state = random.choice(["green", "red"])

        if signal_state == "green":
            icon_color = "green"
            icon_name = "ok-sign"
            popup = "🟢 GO"
        else:
            icon_color = "red"
            icon_name = "remove-sign"
            popup = "🔴 STOP"

        folium.Marker(
            location=junction,
            popup=popup,
            icon=folium.Icon(
                color=icon_color,
                icon=icon_name,
                prefix='glyphicon'
            )
        ).add_to(m)