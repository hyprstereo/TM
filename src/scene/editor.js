const SceneProps = {
    name: '',
    timeScale: 1.0,
    duration: 0,
    children: [],
    direction: 'default',
    tracks: [],
}

const ActionTrack = {
    type: 'ActionTrack',
    name: '',
    timeoffset: 0,
    duration: 0,
    from: null,
    to: null,
    complete: null,
    init: null,
    delay: null,
    progress: null,
    ease: null,
    watch: null,
    loop: false,
    repeatCount: 0,
    targets: {}
}

export const SceneExplorer = (scene, level = 'Scene') => {
    const mats = {};
    const Objects = {};
    
    scene.traverse(node=>{
        if (node.type == 'Material') {
            mats.push(mats);
        } else {
            Objects[node.name] = node;
        }
    })
    const animations = scene.animations || null;
    return {
        mats,
        Objects,
        animations
    }
}

export const EditorUI = (container, config = undefined) => {
    const scene = new Scene({
        "tomi":{
            0: {
                transform: {
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
               
            },
            10: {
                transform: {
                    position: {
                        x: 0,
                        y: 0,
                        z: 10
                    },
                }
            },
            options: {
                delay: 5,
            }
        },
        ".stick2 .rect": i => ({
            0: {
                transform: {
                    scale: 0,
                    skew: "-15deg",
                }
            },
            0.7: {
                transform: {
                    scale: 1,
                }
            },
            options: {
                delay: 0.8 + i * 0.1,
            },
        }),
    }, {
        easing: "ease-in-out",
        selector: false,
    })
    const timeline = new Timeline(scene, container, {
        keyboard: true,
        
        ...config
    });

    .interactiveElement {
        width: 1280px;
        height: 270px;
    }
    
    timeline.timelineArea.base.style.zIndex = `200`;
    timeline.on('select', (e) => {
        console.log(e);
    })
   console.log(timeline)

    return {
        scene,
        timeline
    }

}