# MathTree

Skill-tree web app for middle-school competition math. `packages/curriculum` holds the topics, lessons
and progress rules; `apps/web` is the statically exported Next.js front end. `legacy/` is unused.

## Shipping

The owner wants every piece of finished work live without being asked: commit to `main`, push, then run
`scripts/deploy.sh`, which builds the site and pushes it to the `gh-pages` branch that GitHub Pages
serves at https://spencermd.github.io/math/. No feature branches or pull requests; git history is the
rollback. Run `npm run lint` and try the change in a browser first.

## Things that bite

- Rung ids (`topic/slug`) key saved progress in learners' browsers. Don't rename them.
- Saved progress lives in localStorage under `mathtree-progress-v2`; new fields must have defaults so
  older saves still load.
- Read `apps/web/AGENTS.md` before writing Next.js code.
