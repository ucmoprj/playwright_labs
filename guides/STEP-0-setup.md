# STEP 0 — Setup and Playwright Basics

**Goal:** At the end of this step, two things work on your computer:

- [ ] Mini Shop runs
- [ ] Playwright tests run

---

## Task 1. Run Mini Shop

```bash
npm install
npx playwright install chromium
npm start
```

Open <http://localhost:3100>. Log in as `alice` / `alice123`, try the shop,
then stop the server with `Ctrl + C`.

---

## Task 2. Learn Playwright basics

```bash
npx playwright test tests/examples/basics.spec.ts
```

Open [tests/examples/basics.spec.ts](../tests/examples/basics.spec.ts).
Uncomment one block at a time (`Ctrl + /`), run the command again, and read the
comments in the block.

| Block | You learn |
|---|---|
| 0.1 | Open a page *(already active)* |
| 0.2 | Find elements: `getByRole`, `getByLabel` |
| 0.3 | Log in: Arrange → Act → Assert |
| 0.4 | Reset data before each test |
| 0.5 | Test the REST API |
| 0.6 | A failing test: read the error and fix it |

✅ All six blocks pass (after you fix 0.6).

📖 More: [Playwright commands](reference/playwright-commands.md)

---

## Submit

1. Screenshot: all blocks in `basics.spec.ts` passing (after fixing 0.6).

Something not working? → [Troubleshooting](reference/troubleshooting.md)
