# RAREB1RD storefront

A Vistaprint / Signs.com-style web-to-print store for RAREB1RD. Customers pick a product, choose size, material, options and quantity with **instant pricing**, then **upload their own artwork**, **design online** or **hire a designer**, and submit the order for a proof.

This is a standalone Next.js app, separate from the CRM in the repo root.

## Run locally

```bash
cd rareb1rd
npm install
npm run dev        # http://localhost:3000
```

With no env vars set, uploads go to `public/uploads/` and orders are written to `.data/orders/*.json`. Both folders are gitignored.

## Deploy (Vercel)

Create a new Vercel project from this repo with **Root Directory = `rareb1rd`**, then set:

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | **Required in production.** Add a Vercel Blob store. Artwork uploads go straight from the browser to Blob, so large print files (up to 500 MB) work. |
| `RESEND_API_KEY` + `ORDER_EMAIL_TO` | Emails each order to the shop (comma-separate multiple inboxes). Optional `ORDER_EMAIL_FROM` once a domain is verified in Resend. |
| `ORDER_WEBHOOK_URL` | Optional. POSTs the order JSON to Zapier, Make, Slack, a CRM, etc. |

At least one of email or webhook must be configured in production, otherwise checkout returns an error rather than losing orders.

## Where to edit things

- `lib/site.ts`: business name, phone, hours, locations, equipment, social links, **email (currently blank)**
- `lib/products.ts`: catalog, categories, options and **pricing (placeholder numbers; set real prices before launch)**
- `public/logo.svg`, `public/logo-light.svg`, `app/icon.svg`: **placeholder wordmark; replace with the official logo files**
- `app/globals.css`: brand colors (`--color-brand`, etc.)
- `components/ProductArt.tsx`: gradient placeholders; swap for real product photos

## How orders work

No card is charged online. An order or quote request goes to the shop with the customer's info, options and artwork links. The team checks the files, sends a proof with the final price, and collects payment after the customer approves. Prices shown on the site are estimates. Stripe checkout can be added later if you want to take payment up front.
