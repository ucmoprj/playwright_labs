# Troubleshooting

| Symptom | Fix |
|---|---|
| The browser shows a different app, or `route not found` | Another program uses port 3100. Use another port: `PORT=3200 npm start` (PowerShell: `$env:PORT=3200; npm start`) and run tests with the same `PORT`. |
| `EADDRINUSE: address already in use :::3100` | Mini Shop is already running in another terminal. Use that one, or stop it with `Ctrl + C`. |
| `Executable doesn't exist` | `npx playwright install chromium` |
| `Timed out waiting ... from config.webServer` | Mini Shop did not start. Run `npm start` alone and read the error. |
| Tests pass once, then fail on the second run | Leftover data. Reset with `POST /api/test/reset` in `beforeEach`. |
| Red squiggles in VS Code (`Cannot find name 'process'`) | Run `npm install`, then `Ctrl + Shift + P` → **TypeScript: Restart TS Server**. |
