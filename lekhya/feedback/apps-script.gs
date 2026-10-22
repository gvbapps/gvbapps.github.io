/**
 * Lekhya website feedback inbox — Google Apps Script web app.
 *
 * Receives the form on gvbapps.github.io/lekhya (index.html / index.hi.html)
 * and emails it to the team group. Deploy steps: README.md next to this file.
 *
 * The visitor's address cannot be the sender (that would be spoofing, and Gmail
 * would refuse it), so the email shows their name as the display name and sets
 * Reply-To to their address: replying goes straight back to them.
 */

var TO = 'lekhya-app@googlegroups.com';
var MAX_PER_HOUR = 20; // ponytail: one shared hourly counter, not per-sender; tighten if abused
var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);

    // Honeypot filled → a bot. Pretend success, send nothing.
    if (d.website) return reply_({ ok: true });

    var name = String(d.name || '').trim().slice(0, 80);
    var email = String(d.email || '').trim().slice(0, 120);
    var message = String(d.message || '').trim().slice(0, 2000);
    var feature = d.type === 'feature';
    var lang = d.lang === 'hi' ? 'hi' : 'en';
    if (!name || !EMAIL_RE.test(email) || !message) return reply_({ ok: false, error: 'invalid' });

    // ponytail: get-then-put can race under concurrent posts; fine at this volume.
    var cache = CacheService.getScriptCache();
    var key = 'sent-' + new Date().toISOString().slice(0, 13); // per clock hour
    var sent = Number(cache.get(key) || 0);
    if (sent >= MAX_PER_HOUR) return reply_({ ok: false, error: 'busy' });
    cache.put(key, String(sent + 1), 3600);

    var subject = feature ? 'Lekhya Feature Request' : 'Lekhya Feedback';
    MailApp.sendEmail({
      to: TO,
      subject: subject,
      name: name,
      replyTo: email,
      body: [
        'Name: ' + name,
        'Email: ' + email,
        'Type: ' + subject,
        'Page language: ' + lang,
        'Received: ' + new Date().toISOString(),
        '',
        message
      ].join('\n')
    });
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: 'server' });
  }
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
