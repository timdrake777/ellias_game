import { useEffect, useRef } from "react"

export const UserCam = () => {

    const videoRef = useRef(null);

    const getVideo = () => {
        navigator.mediaDevices.getUserMedia({
            video: { width: 1920, height: 1080 }
        })
            .then(stream => {
                let video: any = videoRef.current;
                if (video !== null) {
                    video.srcObject = stream;
                    video.play();
                }
            })
            .then(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        getVideo();
    }, [videoRef]);

    return (
        <div className="camera">
            <video ref={videoRef}></video>
        </div>
    );
}