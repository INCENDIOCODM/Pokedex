import {
	addFavorite,
	removeFavorite,
	isFavorite,
	getFavoriteIds,
	toggleFavorite,
	getCachedPokemonsByIds,
} from "./PokemonCacheDb";

export interface FavoritePokemon {
	name: string;
	url: string;
	isFavourite: boolean;
}

export const AddToFavourite = async (pokemonId: number): Promise<boolean> => {
	try {
		await addFavorite(pokemonId);
		console.log(`Added pokemon ${pokemonId} to favourites`);
		return true;
	} catch (error) {
		console.error("Failed to add to favourites:", error);
		return false;
	}
};

export const RemoveFromFavourite = async (
	pokemonId: number,
): Promise<boolean> => {
	try {
		await removeFavorite(pokemonId);
		console.log(`Removed pokemon ${pokemonId} from favourites`);
		return true;
	} catch (error) {
		console.error("Failed to remove from favourites:", error);
		return false;
	}
};

export const CheckIfFavourite = async (pokemonId: number): Promise<boolean> => {
	try {
		return await isFavorite(pokemonId);
	} catch (error) {
		console.error("Failed to check favourite status:", error);
		return false;
	}
};

export const GetAllFavourites = async (): Promise<number[]> => {
	try {
		return await getFavoriteIds();
	} catch (error) {
		console.error("Failed to get favourites:", error);
		return [];
	}
};

export const ToggleFavourite = async (pokemonId: number): Promise<boolean> => {
	try {
		const result = await toggleFavorite(pokemonId);
		const action = result ? "Added" : "Removed";
		console.log(`${action} pokemon ${pokemonId} to/from favourites`);
		return result;
	} catch (error) {
		console.error("Failed to toggle favourite:", error);
		return false;
	}
};
