import React, { useRef, useMemo, Suspense } from "react";
import {
  BufferGeometry,
  BufferAttribute,
  RawShaderMaterial,
  DoubleSide,
} from "three";
import { Canvas, useFrame } from "react-three-fiber";

export default function Waves(props) {
  const WaveMesh = () => {
    const position = useMemo(
      () =>
        new Float32Array([
          -1.0,
          -1.0,
          0.0,
          1.0,
          -1.0,
          0.0,
          -1.0,
          1.0,
          0.0,
          1.0,
          -1.0,
          0.0,
          -1.0,
          1.0,
          0.0,
          1.0,
          1.0,
          0.0,
        ]),
      []
    );
    const positions = new BufferAttribute(position, 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", positions);

    const vertexShader = `attribute vec3 position;
      
          void main()	{
            gl_Position = vec4(position, 1.0);
          }`;

    const fragmentShader = `precision mediump float;
          uniform vec2 resolution;
          uniform float time;
          uniform float xScale;
          uniform float yScale;
          uniform float distortion;
          
          void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      
            float d = length(p) * distortion;
      
            float rx = p.x * (1.0 - d);
            float gx = p.x;
            float bx = p.x * (1.0 + d);
      

            float r = 0.1/(rx*rx+p.y*p.y) + 0.25/abs(sin(rx*rx+p.y*p.y+time/1.5)+cos(rx*rx+p.y*p.y+time/1.5));
            float g = 0.1/(gx*gx+p.y*p.y) + 0.25/abs(sin(gx*gx+p.y*p.y+time/1.5)+cos(gx*gx+p.y*p.y+time/1.5));
            float b = 0.1/(bx*bx+p.y*p.y) + 0.25/abs(sin(bx*bx+p.y*p.y+time/1.5)+cos(bx*bx+p.y*p.y+time/1.5));

            gl_FragColor = vec4(r, g, b, 1.0);
          }`;

    var uniforms = {
      resolution: {
        type: "v2",
        value: [window.innerWidth, window.innerHeight],
      },
      time: { type: "f", value: 0 },
      xScale: { type: "f", value: 1.0 },
      yScale: { type: "f", value: 0.6 },
      distortion: { type: "f", value: 0.01 },
    };

    var material = new RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: DoubleSide,
    });

    const mesh = useRef();

    useFrame(() => {
      if (mesh.current !== null) {
        mesh.current.material.uniforms.time.value += 0.01;
      }
    });

    return (
      <mesh
        ref={mesh}
        userData={{
          original: "https://codepen.io/Web_yuki1027/full/yLgYpWM",
        }}
        material={useMemo(() => material, [])}
        geometry={geometry}
      />
    );
  };

  return (
    <Canvas
      style={{ position: "absolute" }}
      userData={{
        originalAuthor: "https://github.com/remiBoudreau"
      }}
      onCreated={(state) => state.gl.setClearColor(0x666666)}
      updateDefaultCamera={false}
    >
      <WaveMesh />
    </Canvas>
  );
}
