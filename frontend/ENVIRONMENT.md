## Debug Configuration

| Variable            | Description                                  | Required | Default |
| ------------------- | -------------------------------------------- | -------- | ------- |
| `DEBUG`             | Enable debug logging with namespace patterns | No       | -       |
| `NEXT_PUBLIC_DEBUG` | Enable client-side debug logging             | No       | false   |

### Debug Configuration Examples

```bash
# Server-side debugging

# Enable all debug logs
DEBUG=mod:*

# Enable only API and database logs
DEBUG=mod:api,mod:db

# Client-side debugging (use with caution in production)
NEXT_PUBLIC_DEBUG=true

```

## Seller / Marketplace

| Variable                  | Description                                                                                                   | Required | Default |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `NEXT_PUBLIC_MOCK_SELLER` | Serve fixture data for the seller onboarding + dashboard (products/orders/payouts) instead of calling the API | No       | off     |

The seller UI targets the marketplace backend (branch `features/marketplace`):
`GET /merch/mine`, `GET /payout/mine`, `GET /sellers/mine`, `POST /sellers`
(seller_profiles; the router exists but is not yet mounted, `/sellers` is the
assumed mount, see `SELLER_PROFILE_PATH` in `services/api/sellerApi.ts`), and
the existing `POST /media/upload` for KYC documents. Until that backend is merged
and migrated, set `NEXT_PUBLIC_MOCK_SELLER=true` to render the flows against
local fixtures. Leave it unset in production. The seam lives in
`services/mocks/seller.fixtures.ts` and every mock branch is marked
`TODO(marketplace)`.

```bash
# Run the seller UI against fixtures (local dev)
NEXT_PUBLIC_MOCK_SELLER=true
```
