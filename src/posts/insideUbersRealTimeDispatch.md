---
title: "Inside Uber's Real-Time Dispatch"
date: "2026-01-20"
draft: false
summary: "Unpacking how Uber matches riders and drivers in seconds using geospatial indexing and real-time event streaming."
tags:
  topics: ["geospatial","real-time systems","matching algorithms"]
  technologies: ["H3","Kafka","Go"]
  companies: ["Uber"]
source:
  label: "Uber Engineering - Dispatch Systems"
  url: "https://www.uber.com/blog/h3/"
---

# Inside Uber's Real-Time Dispatchs

## TL;DR

When you tap request, Uber turns your GPS into a hexagon, finds nearby drivers with a spatial index (H3), and streams the decision through Kafka in under a second.

## Key Concepts

- **H3:** Uber's open-source hexagonal hierarchical geospatial index. The world is tiled with hexagons at 16 resolutions — perfect for "find nearby" queries.
- **Event Streaming:** Everything is an event on Kafka — rider request, driver location update, ETA change. Consumers react in real time.
- **Matching Problem:** It's a bipartite matching problem under constraints: ETA, driver preferences, surge, cancellations.

## How It Works

1.  **Index The World:** Both riders and drivers are snapped to an H3 cell (e.g., resolution 9 ≈ 0.1 km²). To find drivers near you, Uber just looks up your hexagon and its 6 neighbors — a fast in-memory lookup instead of a slow geo-radius database query.

2.  **Stream Locations:** Driver apps push GPS every 4 seconds to Kafka. A stateful service materializes the latest location per driver into a geospatial store.

3.  **Dispatch Loop:** On request:
    ```go
    // pseudo-code
    cell := h3.LatLngToCell(request.lat, request.lng, 9)
    neighbors := h3.GridDisk(cell, 1) // self + 6 neighbors
    candidates := geoStore.GetDriversInCells(neighbors)
    best := rankByETAAndScore(candidates, request)
    dispatch(best)
    ```

4.  Ranking considers ETA, pickup direction, driver rating, and marketplace balance to avoid starving one area.

## Why It Matters

Hexagons beat squares — all neighbors are equidistant, so ETA estimation is cleaner. And Kafka makes the system fault-tolerant: if dispatch crashes, it replays the event log. This architecture is what lets Uber do 30M+ trips a day with p95 matching under 2 seconds.

## Further Reading

- [H3 Hexagonal Index](https://h3geo.org/)
- [Uber Engineering Blog](https://eng.uber.com/)
