# BD AD POST PRO — v2
Professional Bangladesh business marketplace starter.

Includes:
- Marketplace homepage
- Category browsing
- District/search filtering
- Featured listings
- Business profile pages
- Email registration/login + verification through Supabase
- User dashboard
- Admin approval/rejection
- Admin featured toggle
- bKash/Nagad payment database foundation
- Responsive mobile UI

## Setup
1. Create a Supabase project.
2. Run `supabase.sql` in SQL Editor.
3. Authentication > Email: enable Confirm email.
4. Create/keep public storage bucket `ad-images` (SQL attempts to create it).
5. Put Supabase URL + anon key in `js/config.js`.
6. Add GitHub Pages URL under Supabase Authentication URL Configuration.
7. Register your account, then run:
   update public.profiles set role='admin' where email='YOUR_EMAIL';
8. Upload to GitHub Pages.

### Payments
The database includes bKash/Nagad payment records, but real automatic payment collection requires a merchant/gateway integration and server-side verification. Do NOT put merchant secrets in frontend JavaScript.

## Premium payments (v3)
- `premium.html` provides Starter/Popular/Pro packages.
- Users select an approved listing, choose bKash/Nagad, enter a transaction ID, and create a `pending` payment record.
- Admin can inspect payment records.
- `supabase/functions/payment-webhook/index.ts` is a secure server-side starting point for real gateway verification.

### Important production requirement
Real automatic bKash/Nagad collection cannot safely be implemented with only GitHub Pages frontend code. You need merchant/gateway credentials and a server-side callback/verification layer. The included Edge Function deliberately does not pretend to complete a real payment without those credentials.

Official provider entry points:
- bKash merchant/gateway onboarding and documentation are required before production credentials can be used.
- Nagad provides merchant onboarding through its official site.

## Manual bKash (v4)
Payment number: **01743051456**
Users send the package amount using bKash Send Money, enter the Transaction ID, and submit it for admin verification.
The system checks for duplicate Transaction IDs before creating a pending payment record.

## Admin Control Center (v5)
- View business owner name/email/phone
- Review listing image/details
- Approve/reject listings
- Feature/unfeature live listings
- Disable a live listing
- Review pending bKash payments
- Verify/reject payments
- On payment verification, automatically set Featured + promotion expiry (7/15/30 days)
- Prevents users from directly marking their own payment as paid via RLS

Flat root build: all required CSS/JS/admin files are in repository root.
