# Frontend Modernization Rollout Notes

## What Changed

- Migrated frontend toolchain from CRA to Vite (`start/dev/build/preview` on Vite).
- Upgraded TypeScript to 6.x and aligned frontend type packages.
- Upgraded React to 19.x and updated affected typings/usages.
- Upgraded MUI core to 7.x and Data Grid to 8.x.
- Replaced CRA test runner with Vitest + jsdom setup.
- Updated Docker frontend build artifact path to `dist/`.
- Fixed admin regressions discovered during modernization:
  - Home / Financials spacing and card layout.
  - Shift Assignments layout rendering.
  - Profile Management tab now renders its own page and backend integration.
  - News Management flicker (effect dependency loop) fixed.

## Validation Summary

- `npm run lint` passes.
- `npm run type-check` passes.
- `npm run test` passes.
- `npm run build` passes.
- `npm run quality` passes.
- `npm audit` reports 0 vulnerabilities (prod + full).
- Frontend Docker image build succeeds (`docker build ./frontend`).

## Manual QA Checklist (Release Candidate)

- [ ] Admin Home: cards and list sections spaced correctly on desktop/mobile.
- [ ] Admin Financials: summary cards and tables spaced correctly on desktop/mobile.
- [ ] Admin Shift Assignments: Assignments, Messages, Current Plan tabs render and remain usable.
- [ ] Admin Profile Management: list loads, profile link opens, resend link action works.
- [ ] Admin News Management: page no longer flickers; create/edit/delete still work.
- [ ] User booking flow: auth, full form submit, confirmation, profile link access.
- [ ] Artist booking flow: auth, full form submit, confirmation.

## Rollback Guidance

- If frontend regressions are found after deploy, revert to the previous frontend image/tag.
- Keep backend unchanged during frontend rollback unless issue is API contract-related.
- Re-run `npm run quality` and `npm run build` before re-releasing.
