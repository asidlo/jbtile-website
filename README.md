# JB Tile, LLC — Website

Modern, mobile-first portfolio website for JB Tile, LLC.

## Adding New Photos

### Step 1: Go to the GitHub repository

Navigate to your repository on [github.com](https://github.com).

### Step 2: Open the images folder

Click into the `images/` folder, then into the category you want (e.g., `bathrooms/`, `backsplashes/`, `heated-floors/`).

### Step 3: Upload photos

1. Click **"Add file"** → **"Upload files"**
2. Drag and drop your photos
3. Scroll down and click **"Commit changes"**

That's it! The site will automatically update within a few minutes.

### Adding a New Category

1. Navigate to the `images/` folder
2. Click **"Add file"** → **"Create new file"**
3. Type the folder name followed by a slash and a placeholder: `kitchen-floors/.gitkeep`
4. Click **"Commit changes"**
5. Now upload photos into the new `kitchen-floors/` folder

The category name is automatically generated from the folder name:
- `kitchen-floors` → **Kitchen Floors**
- `shower-walls` → **Shower Walls**
- `outdoor-patios` → **Outdoor Patios**

## Local Development

Just open `index.html` in a browser. No build tools needed.

For live reload during development, you can use any simple HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

## Deployment

### GitHub Pages
1. Go to **Settings** → **Pages**
2. Set source to **"Deploy from a branch"**
3. Select `main` branch, `/ (root)` folder
4. Click **Save**

### Cloudflare Pages
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **"Create a project"** → **"Connect to Git"**
3. Select this repository
4. Build settings: leave build command **empty**, output directory: `.`
5. Click **"Save and Deploy"**

### Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select this repository
4. Build settings are auto-detected from `netlify.toml`
5. Click **"Deploy site"**

### Custom Domain

All three platforms support custom domains with free SSL:
- **GitHub Pages**: Settings → Pages → Custom domain
- **Cloudflare Pages**: Custom domains tab → Add domain
- **Netlify**: Domain settings → Add custom domain

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, CSS Grid, Flexbox, CSS columns for masonry
- **Vanilla JavaScript** — Zero dependencies
- **Google Fonts** — Fraunces + DM Sans
- **GitHub Actions** — Auto-generates gallery manifest when images are added

## Project Structure

```
├── index.html              # Single-page website
├── css/styles.css          # All styles
├── js/
│   ├── main.js             # Gallery, lightbox, navigation, animations
│   └── gallery-data.json   # Auto-generated image manifest
├── images/
│   ├── logo.png            # Company logo
│   ├── hero.png            # Hero background image
│   ├── about.png           # About section image
│   ├── backsplashes/       # Gallery: Backsplash projects
│   ├── bathrooms/          # Gallery: Bathroom projects
│   └── heated-floors/      # Gallery: Heated floor projects
├── .github/workflows/
│   └── build-gallery.yml   # Auto-generates gallery-data.json
├── netlify.toml            # Netlify config
├── _headers                # Cloudflare Pages headers
└── .nojekyll               # GitHub Pages config
```
