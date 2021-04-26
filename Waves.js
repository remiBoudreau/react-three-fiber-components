import React, { useRef, useMemo, useEffect } from "react";
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
          uniform float progress;
          
          void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
            float d = length(p) * distortion;
      
            float rx = p.x * (1.0 - d);
            float gx = p.x;
            float bx = p.x * (1.0 + d);
            
            float r_sin_term = 0.0;
            float g_sin_term = 0.0;
            float b_sin_term = 0.0;

            highp int progress_int = int(progress);  
            for(int i=1; i<100;i+=2) {
              if ( i <= progress_int) {
                float i_float = float(i);
                r_sin_term += sin((rx + time) * i_float * xScale) * yScale / i_float;
                g_sin_term += sin((gx + time) * i_float * xScale) * yScale / i_float;
                b_sin_term += sin((bx + time) * i_float * xScale) * yScale / i_float;
              }
            }

            float r = 0.05 / abs(p.y + r_sin_term);
            float g = 0.05 / abs(p.y + g_sin_term);
            float b = 0.05 / abs(p.y + b_sin_term);
      
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
      distortion: { type: "f", value: 0.08 },
      progress: { type: "f", value: 1.0 },
    };

    var material = new RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: DoubleSide,
    });

    const mesh = useRef();
    useEffect(() => {
      var body = document.body;
      var html = document.documentElement;

      var height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      function handleScroll() {
        mesh.current.material.uniforms.progress.value =
          window.pageYOffset / 10 + 1;
      }
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);

    useFrame(() => (mesh.current.material.uniforms.time.value += 0.01));

    return (
      <mesh
        ref={mesh}
        userData={{
          originalAuthor: "https://github.com/remiBoudreau",
          inspiration: "https://codepen.io/Web_yuki1027/full/yLgYpWM"
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
        originalAuthor: "https://github.com/remiBoudreau",
        inspiration: "https://codepen.io/Web_yuki1027/full/yLgYpWM"
      }}
      onCreated={(state) => state.gl.setClearColor(0x666666)}
    >
      <WaveMesh />
    </Canvas>
  );
}
