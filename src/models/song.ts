import { ISong } from "../types/song";
import mongoose, { Schema, Document } from "mongoose";

const SongSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  genre: { type: String, required: true },
});

export default mongoose.model<ISong>("Song", SongSchema);
