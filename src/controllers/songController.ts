import { Request, Response } from "express";
import Song from "../models/song";
import { promises } from "dns";
import { ISong } from "../types/song";

const songController = {
  createSong: async (req: Request, res: Response) => {
    try {
      const { title, artist, album, genre } = req.body;
      const song = new Song({ title, artist, album, genre });
      await song.save();
      res.status(201).json(song);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSongById: async (req: Request, res: Response) => {
    try {
      const song = await Song.findById(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song Not Found" });
      }
      res.json(song);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSongList: async (req: Request, res: Response) => {
    try {
      const songs = await Song.find();
      res.json(songs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSong: async (req: Request, res: Response) => {
    try {
      const { title, artist, album, genre } = req.body;
      const updatedSong = await Song.findByIdAndUpdate(
        req.params.id,
        { title, artist, album, genre },
        { new: true }
      );
      if (!updatedSong) {
        return res.status(404).json({ error: "Song Not Found" });
      }
      res.json(updatedSong);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  removeSong: async (req: Request, res: Response) => {
    try {
      const deletedSong = await Song.findByIdAndDelete(req.params.id);
      if (!deletedSong) {
        return res.status(404).json({ error: "Song Not Found" });
      }
      res.json({ success: true, message: "Song Deleted Successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getOverallStatistics: async (req: Request, res: Response) => {
    try {
      const totalSongs = await Song.countDocuments();
      const totalArtists = await Song.distinct("artist").countDocuments();
      const totalAlbums = await Song.distinct("album").countDocuments();
      const totalGenres = await Song.distinct("genre").countDocuments();

      res.json({
        totalSongs,
        totalArtists,
        totalAlbums,
        totalGenres,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  getSongsCountByGenre: async (req: Request, res: Response) => {
    try {
      const genre: string = req.params.genre;
      const songs = await Song.find({ genre }).select({ _id: 0, __v: 0 });
      //select is used for exclude the selected item  b/c by default find() in mongoose returns an array of documents, even if there's only one matching document
      if (!songs || songs.length === 0) {
        return res.status(404).json({ error: "Songs Not Found" });
      }
      res.json({ songs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSongAndAlbuminArtist: async (req: Request, res: Response) => {
    const artist: string = req.params.artist;
    try {
      const artistData = await Song.aggregate([
        {
          $match: { artist },
        },
        {
          $group: {
            _id: "$album",
            songs: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            albums: { $sum: 1 },
            songs: { $sum: "$songs" },
          },
        },
      ]);

      if (artistData.length === 0) {
        res.json({ songs: 0, albums: 0 });
      }
      res.json({
        totalSongs: artistData[0].songs,
        totalAlbums: artistData[0].albums,
      });
    } catch (error) {
      throw new Error(`${error}`);
    }
  },
  getSonginAlbum: async (req: Request, res: Response) => {
    {
      /*try {
      const albumStats = await Song.aggregate([
        { $group: { _id: "$album", totalSongs: { $sum: 1 } } },
      ]);

      res.json(albumStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }  it display album name and songs without passing album in parametr*/
    }
    const album: string = req.params.album;
    try {
      const numberOfSongs: number = await Song.countDocuments({ album });
      res.json({ totalSong: numberOfSongs }); //  {} is used for display other d/f from variable like totalSong
    } catch (error) {
      throw new Error(`${error}`);
    }
  },
  getAlbumWithMostSongs: async (req: Request, res: Response) => {
    try {
      const albumWithMostSongs = await Song.aggregate([
        { $group: { _id: "$album", totalSongs: { $sum: 1 } } },
        { $sort: { totalSongs: -1 } },
        { $limit: 1 },
        { $project: { _id: 0, album: "$_id", totalSongs: 1 } }, // Include only album name and total number of songs
      ]);

      res.json(albumWithMostSongs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  getAllAlbumsWithNumberOfSongsAndArtists: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    //return type of the function is Promise<void> to indicate that the function does not return any value directly.
    //if we use "return " to display album use :Promise<any[]> b/c return either any aggregated data or catch
    try {
      const albumsWithSongsAndArtists = await Song.aggregate([
        {
          $group: {
            _id: "$album",
            artist: { $first: "$artist" },
            songs: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            album: "$_id",
            artist: 1,
            songs: 1,
          },
        },
      ]);

      res.json(albumsWithSongsAndArtists);
    } catch (error: any) {
      throw new Error(`${error}`);
    }
  },
  getAllArtistsWithNumberOfAlbumsAndSongs: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const artist = await Song.aggregate([
        {
          $group: {
            _id: "$artist",
            artist: { $first: "$artist" },
            albums: { $addToSet: "$album" },
            songs: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            artist: 1,
            albums: { $size: "$albums" },
            songs: 1,
          },
        },
      ]);
      res.json(artist);
    } catch (error) {
      throw new Error(`${error}`);
    }
  },
  getAllGenresWithNumberOfSongsAlbumAndArtists: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const genre = await Song.aggregate([
        {
          $group: {
            _id: "$genre",
            songs: { $sum: 1 },
            albums: { $addToSet: "$album" },
            artists: { $addToSet: "$artist" },
          },
        },
        {
          $project: {
            _id: 0,
            genre: "$_id",
            songs: 1,
            numberOfAlbums: { $size: "$albums" },
            numberOfArtists: { $size: "$artists" },
          },
        },
      ]);
      res.json(genre);
    } catch (error) {
      throw new Error(`${error}`);
    }
  },
};

export default songController;
