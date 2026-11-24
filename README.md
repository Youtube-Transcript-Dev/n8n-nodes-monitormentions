# n8n-nodes-monitormentions

n8n community node for [Monitor Mentions](https://www.monitormentions.com): brand catalogue, hype, history, and rankings.

## Installation

Settings → Community Nodes → Install → `n8n-nodes-monitormentions`

## Credentials

API key from https://www.monitormentions.com/dashboard/api (`mm_live_…`). Sent as `Authorization: Bearer`. Credential test hits `GET /api/v1/me`.

## Operations

- **Get Credits** — balance (`/me`)
- **List Brands** — `/brands`
- **Get Brand** — `/brands/{slug}`
- **Get Brand Hype** — `/brands/{slug}/hype`
- **Get Brand History** — `/brands/{slug}/history`
- **Get Rankings** — `/rankings`

## Resources

- [API docs](https://www.monitormentions.com/docs/api)
