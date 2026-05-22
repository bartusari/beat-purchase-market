export interface Beat {
  id: number;
  title: string;
  bpm: number;
  beatKey: string;
  producerId: number;
  producerUsername: string;
  price: number;
  releaseDate: string;
  coverUrl: string | null;
  audioUrl: string;
  genres: number[];
  favoriteCount: number;
  isFavorite: boolean;
}
