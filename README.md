<p align="center">
   <img width="100%"  alt="Image" src="https://github.com/user-attachments/assets/1e97eb67-5f4b-4633-b1ad-53c690642c40" />
</p>

# Pokedex

A React Native mobile application built with Expo and TypeScript that lets you explore Pokémon, identify them from photos with AI, battle opponents, view detailed stats, and save favorites.

## Features

- **Explore Pokémon:** Browse through a comprehensive list of Pokémon.
- **Search Functionality:** Quickly find specific Pokémon using the search bar.
- **AI Camera Identification:** Capture a Pokémon image and identify it with OpenRouter-powered vision models.
- **AI Result Enrichment:** Shows confidence/reasoning and fetches a random Pokédex fun fact when detection succeeds.
- **Detailed Views:** View in-depth information, types, and stats for each Pokémon.
- **Favorites System:** Save your favorite Pokémon for quick access later.
- **Local Battle Mode:** Pick one of your favorites and battle a random Gen-1 opponent in a turn-based arena.
- **Type Effectiveness Combat:** Damage and outcomes are driven by Pokémon type matchups and battle stats.
- **Battle Results & History:** Review winner details, stats, battle logs, and saved battle history.
- **Offline Caching:** Built-in support for caching data locally using SQLite to ensure smooth performance.
- **OpenRouter Key Management:** Save or remove your OpenRouter API key directly in-app.
- **Theming:** Support for custom themes, including both light and dark modes.

## Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Data Source:** [PokeAPI](https://pokeapi.co/)
- **AI Provider Gateway:** [OpenRouter](https://openrouter.ai/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Local Storage:** `expo-sqlite` and `@react-native-async-storage/async-storage`
- **Camera and Imaging:** `expo-camera` and `expo-image`
- **Animations:** [moti](https://github.com/nandorojo/moti) and [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)

## PokeAPI Acknowledgment

This project relies on [PokeAPI](https://pokeapi.co/) for Pokemon data, including names, sprites, stats, types, and move details.

Without PokeAPI, this app would not have been possible in its current form. Huge credit and thanks to the PokeAPI community for providing and maintaining this amazing open API.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed along with a package manager like `npm` or `yarn` or `bun`.
You will also need the Expo Go app on your physical device, or an Android/iOS emulator installed on your computer.

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd Pokemon
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### OpenRouter Setup (AI Camera)

The AI camera identification feature requires an OpenRouter API key.

You can configure it in either way:

1. **In-app (recommended):**
   - Open **Settings**.
   - Go to the **OpenRouter** section.
   - Paste your key and tap **Save API key**.

2. **Environment variable fallback:**
   ```powershell
   $env:EXPO_PUBLIC_OPENROUTER_API_KEY="sk-or-v1-..."
   ```

After setting an environment variable, restart the Expo server.

> Keep your API key private. Do not commit it to source control.

### Running the App

Start the Expo development server:

```bash
npx expo start
```

From here, you can:

- Press `a` to open the app on an Android emulator.
- Press `i` to open the app on an iOS simulator.
- Scan the QR code with the Expo Go app on your physical Android or iOS device.

## Available Scripts

- `npm run start` - Starts the Expo development server.
- `npm run android` - Runs the app on Android.
- `npm run ios` - Runs the app on iOS.
- `npm run web` - Runs the app in a web browser.
- `npm run lint` - Runs ESLint checks.
- `npm run reset-project` - Runs the project reset utility script.

## Battle Flow

1. **Pick a Pokemon** in `BattleSelection`.
2. **Battle in real-time** in `BattleArena` with turn-based actions and type effectiveness.
3. **View outcome and stats** in `BattleResults`.
4. **Review previous matches** in `BattleHistory`.

## AI Camera Flow

1. **Capture a photo** in the Camera tab.
2. **Confirm the image** and start analysis.
3. **Gemini model runs first** through OpenRouter.
4. **Automatic Grok fallback** runs if the Gemini request fails.
5. **Review the result** (name, confidence, reasoning, fun fact) and open Pokémon details.

## Data and Persistence

- Pokemon data is fetched from PokeAPI and cached locally in SQLite for faster repeat access.
- Favorites are loaded from local cache so battle selection works quickly.
- Battle history is stored in a local battle database to keep previous results and stats.
- The app uses a cache-first strategy with API fallback to balance speed and freshness.

## Troubleshooting

- If Metro behaves oddly or old code keeps showing, run `npx expo start -c`.
- If favorites or battle data looks stale, use the in-app refresh controls and cache management options in Settings.
- If camera analysis fails, verify your OpenRouter API key in Settings (or `EXPO_PUBLIC_OPENROUTER_API_KEY`).
- If AI confidence is low, retake the photo with better lighting and keep the Pokémon centered in frame.
- If a device does not connect, confirm Expo Go (or emulator) and the dev server are on reachable networks.
- If lint errors appear, run `npm run lint` and fix the reported issues before committing.

## Project Structure

```text
Pokemon/
├── README.md
├── package.json
├── app.json
├── android/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── favorites.tsx
│   │   │   ├── battle.tsx
│   │   │   └── camera.tsx
│   │   └── Screens/
│   │       ├── Home.tsx
│   │       ├── PokemonDetail.tsx
│   │       ├── CameraResult.tsx
│   │       ├── ImageCaptureResult.tsx
│   │       ├── BattleSelection.tsx
│   │       ├── BattleArena.tsx
│   │       ├── BattleResults.tsx
│   │       ├── BattleHistory.tsx
│   │       ├── Settings.tsx
│   │       └── SkeletonScreen.tsx
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── pokeCard.tsx
│   │   ├── Grid.tsx
│   │   ├── Pokemontype/
│   │   └── battle/
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── functions/
│   │   ├── ApiCalls.ts
│   │   ├── OpenRouterAPI.ts
│   │   ├── PokemonCacheDb.ts
│   │   ├── BattleEngine.ts
│   │   ├── BattleHistoryStorage.ts
│   │   ├── TypeEffectiveness.ts
│   │   └── ...
│   ├── interface/
│   ├── assets/
│   └── typings/
└── tsconfig.json
```

- AI camera model integration lives in `src/functions/OpenRouterAPI.ts`.
- AI result screen and fallback flow are handled in `src/app/Screens/ImageCaptureResult.tsx`.
- OpenRouter key storage and cache controls are in `src/app/Screens/Settings.tsx`.

## Contributing

Pull requests are welcome.
Before submitting a PR, run `npm run lint` and make sure checks pass.
