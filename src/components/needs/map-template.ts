export interface MapMarkerNeed {
  id: string;
  title: string;
  reference_image_url: string | null;
  latitude: number;
  longitude: number;
}

export interface MapCenter {
  latitude: number;
  longitude: number;
}

export function serializeMapNeeds(needs: MapMarkerNeed[]) {
  return JSON.stringify(needs).replace(/</g, '\\u003c');
}

export function buildNeedsMapHtml(center: MapCenter) {
  const centerJson = JSON.stringify([center.latitude, center.longitude]);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #E2E8F0; }
    .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }
    .me {
      width: 16px; height: 16px; border-radius: 50%;
      background: #0F766E; border: 3px solid #FFFFFF;
      animation: me-pulse 2.4s ease-out infinite;
    }
    @keyframes me-pulse {
      0% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.4), 0 1px 4px rgba(15, 23, 42, 0.4); }
      70% { box-shadow: 0 0 0 16px rgba(15, 118, 110, 0), 0 1px 4px rgba(15, 23, 42, 0.4); }
      100% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0), 0 1px 4px rgba(15, 23, 42, 0.4); }
    }
    .need-pin {
      position: relative; width: 46px; height: 46px; border-radius: 50%;
      background: #0F766E; border: 3px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.4);
      display: flex; align-items: center; justify-content: center;
      box-sizing: border-box; cursor: pointer;
    }
    .need-pin-img {
      position: absolute; left: 0; top: 0; width: 100%; height: 100%;
      border-radius: 50%; object-fit: cover;
    }
    .need-pin svg { position: relative; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var CENTER = ${centerJson};
    var PIN_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><circle cx="7" cy="7" r="1.6" fill="#FFFFFF" stroke="none"></circle></svg>';

    var map = L.map('map', { zoomControl: false }).setView(CENTER, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.marker(CENTER, {
      icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
      interactive: false,
      zIndexOffset: 500
    }).addTo(map);

    function escapeAttr(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function iconFor(need) {
      var image = need.reference_image_url
        ? '<img class="need-pin-img" src="' + escapeAttr(need.reference_image_url) + '" alt="' + escapeAttr(need.title) + '" onerror="this.remove()">'
        : '';
      return L.divIcon({
        className: '',
        html: '<div class="need-pin">' + PIN_SVG + image + '</div>',
        iconSize: [46, 46],
        iconAnchor: [23, 23]
      });
    }

    var layer = L.layerGroup().addTo(map);
    var fitted = false;

    function setNeeds(needs) {
      var list = needs || [];
      layer.clearLayers();
      var points = [CENTER];
      list.forEach(function (need) {
        var marker = L.marker([need.latitude, need.longitude], { icon: iconFor(need) });
        marker.on('click', function () {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'need', id: need.id, title: need.title })
            );
          }
        });
        layer.addLayer(marker);
        points.push([need.latitude, need.longitude]);
      });
      if (!fitted) {
        fitted = true;
        map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 14, animate: false });
      }
    }

    window.__setNeeds = setNeeds;
  </script>
</body>
</html>`;
}
