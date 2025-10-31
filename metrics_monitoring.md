# Performance & Monitoring

## Real-Time Metrics

- CPU usage, memory usage, disk usage, network I/O mblidhen nga `metrics_realtime.py` duke përdorur `psutil`.
- Shembull:

```python
from metrics_realtime import get_realtime_metrics
metrics = get_realtime_metrics()
print(metrics)
```

## API Endpoint për Monitoring

- Shto endpoint në backend për të ekspozuar metrikat:

```python
@app.get("/monitoring/metrics")
def monitoring_metrics():
    from metrics_realtime import get_realtime_metrics
    return get_realtime_metrics()
```

## Usage Tracking

- `usage_tracker.py` monitoron përdorimin e API për çdo API key.
- Metrikat ruhen në Redis ose file lokal.

## Rekomandime për optimizim

- Analizo queries intensive dhe optimizo për shpejtësi.
- Monitoro latency të endpoint-eve kritike.
- Shto alerting për memory/cpu të lartë.

## Tools të rekomanduara

- Prometheus + Grafana për monitoring të avancuar.
- Shto logim të detajuar për çdo request.
