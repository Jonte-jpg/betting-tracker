Place built desktop installers here (e.g., BettingTracker_x64.msi, BettingTracker_x64.exe). 

IMPORTANT: Files placed here will be served with binary headers and excluded from SPA rewrites.

FIREBASE HOSTING LIMITATION:
- Firebase Spark Plan (free) BLOCKS .exe files
- Only .msi files are allowed on free plan
- For .exe support, upgrade to Blaze Plan (pay-as-you-go)

To test:
1. Copy your actual .msi files to this folder (NOT .exe on free plan)
2. Run: npm run build
3. Run: firebase deploy
4. Test download from your hosted site

Note: Demo/placeholder files should not be committed to git.
