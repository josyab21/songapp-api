import { Router } from "express";
import songController from "../../controllers/songController";

const songRouter: Router = Router();

// Statistics route
songRouter.get("/statistics", songController.getOverallStatistics);
songRouter.get("/songsbygenre/:genre", songController.getSongsCountByGenre);
songRouter.get(
  "/songandalbuminartist/:artist",
  songController.getSongAndAlbuminArtist
);
songRouter.get("/songinalbum/:album", songController.getSonginAlbum);
songRouter.get("/albummostsongs", songController.getAlbumWithMostSongs);
songRouter.get(
  "/allalbum",
  songController.getAllAlbumsWithNumberOfSongsAndArtists
);
songRouter.get(
  "/allartist",
  songController.getAllArtistsWithNumberOfAlbumsAndSongs
);
songRouter.get(
  "/allgenre",
  songController.getAllGenresWithNumberOfSongsAlbumAndArtists
);

// Song routes
songRouter.post("/", songController.createSong);
songRouter.get("/:id", songController.getSongById);
songRouter.put("/:id", songController.updateSong);
songRouter.delete("/:id", songController.removeSong);
songRouter.get("/", songController.getSongList);

export default songRouter;
