# Redis Caching & Performance Architecture (Phase 11)

## 1. Multi-Tier Cache Topology
To maintain sub-50ms dashboard query response times, Phase 11 leverages Redis multi-tier caching:

```
  React Frontend App ──> Redis L1 In-Memory Cache (TTL: 5m) ──> PostgreSQL Core Database
                             └─> ML Model Inference Cache (TTL: 1h)
```

---

## 2. Cache Key Conventions & Invalidation Rules

- **Global KPIs**: Key `analytics:global:kpis`, TTL = 300 seconds.
- **Domain Metrics**: Key `analytics:domain:{domainName}`, TTL = 600 seconds.
- **AI Prediction Inferences**: Key `ai:predictions:{targetId}`, TTL = 3600 seconds.

### Invalidation Triggers
Cache keys are automatically invalidated upon:
- New fee payment transactions (invalidates `analytics:domain:finance`).
- Marks moderation entry lock (invalidates `analytics:domain:student` & `exam`).
