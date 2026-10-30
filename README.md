# SpendWise AI 💸

A polished personal finance dashboard built with vanilla HTML, CSS, and JavaScript. Track income and expenses, visualize cash flow, set category budgets, and export or import your own data.

> **Privacy-first demo:** all transactions are stored in your browser's `localStorage`. No account, server, or external API is required. The starter data is fictional and can be replaced.

## Features

- Responsive finance dashboard with a premium sidebar layout
- Income and expense transactions with category, date, payment method, and notes
- Cash-flow chart and category spending breakdown
- Monthly category budgets with progress and overspend states
- Savings-rate calculation and income/expense summaries
- Light/dark theme
- JSON export and backup import
- Data persists locally in the browser
- Keyboard shortcut: `Ctrl` / `⌘` + `K` opens the transaction form
- Mobile-friendly navigation and accessible dialog labels

## Run locally

No build tools required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser, or use the **Live Server** extension in VS Code.
3. Add a transaction or edit the starter data inside the app.

## Publish on GitHub Pages

1. Create a public GitHub repository named `spendwise-ai`.
2. Upload `index.html`, `style.css`, `app.js`, and this README.
3. Open **Settings → Pages** in the repository.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

## Project structure

```text
SpendWise-AI/
├── index.html
├── style.css
├── app.js
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/
        └── validate.yml
```

## Data and security notes

- This is a frontend portfolio project, not a regulated financial product.
- Do not enter banking passwords, card numbers, or other sensitive credentials.
- Clearing browser storage removes locally saved transactions. Export a JSON backup before switching browsers or devices.
- Imported JSON is validated for the expected top-level transaction and budget arrays, but this demo is not designed for untrusted or multi-user data.

## Roadmap

- [ ] Search, filter, and edit individual transactions
- [ ] Recurring transactions and bill reminders
- [ ] Multi-currency support
- [ ] Optional backend with authentication and database
- [ ] Unit tests and end-to-end tests
- [ ] CSV export

## License

MIT. See [LICENSE](LICENSE).
