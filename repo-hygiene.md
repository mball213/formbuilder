# rapidECM — Formbuilder v3

## Repo hygiene & safety checklist

_Last updated: 2025-08-27_

This mini–playbook keeps the repo tidy and hard to break, with minimal effort.

---

## 1) Protect `main` (GitHub)

**Settings → Branches → Add rule** for `main`:

- ✅ Require a pull request before merging (at least **1** reviewer)
- ✅ Require status checks to pass (select your **CI** job after it runs once)
- ✅ Dismiss stale approvals
- (Optional) ✅ Require linear history
- (Optional) Restrict who can push to matching branches

> Tip: Enable these _after_ your first CI run so the status check name appears.

---

## 2) Pin the Node version

Create **.nvmrc** so everyone (and CI) uses Node 20 LTS:

```bash
echo 20 > .nvmrc
git add .nvmrc && git commit -m "chore: pin Node via .nvmrc" && git push
```

---

## 3) Commit the lockfile

Keep installs reproducible and CI fast:

```bash
git add package-lock.json
git commit -m "chore: commit lockfile"
git push
```

---

## 4) Continuous Integration (CI)

Create **.github/workflows/ci.yml**:

```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-test-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci || npm install
      - run: npm run typecheck --if-present
      - run: npm run build --if-present
      - run: npm test -- --run
      - run: npm run lint --if-present
```

**After first run:** Settings → Branches → Branch protection → **Require status checks to pass** → select **CI / build-test-lint**.

---

## 5) Branching workflow

Never push to `main` directly.

```bash
# create a working branch
git checkout -b feat/field-settings
# commit as you work
git commit -m "feat(field): add placeholder + min/max"
git push -u origin feat/field-settings
# open a PR to main (or to develop, if you use it)
```

(Optional) Keep a `develop` branch for integration:

```bash
git checkout -b develop
git push -u origin develop
```

---

## 6) Tag a safe baseline

So you can roll back at any time:

```bash
git checkout main && git pull
git tag -a v3.0.0 -m "Baseline scaffold passing CI"
git push origin v3.0.0
```

---

## 7) Pre-commit hooks (optional but recommended)

Auto-format and lint staged files.

**Install:**

```bash
npm i -D husky lint-staged
npx husky init
```

**package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": ["prettier --write"],
    "*.{ts,tsx,js,jsx}": ["eslint --fix"]
  }
}
```

**.husky/pre-commit** (created by `husky init`), append:

```bash
npx lint-staged
```

---

## 8) PR & Issue templates (quality nudge)

**.github/pull_request_template.md**

```md
## Summary

-

## Screenshots / Video

-

## Checklist

- [ ] CI green
- [ ] Tests added/updated
- [ ] Docs updated (if needed)
```

**.github/ISSUE_TEMPLATE/bug_report.md**

```md
---
name: Bug report
about: Create a report to help us improve
labels: bug
---

**Describe the bug**
**Steps to reproduce**
**Expected behaviour**
**Screenshots / video**
**Environment (browser/OS)**
```

---

## 9) CODEOWNERS (optional)

Auto-request your review on PRs.

**.github/CODEOWNERS**

```
* @mball213
```

---

## 10) Troubleshooting

- **403 pushing to remote**: you’re logged in as a different account or lack access.
  - `gh auth status` to see the active user.
  - Update remote: `git remote set-url origin https://github.com/mball213/<repo>.git`
  - Or ask owner to add you as a collaborator.

- **CI red cross – “missing script: test”**: add Vitest and a smoke test.

```bash
npm i -D vitest @types/node
# package.json scripts: "test": "vitest"
# src/smoke.test.ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('adds', () => { expect(1+1).toBe(2) }) })
```

- **CI build fails with Vite plugin**: add `@vitejs/plugin-react` and use it in `vite.config.ts`.

- **Windows HTTPS auth pain**: use **Windows Credential Manager** to remove old GitHub creds, and when prompted, use a **Personal Access Token** (with `repo` scope) as the password if 2FA is enabled.

---

## Command crib sheet

```bash
# initial push
git init && git add . && git commit -m "chore: bootstrap" && git branch -M main
git remote add origin <YOUR_REMOTE_URL>
git push -u origin main

# new feature
git checkout -b feat/my-feature
git push -u origin feat/my-feature

# tag a release
git tag -a vX.Y.Z -m "Message"
git push origin vX.Y.Z
```

---

**That’s it.** If you want, we can commit these templates and hooks to your repo now.
