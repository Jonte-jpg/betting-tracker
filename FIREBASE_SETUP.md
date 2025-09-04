# Firebase Setup för Betting Tracker

## Steg 1: Skapa Firebase-projekt

1. Gå till [Firebase Console](https://console.firebase.google.com/)
2. Klicka "Create a project"
3. Välj projektnamn (t.ex. "betting-tracker")
4. Aktivera Google Analytics (valfritt)

## Steg 2: Aktivera Authentication

1. I Firebase Console, gå till **Authentication**
2. Klicka **Get started**
3. Gå till fliken **Sign-in method**
4. Aktivera **Google** som sign-in provider
5. Lägg till din domän under **Authorized domains**:
   - `localhost` (redan tillagd)
   - `jonte-jpg.github.io` (för GitHub Pages)
   - Eventuell custom domän

## Steg 3: Konfigurera Firestore

1. Gå till **Firestore Database**
2. Klicka **Create database**
3. Välj **Start in test mode** (vi uppdaterar rules senare)
4. Välj location (europe-west1 för Europa)

## Steg 4: Hämta Firebase-konfiguration

1. Gå till **Project Settings** (kugghjulet)
2. Scrolla ner till "Your apps"
3. Klicka **Add app** och välj **Web** (</>)
4. Registrera appen med namn "Betting Tracker"
5. Kopiera konfigurationsobjektet

## Steg 5: Miljövariabler

Skapa `.env` fil i root-mappen:

```env
VITE_FIREBASE_API_KEY=din-api-key
VITE_FIREBASE_AUTH_DOMAIN=ditt-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ditt-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=ditt-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=din-messaging-sender-id
VITE_FIREBASE_APP_ID=din-app-id
VITE_FIREBASE_MEASUREMENT_ID=din-measurement-id
```

## Steg 6: Uppdatera Security Rules

1. Gå till **Firestore Database** > **Rules**
2. Ersätt befintliga rules med innehållet från `firestore.rules`
3. Klicka **Publish**

## Steg 7: Testa appen

```bash
npm run dev
```

### Testscenarier:

1. **Utloggad användare:**
   - Ska endast se login-sida
   - Ska inte kunna komma åt Firestore-data

2. **Inloggad användare:**
   - Ska kunna skapa bets
   - Ska kunna se sina egna bets
   - Ska inte kunna se andra användares bets

3. **Säkerhetstestning:**
   - Öppna Developer Tools > Console
   - Försök läsa annan användares data (ska misslyckas)

## Steg 8: Deploy till GitHub Pages

GitHub Actions är redan konfigurerat. Lägg till Firebase-miljövariabler som secrets:

1. Gå till GitHub repo > **Settings** > **Secrets and variables** > **Actions**
2. Lägg till alla `VITE_FIREBASE_*` variabler som Repository secrets

## Troubleshooting

### Problem: "Firebase configuration not found"
- Kontrollera att `.env` filen finns och har rätt format
- Se till att alla `VITE_FIREBASE_*` variabler är satta

### Problem: "Unauthorized domain"
- Gå till Firebase Console > Authentication > Settings > Authorized domains
- Lägg till din domän (github.io eller custom domain)

### Problem: "Permission denied"
- Kontrollera Firestore rules
- Se till att användaren är inloggad
- Verifiera att `userId` matchar `auth.uid`

## Firestore-struktur

### Users Collection
```
/users/{userId}
{
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
  preferences: {
    defaultCurrency: string
    defaultBookmaker?: string
  }
}
```

### Bets Collection
```
/bets/{betId}
{
  userId: string           // Must match auth.uid
  event: string
  market: string
  stake: number
  odds: number
  bookmaker: string
  result: 'pending' | 'won' | 'lost' | 'void'
  payout?: number
  notes?: string
  tags?: string[]
  currency: string
  createdAt: string
  updatedAt: string
}
```

## Säkerhetsregler

Firestore rules säkerställer att:
- Endast inloggade användare kan läsa/skriva data
- Användare kan bara komma åt sina egna bets
- Användare kan bara komma åt sin egen användarprofil
- Alla andra operationer nekas

## Nästa steg

1. Implementera offline-stöd med Firestore offline persistence
2. Lägg till push-notifikationer för bet-påminnelser
3. Implementera backup/restore funktionalitet
4. Lägg till admin-panel för moderering
