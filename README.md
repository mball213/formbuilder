# rapidECM Formbuilder v3

A lightweight drag-and-drop form builder scaffold.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

## Notes

- Uses HTML5 drag & drop for zero-dependency reordering and palette -> canvas drops.
- `Schema Preview` shows the current form model; we can evolve this to a saved JSON schema and renderer.
- We can swap to dnd-kit or another library if/when needed.
---

## Local setup

1. Install **Node 20+** (LTS).
2. Install deps and run the dev server:
   ```bash
   npm install
   npm run dev
   ```

## Git setup

```bash
git init
git add .
git commit -m "chore: bootstrap formbuilder v3 scaffold"
git branch -M main
# Create a new repo on GitHub/GitLab/Bitbucket, then:
git remote add origin <YOUR_REMOTE_URL>
git push -u origin main
```

### Recommended workflow
- Create feature branches:
  ```bash
  git checkout -b feat/field-settings
  # ...work...
  git commit -m "feat(field): add min/max and placeholder"
  git push -u origin feat/field-settings
  ```
- Open a PR/MR to `main`, squash, and **tag releases**:
  ```bash
  git checkout main && git pull
  git tag -a v3.0.0 -m "Initial scaffold"
  git push origin v3.0.0
  ```

### Optional quality gates
- Pre-commit hooks with Husky + lint-staged
- GitHub Actions CI (build + tests) — ask and we’ll add `/ .github/workflows/ci.yml`