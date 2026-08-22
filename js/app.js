(function () {
  "use strict";

  var STATUS_LABELS = {
    OPEN: { text: "Open", cls: "badge--open" },
    CONSTRUCTION: { text: "Under construction", cls: "badge--construction" },
    PERMIT: { text: "Planned", cls: "badge--permit" },
    CLOSED_PERM: { text: "Closed", cls: "badge--closed" },
    CLOSED_TEMP: { text: "Temporarily closed", cls: "badge--closed" },
    CLOSED: { text: "Closed", cls: "badge--closed" }
  };

  var DEFAULT_HINT = "Type a name, city, state, or country to search. Click a result to jump to it on the map.";

  var map, clusterGroup;
  var allChargers = [];
  var markerById = new Map();
  var onlyReviewed = true;
  var query = "";
  var debounceTimer = null;

  var els = {
    search: document.getElementById("search"),
    onlyReviewed: document.getElementById("only-reviewed"),
    resultsHint: document.getElementById("results-hint"),
    resultsHintText: document.getElementById("results-hint-text"),
    resultsCount: document.getElementById("results-count"),
    resultsList: document.getElementById("results-list"),
    statTotal: document.getElementById("stat-total"),
    statReviewed: document.getElementById("stat-reviewed"),
    statCountries: document.getElementById("stat-countries"),
    dataUpdated: document.getElementById("data-updated"),
    year: document.getElementById("year")
  };

  els.year.textContent = new Date().getFullYear();

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pinIcon(reviewed) {
    return L.divIcon({
      className: "",
      html: '<span class="pin ' + (reviewed ? "pin--reviewed" : "pin--plain") + '"></span>',
      iconSize: reviewed ? [14, 14] : [11, 11],
      iconAnchor: reviewed ? [7, 7] : [5.5, 5.5],
      popupAnchor: [0, -6]
    });
  }

  function popupHtml(c) {
    var statusInfo = STATUS_LABELS[c.status] || { text: c.status || "Unknown", cls: "" };
    var addrParts = [c.street, c.city, c.state, c.zip, c.country].filter(Boolean);
    var html = '<div class="popup">';
    html += "<h3>" + escapeHtml(c.name || "Supercharger") + "</h3>";
    if (addrParts.length) html += '<p class="addr">' + escapeHtml(addrParts.join(", ")) + "</p>";
    html += '<div class="meta-row">';
    html += '<span class="badge ' + statusInfo.cls + '">' + escapeHtml(statusInfo.text) + "</span>";
    if (c.stalls) html += "<span>" + c.stalls + " stalls</span>";
    if (c.avg != null) html += '<span class="rating">★ ' + c.avg.toFixed(1) + "/10</span>";
    html += "</div>";

    if (c.reviews && c.reviews.length) {
      html += '<ul class="reviews">';
      c.reviews.slice(0, 6).forEach(function (r) {
        var label = "▶ Watch review" + (r.rating != null ? " (" + r.rating + "/10)" : "");
        html += '<li><a href="' + escapeHtml(r.link) + '" target="_blank" rel="noopener">' + label + "</a></li>";
      });
      if (c.reviews.length > 6) {
        html += '<li class="no-reviews">+' + (c.reviews.length - 6) + " more review(s)</li>";
      }
      html += "</ul>";
    } else {
      html += '<p class="no-reviews">No review video yet — be the first!</p>';
    }
    html += "</div>";
    return html;
  }

  function initMap() {
    map = L.map("map", { worldCopyJump: true }).setView([25, 10], 2);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }
    ).addTo(map);

    clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({
          html: "<div>" + count + "</div>",
          className: "marker-cluster-custom",
          iconSize: L.point(40, 40)
        });
      }
    });
    map.addLayer(clusterGroup);
  }

  function buildMarkers() {
    markerById.clear();
    allChargers.forEach(function (c) {
      var reviewed = !!(c.reviews && c.reviews.length);
      var marker = L.marker([c.lat, c.lng], { icon: pinIcon(reviewed) });
      marker.bindPopup(popupHtml(c), { maxWidth: 280 });
      markerById.set(c.id, marker);
    });
  }

  function matches(c) {
    if (onlyReviewed && !(c.reviews && c.reviews.length)) return false;
    if (!query) return true;
    return c.searchText.indexOf(query) !== -1;
  }

  function renderResultsList(filtered) {
    if (!query) {
      els.resultsHint.hidden = false;
      els.resultsList.hidden = true;
      els.resultsList.innerHTML = "";
      els.resultsCount.textContent = filtered.length.toLocaleString() + " Superchargers on the map";
      els.resultsHintText.textContent = DEFAULT_HINT;
      return;
    }

    if (filtered.length === 0) {
      els.resultsHint.hidden = false;
      els.resultsList.hidden = true;
      els.resultsList.innerHTML = "";
      els.resultsCount.textContent = "No matches for “" + els.search.value.trim() + "”";
      els.resultsHintText.textContent = onlyReviewed
        ? "Try turning off “Only show reviewed locations” to search all Superchargers."
        : "Try a different name, city, state, or country.";
      return;
    }

    els.resultsHint.hidden = true;
    els.resultsList.hidden = false;
    els.resultsCount.textContent = filtered.length.toLocaleString() + (filtered.length === 1 ? " result" : " results");

    var CAP = 200;
    var shown = filtered.slice(0, CAP);
    var html = shown
      .map(function (c) {
        var reviewed = !!(c.reviews && c.reviews.length);
        var loc = [c.city, c.state, c.country].filter(Boolean).join(", ");
        var ratingTxt = c.avg != null ? " · ★ " + c.avg.toFixed(1) : "";
        return (
          '<li><button type="button" class="result-row" data-id="' +
          c.id +
          '"><span class="result-row__title"><span class="pin ' +
          (reviewed ? "pin--reviewed" : "pin--plain") +
          '" aria-hidden="true"></span>' +
          escapeHtml(c.name || "Supercharger") +
          "</span>" +
          '<span class="result-row__meta">' +
          escapeHtml(loc) +
          ratingTxt +
          "</span></button></li>"
        );
      })
      .join("");

    if (filtered.length > CAP) {
      html += '<li class="result-row__more">+' + (filtered.length - CAP) + " more — refine your search</li>";
    }

    els.resultsList.innerHTML = html;
  }

  function applyFilter() {
    if (!clusterGroup) return; // map never loaded (initial data fetch failed)
    var filtered = allChargers.filter(matches);

    clusterGroup.clearLayers();
    var markers = filtered.map(function (c) {
      return markerById.get(c.id);
    });
    clusterGroup.addLayers(markers);

    renderResultsList(filtered);
  }

  function flyToCharger(id) {
    var charger = allChargers.find(function (c) {
      return c.id === id;
    });
    if (!charger) return;

    // Jump straight there (no animation) and open a standalone popup at the
    // charger's own coordinates, instead of routing through the clustered
    // marker. Two unreliable approaches were tried and rejected here, both
    // confirmed by direct testing rather than just suspected:
    // zoomToShowLayer's "reveal from its cluster, then call back" callback
    // can simply never fire, and even a plain animated setView's 'moveend'
    // reliably fails to fire for a same-zoom pan (only a zoom change seems
    // to reliably trigger it). An instant, unanimated setView needs no
    // completion event at all, so it can't get stuck waiting on one.
    map.setView([charger.lat, charger.lng], 14, { animate: false });
    L.popup({ maxWidth: 280 })
      .setLatLng([charger.lat, charger.lng])
      .setContent(popupHtml(charger))
      .openOn(map);
  }

  function onSearchInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      query = els.search.value.trim().toLowerCase();
      applyFilter();
    }, 120);
  }

  function wireEvents() {
    els.search.addEventListener("input", onSearchInput);
    els.onlyReviewed.addEventListener("change", function () {
      onlyReviewed = els.onlyReviewed.checked;
      applyFilter();
    });
    els.resultsList.addEventListener("click", function (e) {
      var btn = e.target.closest(".result-row[data-id]");
      if (!btn) return;
      flyToCharger(Number(btn.dataset.id));
    });
  }

  function renderStats() {
    var total = allChargers.length;
    var reviewed = allChargers.filter(function (c) {
      return c.reviews && c.reviews.length;
    }).length;
    var countries = new Set(allChargers.map(function (c) { return c.country; }).filter(Boolean));

    els.statTotal.textContent = total.toLocaleString();
    els.statReviewed.textContent = reviewed.toLocaleString();
    els.statCountries.textContent = countries.size;
  }

  fetch("data/superchargers.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (payload) {
      allChargers = payload.chargers.map(function (c) {
        c.searchText = [c.name, c.city, c.state, c.country].filter(Boolean).join(" ").toLowerCase();
        return c;
      });

      if (payload.generatedAt) {
        var d = new Date(payload.generatedAt);
        els.dataUpdated.textContent = "Data last synced " + d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      }

      renderStats();
      initMap();
      buildMarkers();
      applyFilter();
    })
    .catch(function (err) {
      els.resultsCount.textContent = "Couldn't load Supercharger data.";
      console.error(err);
    })
    .then(wireEvents); // always wire up controls, even if the map/data never loaded
})();
