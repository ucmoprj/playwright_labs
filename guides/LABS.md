# Playwright Syntax Labs (Lab 01 – Lab 12)

Step-by-step practice of Playwright, from your first test to fixtures and
network mocking. No prior Playwright experience is needed. Finish
[STEP 0](STEP-0-setup.md) first so that Mini Shop and Playwright run.

## How to work

1. Open a lab file in `tests/labs/`.
2. Read the comment above a block, then **uncomment that one block**: select
   its lines and press `Ctrl + /` (macOS: `Cmd + /`).
3. Run the file:

   ```bash
   npx playwright test tests/labs/lab01-first-test.spec.ts
   ```

4. Answer the **OBSERVE** questions. Do the **TRY** experiments, then undo them.
5. Move on to the next block. Keep earlier blocks active or comment them again,
   whichever you like (except Labs 10 and 11, where later blocks need earlier ones).

| Marker in a comment | Meaning |
|---|---|
| `OBSERVE:` | Look at the result and answer the question |
| `TRY:` | Change the code a little and see what happens |
| `[EXPECTED: FAIL]` | The block fails **on purpose**. Read the error, then apply the `FIX:` |
| `Your turn` | Write the test yourself. The comment lists what it must check |

`No tests found` means you have not uncommented a block in that file yet.

## Labs

| Lab | File | You learn |
|---|---|---|
| 01 | [lab01-first-test](../tests/labs/lab01-first-test.spec.ts) | `test`, `async`/`await`, `page.goto`, `toHaveTitle`, running and reading failures |
| 02 | [lab02-locators](../tests/labs/lab02-locators.spec.ts) | `getByRole`, `getByLabel`, `getByText`, strict mode, `filter`, chaining, CSS, codegen |
| 03 | [lab03-actions](../tests/labs/lab03-actions.spec.ts) | `fill`, `click`, `press`, `pressSequentially`, `clear`, navigation, keyboard |
| 04 | [lab04-assertions](../tests/labs/lab04-assertions.spec.ts) | web-first vs value assertions, `.not`, lists, soft assertions, custom messages |
| 05 | [lab05-waiting](../tests/labs/lab05-waiting.spec.ts) | auto-waiting, flaky tests, timeouts, `waitForResponse`, `expect.poll` |
| 06 | [lab06-organizing](../tests/labs/lab06-organizing.spec.ts) | `describe`, hooks, `test.step`, `only`/`skip`/`fixme`/`fail`, tags |
| 07 | [lab07-api-testing](../tests/labs/lab07-api-testing.spec.ts) | `request` fixture, GET/POST/PATCH/DELETE, auth header, error responses |
| 08 | [lab08-api-and-ui](../tests/labs/lab08-api-and-ui.spec.ts) | arrange via API, verify via UI, `addInitScript`, `evaluate`, `getByTestId`, two users |
| 09 | [lab09-data-driven](../tests/labs/lab09-data-driven.spec.ts) | data tables, generated tests, typed test data, helper functions |
| 10 | [lab10-page-objects](../tests/labs/lab10-page-objects.spec.ts) | Page Object Model with TypeScript classes |
| 11 | [lab11-fixtures](../tests/labs/lab11-fixtures.spec.ts) | built-in fixtures, `test.extend`, setup/teardown, auto fixtures |
| 12 | [lab12-network](../tests/labs/lab12-network.spec.ts) | watch requests, mock responses, simulate errors and network failures |

Suggested pace: Labs 01–04 in the first session, 05–08 in the second, and
09–12 in the third.

## Running tests from VS Code (optional)

When you open this folder in VS Code, it suggests the **Playwright Test for
VSCode** extension (`ms-playwright.playwright`). Install it, and you get:

- a green ▶ button next to every **uncommented** `test(...)`: click it to run
  just that test. (Save the file after uncommenting a block; if the button does
  not appear, press ⟳ in the Testing sidebar.)
- the **Testing** sidebar (flask icon) listing every lab and test
- **Show browser**, **Pick locator**, and **Record new** in the PLAYWRIGHT panel
- right-click ▶ → **Debug Test** to stop at breakpoints

Still learn the terminal commands below: the terminal shows `console.log`
output and full error messages most clearly.

## Useful commands

| Command | What it does |
|---|---|
| `npx playwright test tests/labs/lab03-actions.spec.ts` | Run one lab file |
| `npx playwright test tests/labs/lab03-actions.spec.ts -g "3.5"` | Run only block 3.5 |
| `npx playwright test tests/labs/lab03-actions.spec.ts --headed` | Watch the browser |
| `npx playwright test tests/labs/lab03-actions.spec.ts --ui` | UI mode: run and time-travel step by step |
| `npx playwright test tests/labs/lab03-actions.spec.ts --debug` | Step through a test line by line |
| `npx playwright show-report` | Open the HTML report of the last run |
| `npx playwright codegen http://localhost:3100` | Record clicks as code (run `npm start` first) |

More: [Playwright commands](reference/playwright-commands.md) ·
[Troubleshooting](reference/troubleshooting.md)

## Checklist

- [ ] Every `[EXPECTED: FAIL]` block was run, read, fixed, and passes
- [ ] Every `Your turn` block is written and passes
- [ ] You can explain the difference between
      `await expect(locator).toHaveCount(6)` and
      `expect(await locator.count()).toBe(6)` (Lab 05)
