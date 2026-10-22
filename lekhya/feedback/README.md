# Website feedback inbox — deploy once

The form on `index.html` / `index.hi.html` posts to `apps-script.gs`, which
emails `lekhya-app@googlegroups.com` with:

- subject **Lekhya Feedback** or **Lekhya Feature Request** (from the dropdown),
- the visitor's **name** as the sender display name,
- the visitor's **email** as Reply-To.

Until the script is deployed, the form opens the visitor's mail app with the
same subject and body (`FEEDBACK_URL` empty in `../app.js`), so the site works
either way.

## Steps (about 5 minutes, needs your Google account)

1. Go to <https://script.google.com> → **New project**. Name it `Lekhya feedback`.
2. Replace `Code.gs` with the contents of `apps-script.gs`. Save.
3. **Deploy → New deployment** → type **Web app**.
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   Authorise when asked (it needs "Send email as you").
4. Copy the **Web app URL** (ends in `/exec`).
5. In `../app.js`, set `var FEEDBACK_URL = '<that URL>';` and commit.
6. In Google Groups → `lekhya-app` → **Group settings → Who can post**: make sure
   the Google account that deployed the script can post (add it as a member, or
   allow anyone on the web). Otherwise the group silently drops the mail.
7. Test: send one **Feedback** and one **Feature request** from the live site.
   Each should arrive with the right subject, shown from the name you typed,
   and replying should go to the email you typed.

## Limits

- Consumer Gmail sends about 100 script emails a day. The script refuses more than
  20 an hour (`MAX_PER_HOUR`); the visitor then gets the "send by email" link.
- A hidden honeypot field drops bot posts without sending.
- Editing the script needs **Deploy → Manage deployments → Edit → New version**,
  or the live URL keeps running the old code.

## Privacy

What the form collects and where it goes is disclosed in `../privacy.html` and
`../privacy.hi.html` (section "Website feedback form"). The app itself still
collects nothing.
