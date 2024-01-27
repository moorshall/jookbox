"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spotify_controller_1 = require("../controllers/spotify.controller");
const spotifyRoutes = (0, express_1.Router)();
spotifyRoutes.get("/auth", spotify_controller_1.requestSpotifyAuthorization);
spotifyRoutes.post("/token", spotify_controller_1.requestAccessToken);
spotifyRoutes.post("/refresh", spotify_controller_1.refreshAccessToken);
spotifyRoutes.post("/id", spotify_controller_1.getSpotifyUserId);
spotifyRoutes.get("/playlist/:id", spotify_controller_1.getSpotifyPlaylistById);
spotifyRoutes.get("/playlists/top", spotify_controller_1.getTopSpotifyPlaylists);
spotifyRoutes.post("/playlists/user/:id", spotify_controller_1.getSpotifyPlaylistsByUserId);
spotifyRoutes.post("/search", spotify_controller_1.searchSpotify);
exports.default = spotifyRoutes;
