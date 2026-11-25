# РЫВОК: Russian A2 → B1 sprint

A phone-friendly study site for an eight-week sprint from A2 toward B1 in Russian, built on the 80/20 (Pareto) principle and styled as a Soviet propaganda poster.

**Open it:** https://furkanork.github.io/russian-bootcamp/ (installable as an app on Android; on iPhone use Safari → Share → Add to Home Screen).

## What to expect
The plan takes about **75 minutes a day for 8 weeks, around 70 hours in total**. It covers the words and grammar that do most of the work. Reaching a full B1 usually takes more practice after week 8; the spaced-repetition reviews and readings keep going after the plan ends.

## What's inside
- **Today** screen: reviews due, new words, this week's tasks and reading, daily norm
- 80/20 coverage chart, measured from real frequency data, showing where you are
- 8-week plan (48 tasks) with ranks from Октябрёнок to Герой труда, and a daily-norm tracker that fills itself in
- Alphabet with pronunciation rules
- 19 grammar tables: cases, pronouns, adjectives, aspect, motion verbs, imperative, который, если/чтобы and more
- 2,048-word frequency list covering about 86% of everyday spoken Russian, with spaced-repetition flashcards in both directions (intervals adapt to how well you know each word) and a daily new-word limit
- Case factory and verb factory drills (conjugation, past tense, aspect, motion verbs, plurals)
- Eight weekly readings with read-aloud and questions, 50 phrases, voice and speed settings
- Speaking timer with self-recording, writing tasks with model answers
- 35-question level check and a short practice exam in the ТРКИ-1 format (much shorter than the real exam, so a rough check only)
- Backup code to move progress between devices

## Data sources
- **Word frequency:** the 50,000 most common word forms in Russian film and TV subtitles (OpenSubtitles 2018, via [FrequencyWords](https://github.com/hermitdave/FrequencyWords), MIT licence), grouped into dictionary words with [pymorphy3](https://github.com/no-plagiarism/pymorphy3). Coverage percentages are of the tokens in that list, so they slightly overstate real coverage. Months, days, seasons and numbers are kept in the list even where films rarely use them.
- **Stress marks and word forms:** checked against the [OpenRussian](https://en.openrussian.org) dictionary data ([github.com/Badestrand/russian-dictionary](https://github.com/Badestrand/russian-dictionary), CC BY-SA); all Russian sentences were also run through LanguageTool.
- A native-speaker review is still recommended: the checks confirm spelling, stress and word forms, not how natural each sentence sounds.

## Files
| Path | What it holds |
|---|---|
| `index.html` | Page markup |
| `css/site.css` | Styles |
| `js/data.js` | Word list, coverage weights and curve, readings, drill data |
| `js/app.js` | All page logic |
| `js/pwa.js`, `sw.js`, `manifest.webmanifest`, `icons/` | Install button, offline support, app icons |
| `tests/` | Automated checks |

Progress is saved in your browser only (use the backup code to move it).

## Running the checks
```bash
npm install
npx playwright install chromium
npm test
```
- `tests/smoke.js` opens the site at phone and desktop widths in light and dark mode, drives every feature and runs an axe-core accessibility audit (WCAG A/AA).
- `tests/check-russian.js` downloads the OpenRussian data once and checks every word-list entry, every stress mark and every drill answer against it.

GitHub Actions runs both on every push (`.github/workflows/test.yml`).
