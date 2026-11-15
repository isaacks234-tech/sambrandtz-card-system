# SAMBRANDTZ DIGITAL CARD SYSTEM

Cloudflare Pages + Pages Functions + D1 starter application.

## Cloudflare Pages build settings
- Framework preset: None
- Build command: leave blank
- Build output directory: `public`
- Root directory: leave blank

## 1. Create a D1 database
In Cloudflare Dashboard:
1. Workers & Pages → D1 SQL Database → Create database.
2. Name it `sambrandtz-cards`.
3. Open its Console and run the contents of `schema.sql` (from this project).

## 2. Bind D1 to Pages
Open the Pages project → Settings → Functions → D1 database bindings:
- Variable name: `DB`
- Select database: `sambrandtz-cards`
Save and redeploy.

## 3. Add the one-time setup secret
Pages project → Settings → Variables and Secrets:
- Add a secret named `SETUP_SECRET`.
- Use a long, unique value. Do not share it or put it in GitHub.
Save and redeploy.

## 4. Upload these files to GitHub
Upload the contents of this folder to the root of:
`isaacks234-tech/sambrandtz-card-system`
Keep the `functions`, `public`, and `schema.sql` paths as shown.

Cloudflare should automatically build from the `main` branch. Set the build output directory to `public`.

## 5. First admin setup
Open the deployed site. Choose "First-time setup", enter the `SETUP_SECRET`, an admin email and a strong password. The setup secret is only used once, while no admin exists.
After setup, sign in using the admin email/password.

## Important
- This starter stores cards in D1, so cards are available across devices.
- Never commit passwords, setup secrets, or API tokens to GitHub.
- Customer card links look like `https://YOUR-SITE.pages.dev/?card=customer-slug`.
- QR images are generated from the public card URL using QR Server's image endpoint; an internet connection is needed to display the QR.
- This is a starter MVP. Before handling sensitive customer data at scale, add backups, stronger operational monitoring, and a custom QR generation service if desired.
