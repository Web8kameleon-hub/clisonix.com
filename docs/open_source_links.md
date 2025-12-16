# Open Source API Platform Links (Curated)

This document lists free/open-source projects and tools to build a powerful API Producer/Manager platform. Use these to connect and expose APIs for ALBA, ALBI, JONA, ASI, and more.

## Categories

-API frameworks
-API gateways
-Authentication & Identity
-API management
-Low-code automation
-Observability & monitoring
-Data APIs

## API Frameworks

-FastAPI — https: //fastapi.tiangolo.com/

-Express.js — https: //expressjs.com/
-Flask — https: //flask.palletsprojects.com/
-NestJS — https: //nestjs.com/

## API Gateways

-Kong (OSS) — https: //konghq.com/kong/
-Apache APISIX — https: //apisix.apache.org/
-Tyk (Community) — https: //tyk.io/open-source/
-KrakenD — https: //www.krakend.io/

## Authentication & Identity

- Keycloak — https: //www.keycloak.org/
- Ory (Hydra/ Kratos) — https: //www.ory.sh/
- Authelia — https: //www.authelia.com/

## API Management

- Gravitee — https: //www.gravitee.io/
- WSO2 API Manager — https: //wso2.com/api-management/

## Low-code / Automation

- n8n — https: //n8n.io/
- Node-RED — https: //nodered.org/

## Observability & Monitoring

- Prometheus — https: //prometheus.io/
- Grafana — https: //grafana.com/
- Jaeger — https: //www.jaegertracing.io/
- OpenTelemetry — https: //opentelemetry.io/

## Data APIs / GraphQL

- Hasura — https: //hasura.io/
- PostgREST — https: //postgrest.org/
- Apollo Server — https: //www.apollographql.com/

## DevOps / CI-CD

- GitHub Actions — https: //github.com/features/actions
- GitLab CI — https: //docs.gitlab.com/ee/ci/
- Drone CI — https: //drone.io/

## Useful Integrations

- Redis — https: //redis.io/
- PostgreSQL — https: //www.postgresql.org/
- NATS — https: //nats.io/ (lightweight messaging)
- RabbitMQ — https: //www.rabbitmq.com/

## How to use

1. Choose a lightweight API framework for your `API Producer` (e.g., FastAPI or Flask).
2. Use an API gateway (Kong/Apache APISIX) for routing, rate-limiting, and policies.
3. Use Keycloak or Ory for auth and multi-tenancy.
4. Deploy Hasura/PostgREST for instant data APIs if using Postgres.
5. Orchestrate automation with n8n/Node-RED to create connectors that link your producer to ALBA/ALBI/JONA/ASI.
6. Use Prometheus/Grafana and Jaeger/OpenTelemetry for monitoring and tracing.

This doc will be kept as the single source of truth for open-source components that we can plug into the SaaS API platform
