## Prompt Similarities Grouping

### The problem

- Having too much fun hitting that button when generating AI images? You may find yourself drowning in hundreds of your own creations and dreading having to sort them later.

### Solution

- Use K-means grouping to sort files based on the prompt tokens

### Usage

```
bun run src/index -p [path] -c [number of groups]
```

### TODOS

- [x] Rewrite in TypeScript
