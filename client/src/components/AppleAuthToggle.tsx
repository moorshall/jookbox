import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppleDeveloperToken } from "~/api/routes/apple";
import { clearApple, setApple } from "~/redux/features/apple/appleSlice";
import { RootState } from "~/redux/store";
import { getExpirationTime } from "~/utils/time";

export default function AppleAuthToggle() {
    const [appleTokenExpirationTime, setAppleTokenExpirationTime] = useState(
        new Date()
    );

    const now = new Date();
    const dispatch = useDispatch();
    const appleToken = useSelector((state: RootState) => state.appleReducer);

    useEffect(() => {
        const loadMusicKit = async () => {
            const developerToken = await getAppleDeveloperToken();
            window.MusicKit.configure({
                developerToken,
                app: {
                    name: "Curate",
                    build: "0.0.1",
                },
            });
        };
        setAppleTokenExpirationTime(
            new Date(appleToken.expirationTime ? appleToken.expirationTime : "")
        );

        console.log("Redux apple token: ", appleToken);

        loadMusicKit();
    }, [appleToken]);

    const authorize = async () => {
        try {
            const music = window.MusicKit.getInstance();
            const musicUserToken = await music.authorize();
            const expirationSeconds = 100 * 24 * 60 * 60;
            const expirationTime = await getExpirationTime(expirationSeconds);
            await dispatch(
                setApple({
                    musicUserToken: musicUserToken,
                    expirationTime: expirationTime,
                })
            );
            console.log("Music User Token:", musicUserToken);
        } catch (error) {
            console.error("Authorization error:", error);
        }
    };

    const unauthorize = async () => {
        const music = window.MusicKit.getInstance();
        await music.unauthorize();
        await dispatch(clearApple());
    };

    return (
        <div>
            {appleToken.musicUserToken &&
            appleToken.expirationTime &&
            appleTokenExpirationTime > now ? (
                <button className="underline" onClick={unauthorize}>
                    Disconnect Apple Music Account
                </button>
            ) : (
                <button className="underline" onClick={authorize}>
                    Connect Apple Music Account
                </button>
            )}
        </div>
    );
}