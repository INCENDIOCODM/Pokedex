<p align="center">
   <img width="100%"  alt="Image" src="https://github.com/user-attachments/assets/1e97eb67-5f4b-4633-b1ad-53c690642c40" />
</p>


# Pokedex

A React Native mobile application built with Expo and TypeScript that allows you to explore Pokémon, view their details, and save your favorites.

## Features

- **Explore Pokémon:** Browse through a comprehensive list of Pokémon.
- **Search Functionality:** Quickly find specific Pokémon using the search bar.
- **Detailed Views:** View in-depth information, types, and stats for each Pokémon.
- **Favorites System:** Save your favorite Pokémon for quick access later.
- **Offline Caching:** Built-in support for caching data locally using SQLite to ensure smooth performance.
- **Theming:** Support for custom themes, including both light and dark modes.
- **Smooth Animations:** Fluid transitions and skeleton loading screens for a polished user experience.

## Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Local Storage:** `expo-sqlite` and `@react-native-async-storage/async-storage`
- **Animations:** [moti](https://github.com/nandorojo/moti) and [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)

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

### Running the App

Start the Expo development server:
### Running the App

Start the Expo development server:

```bash
npx expo start
```
```bash
npx expo start
```

From here, you can:

- Press `a` to open the app on an Android emulator.
- Press `i` to open the app on an iOS simulator.
- Scan the QR code with the Expo Go app on your physical Android or iOS device.
From here, you can:

- Press `a` to open the app on an Android emulator.
- Press `i` to open the app on an iOS simulator.
- Scan the QR code with the Expo Go app on your physical Android or iOS device.

## Project Structure

- `src/app/` - Contains the main routing logic and screens (Home, Favorites, Settings, Details).
- `src/components/` - Reusable UI components like the SearchBar and PokeCard.
- `src/context/` - Global state management, such as the ThemeContext.
- `src/functions/` - Utility functions for API calls, local caching, and storage logic.
- `src/interface/` - TypeScript definitions and interfaces for PokéAPI data.
## Project Structure

- `src/app/` - Contains the main routing logic and screens (Home, Favorites, Settings, Details).
- `src/components/` - Reusable UI components like the SearchBar and PokeCard.
- `src/context/` - Global state management, such as the ThemeContext.
- `src/functions/` - Utility functions for API calls, local caching, and storage logic.
- `src/interface/` - TypeScript definitions and interfaces for PokéAPI data.
