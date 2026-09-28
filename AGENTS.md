<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- All TaskNest state (tasks, daily budget, active task) lives in `src/hooks/use-tasknest.ts` backed by localStorage — the PRD forbids a backend.
- Pure domain logic (priority formula, formatting) stays in `src/lib/tasknest.ts` so it can be reasoned about and reused without React.
- Feature UI lives in `src/components/tasknest/*`; `src/routes/index.tsx` only composes those sections.
