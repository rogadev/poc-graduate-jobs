## Files inside the ~/server/api are automatically prefixed with /api in their route. For adding server routes without /api prefix, you can instead put them into ~/server/routes directory.

```ts
export default defineEventHandler(() => 'Hello World!')
```

Given the Example above, the /hello route will be accessible at http://localhost:3000/hello .

> Note: Didn't use routes because I want everything to live in the /api/v1 or future v# path.
