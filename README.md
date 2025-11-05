# MailGenie

AI-powered email assistant for Chrome. Turn a short intent or rough draft into a polished, human-sounding email in English or Bangla (বাংলা) using Google Gemini.

## Highlights

- ✨ One‑click email generation from intent or draft
- 🌍 English and Bangla support, with smart Bangla/Banglish detection
- 🧠 Context-aware replies from existing threads (Gmail, Outlook, Yahoo)
- 📝 Tone and length controls (professional, casual, formal, friendly, concise)
- � Auto‑fill subject and body directly into the compose window
- 🕘 Quick suggestions and local history for recent generations
- 🔒 Privacy‑first: API key stored locally in Chrome storage

## Demo (manual install)

1. Open Chrome and go to `chrome://extensions/`
2. Enable Developer mode (top-right)
3. Click Load unpacked and select this folder
4. On first install, the setup page opens; paste your Gemini API 

## Screenshots


## Getting a Gemini API key

1. Go to Google AI Studio: https://makersuite.google.com/app/apikey
2. Sign in and create an API key (free tier available)
3. Copy the key and save it in MailGenie (Welcome screen or Popup → Settings)

## How it works

MailGenie adds two ways to generate emails:

1. Floating button inside your mailbox (labelled “✨ Lamp”)

   - Open Compose on Gmail/Outlook/Yahoo
   - Click the floating button → write a short intent or paste a draft
   - Pick tone and length → Generate → MailGenie fills Subject and Body

2. Browser action popup
   - Click the extension icon → write intent or paste a draft
   - Generate → Insert into Email to auto‑fill the current compose window

Tips:

- If you’re replying, MailGenie reads recent thread context to craft a relevant response
- Bangla/Banglish is detected automatically; you can also force Bangla in the popup

## Permissions explained

- activeTab, tabs: detect current email tab and enable the action icon only on supported sites
- scripting: inject small helpers to fill compose fields you already have open
- storage: save your API key and short local history on your device
- host_permissions: `https://generativelanguage.googleapis.com/*` to call Gemini 2.5 Flash

## Supported sites

- Gmail (`mail.google.com`)
- Outlook / Live (`*.outlook.com`, `*.live.com`)
- Yahoo Mail (`mail.yahoo.com`)
- Generic editors with standard subject/body fields may also work

## Project structure

```
assets/
	css/          # Styles for popup and welcome screens
	icons/        # Extension icons
js/
	background.js # Lifecycle and onboarding (opens Welcome on first install)
	content.js    # Floating button, modal UI, context detection, auto‑fill
	popup.js      # Popup UI, generate/insert, settings
	welcome.js    # Welcome screen setup flow
manifest.json   # MV3 manifest
popup.html      # Popup UI
welcome.html    # Welcome/setup page
```

## Development

- There’s no build step. Edit files and refresh the extension page to reload.
- While testing, keep DevTools open on the target page for console logs.
- To reload after changes: `chrome://extensions` → Reload → refresh your mail tab.

## Troubleshooting

- Extension icon is disabled: it only enables on supported mail sites (Gmail/Outlook/Yahoo).
- “API key not configured”: open the popup → Settings and add your Gemini key.
- “Could not find compose fields”: ensure a compose window is open, then try again.
- Network/API errors: verify your key is valid and that `generativelanguage.googleapis.com` isn’t blocked.
- After updating the extension: refresh the email tab if you see “Extension context invalidated”.

## Privacy

- Your API key and small history are stored locally via chrome.storage
- No tracking or external analytics are included in this project
- Emails are generated via your direct call to Google’s Generative Language API

## Tech stack

- Chrome Extension Manifest V3
- Vanilla JavaScript + DOM APIs
- Google Gemini 2.5 Flash (generateContent)

## License

This project is released under the MIT License. See `LICENSE` for details.

—

Made with care for fast, natural, and respectful emails.
