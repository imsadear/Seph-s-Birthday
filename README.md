# Wikapedia

A community dictionary for Philippine languages — built at a hackathon, hopefully something more eventually.

The Philippines has 130+ living languages. Almost none of them exist in any usable form for AI or speech tech. Tagalog and English get everything. Waray, Tausug, Kapampangan, Ilocano, and dozens of others get nothing. We wanted to do something about that.

Wikapedia lets Filipino speakers contribute words, phrases, translations, and voice recordings in their own language. AI does a first-pass quality check, then community reviewers (ideally native speakers) verify entries. Anything that passes becomes open, structured data — the kind developers can actually use to build speech recognition, TTS, translation tools, whatever.

---

## Try it

No install, no server, no build step. Just:

```bash
git clone https://github.com/your-username/wikapedia.git
cd wikapedia
open index.html
```

Double-click `index.html` on Windows. That's it.

---

## What's in the demo

- Search and filter across 6 Philippine languages
- Contribution form — submit a word or phrase and watch the mock AI verification run
- Waray Language Resource Pack (sample data you can download as JSON or CSV)
- API preview for developers
- Fully responsive

The Waray pack is the main demo dataset: ~1,800 words, ~2,400 phrases, 891 voice samples, 2,700+ verified entries contributed by 132 native reviewers. All downloadable straight from the browser.

---

## Languages in the prototype

| Language | Region | Status |
|---|---|---|
| Cebuano | Central Visayas, Mindanao | Developer-ready |
| Ilocano | Northern Luzon | Growing |
| Hiligaynon | Western Visayas | Growing |
| Waray | Eastern Visayas | Needs reviewers |
| Kapampangan | Central Luzon | Needs audio |
| Tausug | Sulu, Mindanao | Needs contributors |

---

## Stack

Vanilla HTML, CSS, and JavaScript. No frameworks, no libraries, no backend. Everything runs in the browser. We kept it this way on purpose — easier to fork, easier to contribute to, and nothing to break.

```
wikapedia/
├── index.html
├── styles.css
├── script.js
└── README.md
```

---

## Data format

```json
{
  "platform": "Wikapedia",
  "language": "Waray",
  "license": "CC BY 4.0",
  "entries": [
    {
      "waray": "Maupay nga aga",
      "english": "Good morning",
      "category": "Greeting",
      "status": "community_verified",
      "audio_available": true
    }
  ]
}
```

---

## A few things we care about

Language data should belong to the communities that made it. Contributors consent to how their data gets used. AI helps with quality checks but native speakers have final say. Dialects and regional variations are documented, not flattened.

---

## License

Code is MIT. Language data is CC BY 4.0.
