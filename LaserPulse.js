import React, { useRef, useMemo } from "react";
import {
  BufferGeometry,
  BufferAttribute,
  RawShaderMaterial,
  DoubleSide,
} from "three";
import { Canvas, useFrame } from "react-three-fiber";

export default function LaserPulse(props) {
  const LaserPulseMesh = () => {
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
          uniform float amplitude;
          uniform float distortion;
          const float w = -15.0;
        
          void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            float d = length(p) * distortion;
            
            float ry = p.y * (1.0 - d);
            float gy = p.y;
            float by = p.y * (1.0 + d);

            float rx = p.x * (1.0 - d);
            float gx = p.x;
            float bx = p.x * (1.0 + d);
            float r;
            float g;
            float b;
            
            if (time < 2.0) {
              r = 0.075/abs(ry+(0.1*sin(-time) + 0.30)+amplitude*exp(-(rx-5.0*time+5.0)*(rx-5.0*time+5.0))*cos(w*(p.x - 0.25*time)));
              g = 0.075/abs(gy+(0.1*sin(-time) + 0.30)+amplitude*exp(-(gx-5.0*time+5.0)*(gx-5.0*time+5.0))*cos(w*(p.x - 0.25*time)));
              b = 0.075/abs(by+(0.1*sin(-time) + 0.30)+amplitude*exp(-(bx-5.0*time+5.0)*(bx-5.0*time+5.0))*cos(w*(p.x - 0.25*time)));
            } else {
              r = 0.075/abs(ry+(0.1*sin(-time) + 0.30)+amplitude*exp(-(rx-5.0*2.0+5.0)*(rx-5.0*2.0+5.0))*cos(w*(p.x - 0.25*2.0)));
              g = 0.075/abs(gy+(0.1*sin(-time) + 0.30)+amplitude*exp(-(gx-5.0*2.0+5.0)*(gx-5.0*2.0+5.0))*cos(w*(p.x - 0.25*2.0)));
              b = 0.075/abs(by+(0.1*sin(-time) + 0.30)+amplitude*exp(-(bx-5.0*2.0+5.0)*(bx-5.0*2.0+5.0))*cos(w*(p.x - 0.25*2.0)));
            }
      
            gl_FragColor = vec4(r, g, b, 1.0);
          }`;

    var uniforms = {
      resolution: {
        type: "v2",
        value: [window.innerWidth, window.innerHeight],
      },
      time: { type: "f", value: 0 },
      distortion: { type: "f", value: 0.1 },
      amplitude: { type: "f", value: 0.5 },
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
        if (mesh.current.material.uniforms.time.value < 6.29) {
          mesh.current.material.uniforms.time.value += 0.01;
        } else {
          mesh.current.material.uniforms.time.value = 0.0;
        }
      }
    });

    return (
      <mesh
        ref={mesh}
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
    >
      <LaserPulseMesh />
    </Canvas>
  );
}
