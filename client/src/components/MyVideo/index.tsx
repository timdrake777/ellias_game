import React, { MutableRefObject, useEffect, useRef } from "react";
import { VarsUI } from "../../interfaces";
import Sketch from "react-p5";
import p5Types from "p5";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import "./MyVideo.scss";

const MyVideo: React.FC<VarsUI.PropsMyVideo> = (props) => {
  var model: faceLandmarksDetection.FaceLandmarksDetector;

  const runFaceDetect = async () => {
    const detectorConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
    };
    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      detectorConfig as any
    );
    detect(model);
  };

  const detect = async (
    model: faceLandmarksDetection.FaceLandmarksDetector
  ) => {
    if (props.refer.current) {
      const webcamCurrent = props.refer.current;
      if (webcamCurrent && webcamCurrent.readyState === 4) {
        const video = webcamCurrent;
        const predictions = await model.estimateFaces(video);
        if (predictions.length) {
          console.log(predictions)
          return predictions;
        } else {
          return null;
        }
      }
    }
  };

  const POINTS = [104, 53, 283, 333];

  const setup = (p5: p5Types, canv: Element) => {
    p5.createCanvas(320, 240).parent(canv);
    p5.background("rgba(0,0,0,0.1)");
  };

  const draw = (p5: p5Types) => {
    if (model) {
      detect(model);
    }
    p5.clear();
  };

  useEffect(() => {
    runFaceDetect();
  }, [props.refer.current?.readyState]);

  return (
    <div className="video--client">
      <video muted playsInline autoPlay ref={props.refer} />
      <Sketch setup={setup} draw={draw} className="video--face_recognition" />
    </div>
  );
};

export default MyVideo;
