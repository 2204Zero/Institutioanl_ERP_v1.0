# Live GPS Telemetry & Geo-Fencing Architecture

## 1. Real-Time Telemetry Stream
GPS devices transmit 10Hz location updates (`currentLat`, `currentLng`, `speedKmph`). The system calculates Real-Time Estimated Time of Arrival (ETA) to upcoming stops and alerts dispatchers if a vehicle deviates from its pre-approved route bounds (`geoFenceStatus`).
