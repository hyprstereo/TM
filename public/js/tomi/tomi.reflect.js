import * as THREE from "/build/three.module.130.js";

export const setupReflection = (tomi, simple = false) => {
    if (simple) return;
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding
    });
    const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
    //tomi._body.combine = THREE.MultiplyOperation;
   
    tomi.cubeCamera = cubeCamera;
    tomi._cubeRenderTarget = cubeRenderTarget;
    
    tomi.updateReflect = () => {
        tomi.cubeCamera.update(tomi.sceneManager.renderer, tomi.sceneManager.scene);
        
         if (tomi._mainMaterials) {
            tomi._mainMaterials.envMap =  cubeRenderTarget.texture;
        }
        //tomi._body.material.envMap =  tomi._cubeRenderTarget.texture;
        //tomi._hat.material.envMap =  tomi._cubeRenderTarget.texture;
       //tomi.sceneManager.scene.environment = tomi._cubeRenderTarget.texture;
    }
    
    return {
        cubeRenderTarget,
        cubeCamera
    }
}