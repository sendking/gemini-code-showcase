# Backend Dev Guidelines (Sample Skill)

## Purpose
Provide guidance and checklist for backend TypeScript services when reviewing or making changes.

## When to apply
- Files under `/api`, `/services`, `/server`, or with `.ts` extension
- On PRs that change endpoints or business logic

## Checklist / Steps
1. Read the changed files and summarize the change in 2-3 sentences.
2. Validate type boundaries and public API surface.
3. Check for missing tests and suggest test cases.
4. Look for potential security issues (injection, auth bypass, unsafe deserialization).
5. Suggest performance hotspots and caching opportunities.

## Example prompt to send to Gemini
```
You are a senior backend engineer. I will paste code diffs or file contents. Provide:
1) A 2-3 sentence summary of the change.
2) A prioritized checklist of issues (bugs, missing tests, security, performance).
3) Suggested concrete code fixes (with code snippets) for the top 2 items.
```
