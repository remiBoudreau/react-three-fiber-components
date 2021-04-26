import React, { useRef, useMemo } from "react";
import {
  BufferGeometry,
  BufferAttribute,
  RawShaderMaterial,
  DoubleSide,
} from "three";
import { Canvas, useFrame } from "react-three-fiber";

export default function Atom(props) {
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
          uniform float distortion;
          uniform float progress;

          void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            
            float py = p.y;

            float d = length(p) * distortion;
            
            float rx = p.x * (1.0 - d) - 0.3;
            float gx = p.x - 0.3;
            float bx = p.x * (1.0 + d) - 0.3;
            
            // Nucleus
            float r = 1.0 - ( (0.0001) / (rx*rx + ( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time))*( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time)) ));
            float g = 1.0 - ( (0.0001) / (gx*gx + ( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time))*( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time)) ));
            float b = 1.0 - ( (0.0001) / (bx*bx + ( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time))*( py*( 1.0 - 0.2*cos(2.0*time )) + 0.01*sin(time)) ));
            float alpha = 0.25;

            // Orbitals
            if (r > 0.65) {
              if (progress < 1.0) {
                r = (1.0 - progress)*(abs(sin(time)*0.5 + 3.00) / (10.0*(rx*rx + py*py))) + (progress)*( (0.01) / (0.075*rx*rx*(5.0 + sin(time)) + ( py*py + 0.2*sin(-0.55))*( py*py + 0.2*sin(-0.55)) ));
                alpha = 1.0;
              } else {
                r = ( (0.01) / (0.075*rx*rx*(5.0 + sin(time)) + ( py*py + 0.2*sin(-0.55))*( py*py + 0.2*sin(-0.55)) ));
                alpha = 1.0;

              }
            }

            if (g > 0.65) {
                //prevent orbital from going into page when transform is complete
                if (progress < 1.0) {
                  g = (1.0 - progress)*(abs(sin(time)*0.5 + 2.75) / (10.0*(gx*gx + py*py))) + (progress)*(0.1*abs(cos(time)*0.5 + 2.50) / (10.0*(gx*gx + py*py)));
                } else {
                  g = (0.1*abs(cos(time)*0.5 + 2.50) / (10.0*(gx*gx + py*py)));
                }
                //
            }
            if (b > 0.65) {
              if (progress < 1.0) {
                b = (1.0 - progress)*(abs(sin(time)*0.5 + 2.50) / (10.0*(bx*bx + py*py))) + (progress)*( (0.01) / (0.075*py*py*(5.0 + sin(time-0.1*time)) + ( bx*bx + 0.2*sin(-0.55))*( bx*bx + 0.2*sin(-0.55)) ));
              } else {
                b = ( (0.01) / (0.075*py*py*(5.0 + sin(time-0.1*time)) + ( bx*bx + 0.2*sin(-0.55))*( bx*bx + 0.2*sin(-0.55)) ));
              }
            }

            gl_FragColor = vec4(r, g, b, alpha);
          }`;

    var uniforms = {
      resolution: {
        type: "v2",
        value: [window.innerWidth, window.innerHeight],
      },
      distortion: { type: "f", value: 0.0 },
      time: { type: "f", value: 0.0 },
      progress: { type: "f", value: 100 },
    };

    var material = new RawShaderMaterial({
      transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: DoubleSide,
    });

    const mesh = useRef();

    useFrame(() => {
      if (mesh.current !== null) {
        mesh.current.material.uniforms.time.value += 0.05;
      }
    });

    return (
      <mesh
        ref={mesh}
        userData={{
          originalAuthor: "https://github.com/remiBoudreau"
        }}
        material={useMemo(() => material, [])}
        geometry={geometry}
      />
    );
  };

  return (
    <Canvas
      style={{ position: "absolute", transform: "scale(-1.2)", zIndex: "-1" }}
      userData={{
        originalAuthor: "https://github.com/remiBoudreau"
      }}      
      updateDefaultCamera={false}
    >
      <WaveMesh />
    </Canvas>
  );
}
