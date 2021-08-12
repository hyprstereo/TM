import { create360 } from "./controllers/360.js";

export const Assets = {
    models: [
        "/video/map.mp4",
        "/models/tom.gltf",
    ],
    textures: ["/"],
};

const init = async (target) => {
    const {renderer, camera, scene, dome } = await create360(target, '/video/map/video.mp4');
    
};

document.body.onload = async (evt) => {
    await init();
};
