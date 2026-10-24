# Packlink PRO integration — POP

## What this branch changes

- Adds a server-only Packlink PRO API client in `src/app/actions/packlink.ts`.
- Retrieves live rates for the destination postal code and the configured default parcel.
- Adds the cheapest returned service to the checkout total only when the discounted product subtotal is below €40. From €40, the customer shipping charge is €0.
- Saves the selected service, quote, customer shipping amount, and free-shipping decision in the order document.
- On verified successful HiLow or NOWPayments payment webhooks, attempts to create a Packlink shipment draft and save its reference/status to the same order.
- Shows Packlink status, reference, and any available label/tracking links on the admin order detail page.
- Removes the old hard-coded €6.95 shipping display from cart components.

## Required server configuration

Never expose the API key to browser code or commit its value to GitHub.

1. Create/copy the API key in Packlink PRO → Configuración → Packlink PRO clave de API.
2. Add a Secret Manager secret named `PACKLINK_API_KEY` and grant the Firebase App Hosting runtime service account access to it. The branch's `apphosting.yaml` references that secret.
3. Configure these server environment variables in App Hosting:
   - `PACKLINK_FROM_POSTAL_CODE`: the warehouse/dispatch postal code.
   - `PACKLINK_SOURCE`: the source value required for this Packlink PRO account/integration.
   - `PACKLINK_FROM_NAME`, `PACKLINK_FROM_STREET`, `PACKLINK_FROM_CITY`, `PACKLINK_FROM_PHONE`, `PACKLINK_FROM_EMAIL`: sender address/contact.
   - Optional `PACKLINK_FROM_STATE`, `PACKLINK_PLATFORM`, and parcel defaults.
4. Confirm package defaults (`1 kg`, `30 × 20 × 15 cm`) match the actual packaged products. These defaults are only a starting point; adjust them to avoid inaccurate rates.

## Important label limitation

The Packlink eCommerce API flow used here creates a **shipment draft** (`POST /v1/shipments`) and then checks for available labels (`GET /v1/shipments/{reference}/labels`). A draft is not proof that a carrier label has been purchased/issued. If Packlink returns no label until the shipment is booked/paid for in its portal, the order will be saved with `packlink.status = draft_created_label_pending`; automatic label purchase cannot be claimed as complete until Packlink confirms that the account/API exposes a supported purchase/label-creation operation.

## Before production deployment

- Add the missing sender details and secret in App Hosting.
- Run a build/typecheck and test the quote endpoint with a real Packlink account and a test destination.
- Test both sides of the €40 rule and confirm the shipping quote matches Packlink's portal.
- Run a low-value test payment through each active gateway and confirm exactly one draft is created.
- Verify whether the API returns a label immediately; do not treat a draft reference as a shipping label.
