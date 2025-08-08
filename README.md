# Korean Mappers Map | 한국인의 비트맵

A modern, automated website showcasing Korean osu! mappers and their ranked beatmaps. This project creates a beautiful, searchable directory of Korean mapping talent, automatically updated daily via GitHub Actions.

## ✨ Features

- **Automated Daily Updates**: Fetches latest data from osu! API every day
- **Beautiful Modern UI**: Clean, responsive design with Korean typography
- **Smart Search**: Find mappers by name or search through their beatmaps
- **Comprehensive Data**: Shows mapper stats, beatmap details, difficulty ratings, and play counts
- **Mobile Friendly**: Fully responsive design that works on all devices
- **Instant Preview**: Simple HTML version works immediately without setup
- **Incremental Updates**: Smart daily updates that only fetch new/changed data since last run
- **Complete API Pagination**: Fetches ALL ranked beatmaps for each mapper (no data missed)
- **State Persistence**: Tracks last update times for efficient incremental processing
- **Weekly Full Scans**: Automatic comprehensive data refresh to ensure completeness
- **Performance Optimized**: First run comprehensive (~30-60 min), daily runs fast (~2-5 min)

## 🚀 Quick Start

### For Immediate Testing

1. **Open `index.html` in your browser** to see the website immediately
2. The sample data shows how the site will look with real mapper information
3. Search functionality and responsive design work out of the box

### For Full Deployment

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.**

Quick summary:
1. Create GitHub repository
2. Get osu! API key
3. Add API key as GitHub secret
4. Enable GitHub Pages
5. Your site goes live automatically!

## 📊 Data Sources

- **osu! API**: Primary source for mapper and beatmap data
- **Country Filter**: Automatically finds mappers with country code "KR"
- **Manual Additions**: Support for manually specified Korean mapper IDs
- **Profile Images**: Fetched from osu! avatar service

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3 (Tailwind CDN), JavaScript (ES6+)
- **Advanced Version**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with Korean font support (Noto Sans KR)
- **Automation**: GitHub Actions for daily updates
- **Deployment**: GitHub Pages (free hosting)
- **API**: osu! REST API v1

## 📁 Project Structure

```
kankokujin-no-map/
├── index.html              # Main website (works immediately!)
├── data/
│   └── mappers.json       # Generated mapper data
├── scripts/
│   └── fetch-mappers.js   # Data fetching script
├── .github/workflows/
│   └── update-data.yml    # GitHub Actions workflow
├── app/                   # Next.js version (advanced)
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── DEPLOYMENT.md          # Complete deployment guide
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🎯 Key Features Explained

### Automated Data Collection
- Scans osu! API for Korean mappers (country="KR")
- Fetches all ranked/approved/loved beatmaps for each mapper
- Includes mapper statistics (rank, PP, play count, join date)
- Updates daily at 2 AM UTC (11 AM KST)
- Handles API rate limits with automatic retry

### Modern UI/UX
- Gradient backgrounds and card-based design
- Real-time search with instant filtering
- Hover effects and smooth transitions
- Korean typography (Noto Sans KR)
- Responsive grid layout
- Loading states and error handling

### Comprehensive Beatmap Info
- Approval status badges (Ranked, Approved, Loved, Qualified)
- Difficulty rating (star rating)
- Play count and favorite count
- Direct links to beatmap pages
- Approval dates and version names
- Mapper profile links

## 🔧 Customization

### Adding Manual Mappers
Edit `scripts/fetch-mappers.js`:

```javascript
const manualUserIds = [
  194807,  // lepidopodus
  114017,  // KRZY
  1574070, // Kloyd
  // Add more Korean mapper IDs here
];
```

### Styling Changes
- **Colors**: Edit the gradient and color classes in `index.html`
- **Layout**: Modify Tailwind classes in HTML components
- **Typography**: Update font imports and family settings
- **GitHub Link**: Update footer link to your repository

## 📈 API Usage

### Endpoints Used
- `GET /api/get_user` - Fetch user profiles by country
- `GET /api/get_beatmaps` - Get beatmaps by user ID
- Profile images from `https://a.ppy.sh/{user_id}`

### Rate Limits
- 1200 requests per minute
- 200 burst capacity
- Automatic retry with exponential backoff
- Efficient batching to minimize API calls

## 🌐 Deployment Status

✅ **Ready for Deployment!**

- [x] HTML website created and tested
- [x] Sample data provided
- [x] GitHub Actions workflow configured
- [x] Next.js version available for advanced users
- [x] Complete deployment guide provided
- [x] Environment configuration documented

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the HTML version
5. Submit a pull request

### Ideas for Contributions
- Add more Korean mappers to the manual list
- Improve UI/UX design
- Add filtering by beatmap status or difficulty
- Implement mapper statistics visualization
- Add support for other countries
- Create mobile app version

## 📄 License

MIT License - feel free to use this project as a base for your own mapper showcases!

## 🙏 Credits

- **osu! API** for providing comprehensive beatmap data
- **Korean osu! Community** for inspiration and mapper identification
- **Tailwind CSS** for the beautiful styling framework
- **GitHub** for free hosting and automation
- **Original Forum Thread** for historical context

## 🔗 Links

- [Live Website](https://yourusername.github.io/kankokujin-no-map/) (replace with your URL after deployment)
- [osu! API Documentation](https://github.com/ppy/osu-api/wiki)
- [Original Forum Thread](https://osu.ppy.sh/community/forums/topics/39610?n=1)
- [Get osu! API Key](https://osu.ppy.sh/p/api/)

---

**Made with ❤️ for the Korean osu! mapping community**

**Ready to deploy? Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide!**
