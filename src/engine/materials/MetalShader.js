import * as THREE from 'three';

export const MetalShader = {
    uniforms: {
        uColor: { value: new THREE.Color(0xC0C0C0) },
        uHovered: { value: 0.0 },
        uSelected: { value: 0.0 },
        uTime: { value: 0.0 },
        uIsCircle: { value: 0.0 },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vHovered;
        varying float vSelected;

        attribute float aHovered;
        attribute float aSelected;

        void main() {
            vUv = uv;
            vHovered = aHovered;
            vSelected = aSelected;
            
            #ifdef USE_INSTANCING
                vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
                vNormal = normalize(mat3(instanceMatrix) * normal);
            #else
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vNormal = normalize(mat3(modelMatrix) * normal);
            #endif

            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        uniform float uHovered;
        uniform float uSelected;
        uniform float uTime;
        uniform float uIsCircle;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying float vHovered;
        varying float vSelected;

        // Simple hash for noise
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            
            // Interaction flags
            float isSelected = max(uSelected, vSelected);
            float isHovered = max(uHovered, vHovered);

            float grain = uIsCircle > 0.5 ? hash(vUv * 50.0) : hash(vec2(floor(vUv.x * 2000.0), 0.0));
            float brushed = (grain - 0.5) * 0.12;
            
            vec3 baseColor = uColor + brushed;

            float finalOutline = 0.0;
            if (uIsCircle > 0.5) {
                // Circular Edge
                float radialDist = distance(vUv, vec2(0.5));
                finalOutline = smoothstep(0.47, 0.5, radialDist);
                vec2 edgeDist = min(vUv, 1.0 - vUv);
                
                float outlineSides = smoothstep(0.015, 0.0, edgeDist.x);
                float outlineEnds = smoothstep(0.01, 0.0, edgeDist.y);
                finalOutline = max(outlineSides, outlineEnds * 0.5);
            }

            // Apply Outlines (Darken slightly for relief)
            baseColor = mix(baseColor, baseColor * 0.7, finalOutline);
            
            // Highlight Logic
            if (isSelected > 0.5) {
                vec3 pulseColor = mix(vec3(1.0, 0.6, 0.2), vec3(1.0, 1.0, 0.7), 0.5 + 0.5 * sin(uTime * 10.0));
                baseColor = mix(baseColor, pulseColor, 0.4 + 0.6 * finalOutline);
            } else if (isHovered > 0.5) {
                baseColor = mix(baseColor, vec3(1.0, 1.0, 0.9), 0.2 + 0.4 * finalOutline);
            }

            // Lighting
            vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
            float diffuse = max(dot(normal, lightDir), 0.0);
            
            vec3 halfDir = normalize(lightDir + viewDir);
            float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
            
            // Add a punchy copper specular
            vec3 specColor = vec3(1.0, 0.8, 0.6);
            vec3 finalColor = baseColor * (diffuse * 0.7 + 0.3) + specular * 0.5 * specColor;
            
            // Rim light for volume
            float rim = 1.0 - max(dot(viewDir, normal), 0.0);
            finalColor += pow(rim, 4.0) * 0.25 * baseColor;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

export const getMetalMaterial = () => {
    return new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(MetalShader.uniforms),
        vertexShader: MetalShader.vertexShader,
        fragmentShader: MetalShader.fragmentShader,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
    });
};
