import React, { MutableRefObject, useEffect, useRef } from "react";
import { VarsUI } from "../../interfaces";
import Sketch from "react-p5";
import p5Types from "p5";

import './Video.scss'

const Video = (props: VarsUI.PropsVideo) => {
  const ref: MutableRefObject<HTMLVideoElement | null> =
    useRef<HTMLVideoElement | null>(null);

  let x = 50;
  let y = 50;


  useEffect(() => {
    props.peer.peer.on("stream", (stream: MediaStream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [props]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(500, 500).parent(canvasParentRef);
	};

	const draw = (p5: p5Types) => {
		p5.background(0);
		p5.ellipse(x, y, 70, 70);
		x++;
	};

  return (
    <div className="video--client">
      <video playsInline autoPlay ref={ref} />
      <Sketch setup={setup} draw={draw}/>
    </div>
  );
};

export default Video;
