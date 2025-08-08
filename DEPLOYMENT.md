# Korean Mappers Map - Deployment Guide

## 🚀 Quick Start Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository named `kankokujin-no-map`
2. Make it public (required for GitHub Pages)
3. Don't initialize with README (we already have files)

### Step 2: Upload Your Code

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: Korean Mappers Map website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kankokujin-no-map.git
git push -u origin main
```

### Step 3: Get osu! API Key

1. Visit [osu! API page](https://osu.ppy.sh/p/api/)
2. Log in with your osu! account
3. Request an API key
4. Copy the key (you'll need it in the next step)

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OSU_API_KEY`
5. Value: Paste your osu! API key
6. Click **Add secret**

### Step 5: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy your site

### Step 6: Test the Workflow

1. Go to **Actions** tab in your repository
2. Click **Run workflow** → **Run workflow** to trigger manually
3. Wait for the workflow to complete (about 2-3 minutes)
4. Your site will be available at: `https://YOUR_USERNAME.github.io/kankokujin-no-map/`

## 🔧 Customization

### Adding Manual User IDs

Edit `scripts/fetch-mappers.js` and add user IDs to the `MANUAL_MAPPER_IDS` array:

```javascript
const MANUAL_MAPPER_IDS = [
  194807,  // lepidopodus
  114017,  // KRZY
  1574070, // Kloyd
  // Add more user IDs here
];
```

### Ignoring Specific User IDs

Some users might have the Korean flag but are not actually Korean mappers. You can exclude them by adding their IDs to the ignore list:

```javascript
const IGNORE_MAPPER_IDS = [
  123456,  // Example: Non-Korean user with KR flag
  789012,  // Example: Another user to ignore
  // Add more user IDs to ignore here
];
```

### Updating Site Information

- **Site title**: Edit `index.html` and `app/layout.tsx`
- **GitHub link**: Update the footer links in both files
- **Colors/styling**: Modify `app/globals.css` and Tailwind classes

## 📊 How It Works

1. **Daily Updates**: GitHub Actions runs every day at 2 AM UTC (11 AM KST)
2. **Data Fetching**: Script calls osu! API to get Korean mappers and their beatmaps
3. **Site Generation**: Updates the JSON data file and rebuilds the site
4. **Deployment**: Automatically deploys to GitHub Pages

## 🛠️ Local Development (Optional)

If you want to develop locally, you can use the simple HTML version:

1. Open `index.html` in your browser
2. Edit the HTML/CSS/JavaScript directly
3. Refresh to see changes

For the Next.js version (requires Node.js setup):

```bash
npm install
npm run dev
```

## 📝 File Structure

```
kankokujin-no-map/
├── index.html              # Simple HTML version (works immediately)
├── data/mappers.json       # Generated data file
├── scripts/fetch-mappers.js # Data fetching script
├── .github/workflows/      # GitHub Actions
├── app/                    # Next.js version (advanced)
└── README.md              # Project documentation
```

## 🐛 Troubleshooting

### Workflow Fails
- Check if `OSU_API_KEY` secret is set correctly
- Verify the API key is valid on osu! website
- Check Actions logs for specific error messages

### No Data Showing
- Ensure the workflow has run at least once
- Check if `data/mappers.json` exists in your repository
- Verify the API key has sufficient permissions

### Site Not Loading
- Confirm GitHub Pages is enabled
- Check if the repository is public
- Wait a few minutes after workflow completion

## 🎯 Next Steps

1. **Customize the manual user list** with more Korean mappers
2. **Adjust the styling** to match your preferences  
3. **Share the site** with the osu! community
4. **Monitor the daily updates** to ensure data freshness

Your Korean Mappers Map will automatically stay updated with the latest beatmaps from Korean mappers! 🇰🇷
