import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import axios from "axios";

let cachedAppleDeveloperToken: string | null = null;
let tokenExpiry: Date | null = null;

export const getAppleDeveloperTokenCached = async () => {
    if (cachedAppleDeveloperToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedAppleDeveloperToken;
    } else {
        const newToken = await generateAppleDeveloperToken();
        cachedAppleDeveloperToken = newToken;
        tokenExpiry = new Date(
            new Date().getTime() + 180 * 24 * 60 * 60 * 1000
        ); // 180 days from now
        return newToken;
    }
};

const generateAppleDeveloperToken = async () => {
    const {
        APPLE_MUSIC_TEAM_ID,
        APPLE_MUSIC_KEY_ID,
        APPLE_MUSIC_PRIVATE_KEY_PATH,
        APPLE_MUSIC_AUTH_SECRET,
    } = process.env;

    if (
        !APPLE_MUSIC_TEAM_ID ||
        !APPLE_MUSIC_KEY_ID ||
        !APPLE_MUSIC_PRIVATE_KEY_PATH ||
        !APPLE_MUSIC_AUTH_SECRET
    ) {
        throw new Error(
            "Apple Music environment variables are missing or invalid."
        );
    }

    try {
        const privateKey = APPLE_MUSIC_AUTH_SECRET.replace(/\\n/g, "\n");

        const token = jwt.sign({}, privateKey, {
            algorithm: "ES256",
            expiresIn: "180d",
            issuer: APPLE_MUSIC_TEAM_ID,
            header: {
                alg: "ES256",
                kid: APPLE_MUSIC_KEY_ID,
            },
        });

        return token;
    } catch (error) {
        console.error("Error generating Apple Developer token:", error);
        return null;
    }
};

export const getAppleDeveloperToken = async (req: Request, res: Response) => {
    try {
        const token = await getAppleDeveloperTokenCached();
        return res.status(200).send(token);
    } catch (error) {
        console.error("Error generating Apple Developer token:", error);
        res.status(500).send(error);
    }
};

export const getApplePlaylistsByUserToken = async (
    req: Request,
    res: Response
) => {
    const musicUserToken = req.header("Music-User-Token");

    if (!musicUserToken) {
        console.error("Music User Token is required");
        return res.status(400).send("Music User Token is required");
    }

    const appleDeveloperToken = await getAppleDeveloperTokenCached();
    if (!appleDeveloperToken) {
        throw new Error("Failed to retrieve Apple Developer Token");
    }

    try {
        const response = await axios.get(
            "https://api.music.apple.com/v1/me/library/playlists",
            {
                headers: {
                    Authorization: `Bearer ${appleDeveloperToken}`,
                    "Music-User-Token": musicUserToken,
                },
            }
        );

        const transformedData = response.data.data
            .filter((playlist: any) => playlist.attributes.hasCatalog)
            .map((playlist: any) => ({
                id: playlist.attributes.playParams.globalId,
                name: playlist.attributes.name,
                description: playlist.attributes.description.standard,
            }));

        return res.json(transformedData);
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return res.status(500).send("Failed to fetch playlists");
    }
};

export const getApplePlaylistById = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const playlist = await getApplePlaylistDetails(id);
        return res.send(playlist);
    } catch (error) {
        return res.status(500).send("Error fetching apple playlist by id");
    }
};

export const getTopApplePlaylists = async (req: Request, res: Response) => {
    try {
        const token = await getAppleDeveloperTokenCached();
        const playlistResults = await axios.get(
            `https://api.music.apple.com/v1/catalog/us/charts`,
            {
                params: { limit: 20, types: "playlists" },
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const playlists = playlistResults.data.results.playlists[0].data;

        const result = await Promise.all(
            playlists.map(async (playlist: any) => {
                return await getApplePlaylistDetails(playlist.id);
            })
        );

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send(`Error searching with Apple client`);
    }
};

export const getApplePlaylistByIdInternal = async (playlistId: string) => {
    try {
        const playlistDetails = await getApplePlaylistDetails(playlistId);
        return playlistDetails;
    } catch (error) {
        console.error(
            "Error in fetching apple playlist by id internal ",
            error
        );
        throw error;
    }
};

const getApplePlaylistDetails = async (playlistId: string) => {
    try {
        const developerToken = await getAppleDeveloperTokenCached();
        const response = await axios.get(
            `https://api.music.apple.com/v1/catalog/us/playlists/${playlistId}`,
            { headers: { Authorization: `Bearer ${developerToken}` } }
        );

        const playlist = response.data.data[0];
        const songs = playlist.relationships.tracks.data.map((song: any) => ({
            id: song.id,
            title: song.attributes.name,
            artist: song.attributes.artistName,
            imageUrl: song.attributes.artwork.url
                .replace("{w}", "600")
                .replace("{h}", "600")
                .replace("bb.jpg", "bb-60.jpg"),
        }));

        return {
            id: playlist.id,
            title: playlist.attributes.name,
            description: playlist.attributes.description
                ? playlist.attributes.description.short ||
                  playlist.attributes.description.standard
                : "Apple's Top Hits",
            songs: songs,
            origin: "apple",
            author: { displayName: "Apple" },
        };
    } catch (error) {
        console.error("Error fetching apple playlist details: ", error);
        throw error;
    }
};
