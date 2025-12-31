// apicalls.tsx
import { PokemonAPI, PokemonListAPI } from "@/interface/PokeAPInterface";

async function featchPokemonsList(url: string): Promise<PokemonListAPI> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data as PokemonListAPI;
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    throw error;
  }
}

async function featchPokemonData(url: string): Promise<PokemonAPI> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data as PokemonAPI;
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    throw error;
  }
}

export { featchPokemonData, featchPokemonsList };
