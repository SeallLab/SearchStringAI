# Website

This project is a React web app built using [Vite](https://vitejs.dev/).  
You're viewing the **production build** version of the app in this repository. You must be in the website folder of the repository for the following commands.

---

## Requirements

- [Node.js](https://nodejs.org/) (includes `npm`)

> Make sure `npm` is available in your terminal:
```bash
npm -v
```

---

## Running the Production Build

To serve the current build from the `dist/` folder:

### 1. Install dependencies (if not already installed)
```bash
npm install
```

### 2. Serve the production build using `serve`

We use [`serve`](https://www.npmjs.com/package/serve) to run a static server.

Run it directly with `npx` (no global install needed):

```bash
npx serve -s dist
```

> By default, this will serve the app at `http://localhost:3000`

---

## Building the App (Optional)

If you ever want to rebuild the app from source:

```bash
npm run build
```

This will regenerate the `dist/` folder.

---

## Project Structure

```
dist/         # Production build output
public/       # Static assets (copied as-is)
src/          # React source files
vite.config.js
README.md
```

---

## 📃 License

MIT (or your preferred license)

