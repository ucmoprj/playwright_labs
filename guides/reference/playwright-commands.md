# Playwright Commands

You do not need to start Mini Shop before running tests.
`playwright.config.ts` starts it automatically (`webServer`) and stops it
afterwards. If Mini Shop is already running, Playwright reuses it.

| Command | What it does |
|---|---|
| `npx playwright test` | Run all tests (headless) |
| `npx playwright test tests/examples/basics.spec.ts` | Run one file |
| `npx playwright test -g "0.3"` | Run tests whose title contains `0.3` |
| `npx playwright test --headed` | Watch the browser while tests run |
| `npx playwright test --ui` | Interactive UI mode: run, watch, time-travel |
| `npx playwright show-report` | Open the HTML report of the last run |
| `npx playwright show-trace <trace.zip>` | Open a trace file |

## Reading a failure

1. The terminal shows the locator, the expected value, and the actual value.
2. `npx playwright show-report` → click the failed test.
3. Open **Trace** to step through every action, the DOM snapshot, and the
   network requests.

Then decide: is the **application** wrong, or the **test**? Check the
requirements — not the screen — to decide what is correct.

## Why tests run one at a time

`playwright.config.ts` sets `workers: 1`. All tests share one in-memory
Mini Shop server, and many tests reset its data. In parallel, one test could
reset the data in the middle of another test.

## Where did `playwright.config.ts` come from?

This project already includes Playwright, so you do **not** need to run any
setup command.

In a new project, you would normally start with:

```bash
npm init playwright@latest
```

It asks a few questions and creates `playwright.config.ts`, an example test,
and (optionally) a GitHub Actions workflow. The config in this project was
written for Mini Shop and differs from the generated default:

| Setting | Generated default | This project | Why |
|---|---|---|---|
| `baseURL` | commented out | `http://localhost:3100` | Write `page.goto('/')` instead of full URLs |
| `webServer` | commented out | starts Mini Shop | No need to start the server by hand |
| Parallel runs | `fullyParallel: true` | `workers: 1` | Tests share and reset one in-memory server |
| Retries | 2 on CI | 0 | A retry can hide a flaky test or a real defect |
| Browsers | Chromium, Firefox, WebKit | Chromium only | Faster install and CI runs |
| Trace | on first retry | kept on every failure | No retries, so keep evidence of the first failure |

*Optional:* run `npm init playwright@latest` in an **empty** folder and compare
the generated config with this one.
