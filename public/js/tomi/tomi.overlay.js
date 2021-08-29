
import { degToRad } from '/js/utils/helpers';
import * as THREE from "/build/three.module.130.js";

const images = `
alarm,/ui/ioc/ICON_ Animation [Recovered]-01.png
maintainence,/ui/ioc/ICON_ Animation [Recovered]-16.png
escalator,/ui/ioc/ICON_ Animation [Recovered]-03.png
wireless,/ui/ioc/ICON_ Animation [Recovered]-02.png
alien,/ui/ioc/ICON_ Animation [Recovered]-04.png
cctv,/ui/ioc/ICON_ Animation [Recovered]-05.png
cctv2,/ui/ioc/ICON_ Animation [Recovered]-05.png
404,/ui/ioc/ICON_ Animation [Recovered]-06.png
communicate,/ui/ioc/ICON_ Animation [Recovered]-07.png
call,/ui/ioc/ICON_ Animation [Recovered]-08.png
thumbsup,/ui/ioc/Asset 3@2x.png
traffic,/ui/ioc/ICON_ Animation [Recovered]-10.png
question,/ui/ioc/ICON_ Animation [Recovered]-11.png
light,/ui/ioc/ICON_ Animation [Recovered]-12.png
loudspeaker,/ui/ioc/ICON_ Animation [Recovered]-13.png
temphot,/ui/ioc/ICON_ Animation [Recovered]-14.png
tempcold,/ui/ioc/ICON_ Animation [Recovered]-15.png

complain,/ui/ioc/ICON_ Animation [Recovered]-17.png
cars,/ui/ioc/ICON_ Animation [Recovered]-18.png
buzzer,/ui/ioc/ICON_ Animation [Recovered]-19.png
super,/ui/ioc/ICON_ Animation [Recovered]-20.png
support,/ui/ioc/ICON_ Animation [Recovered]-21.png
peace,/ui/ioc/peace.png
case,/ui/ioc/case.png
`
export const iconDisplaySets = [
    'alarm,maintainence,escalator,thumbsup',
    'cctv,communicate,support,cctv',
    'traffic,wireless,support,cars',
    'call,wireless,escalator,light',
    'temphot,maintainence,support,tempcold',
    'complain,maintainence,support,thumbsup',
    '404,maintainence,escalator,case',
    'loudspeaker,alien,escalator,case',
    'alien,maintanence,escalator,peace',
    'question,maintainence,buzzer,'

]
export const IconSets = () => {
    const paths = _.split(images.trim(), "\n");
    const icons = {}
    paths.forEach((v, i) => {
        if (v !== '') {
            const data = v.split(',')
            icons[data[0]] = {
                src: data[1],
                sprite: null,
                index: i,
                selected: true,

            };
        }
    })
    return icons;
}

export const createOverlay = async (tomiCtrl, max = 21) => {
    const overlayGroup = new THREE.Object3D();
    const ppx = degToRad(360 / max);
    const distance = .5;
    const iconSets = IconSets();
    const iconKeys = Object.keys(iconSets);
    const loader = new THREE.TextureLoader();
    const arr = []
    for (let i = 0; i < max; i++) {
        const iconHolder = new THREE.Object3D();
        const iconSprite = await loadIconMesh(iconSets[iconKeys[i]].src, loader);
        iconSprite.scale.multiplyScalar(0.12);
        iconSets[iconKeys[i]].sprite = iconSprite.map;
        iconHolder.add(iconSprite);
        iconHolder.name = iconKeys[i];
        iconSprite.position.z = .5;
        arr.push({ sprite: iconSprite, label: iconKeys[i], parent: iconHolder });
        iconHolder.rotateY(i * ppx);
        overlayGroup.add(iconHolder);
    }
    tomiCtrl.icons = arr;
    overlayGroup.position.y = 0.25;

    tomiCtrl.add(overlayGroup);
    tomiCtrl.overlayGroup = overlayGroup;
    tomiCtrl._overIndex = -1;
    tomiCtrl._radius = 0.5;
    tomiCtrl.overlaySet = (index) => {
        return sets[index];
    }
    tomiCtrl.nextOverlay = async (icons, reset = false) => {
        // if (reset) arr = [];
        // if (typeof icons === 'string') {
        //     if (icons.contains(',')) {
        //         let keys = icons.split(',');
        //         keys.forEach(k=> {
        //             arr.push(iconSets[k]);
        //         })
        //     } else {
        //         arr.push(iconSets[icons]);
        //     }
        //     const rot = degToRad(360/arr.length);
        //     arr.forEach((a, x)=>a.sprite.parent.rotation.y = rot * x);
        //     tomiCtrl.showOverlay(true);
        // }
    };
    tomiCtrl.showOverlay = (state, selected = undefined) => {
        if (state) overlayGroup.visible = true;
        arr.forEach((s, i) => {

            gsap.to(s.sprite.position, {
                y: (state) ? 0 : 2.5, duration: 2.5, ease: 'elastic', delay: 0.1 * i, onComplete: () => {
                    if (i == arr.length - 1) {
                        overlayGroup.visible = state;
                    }
                }
            });

        })
    };

    tomiCtrl.showSets = (icons, ...interval) => {
        //const iconKeys = Object.keys(iconSets);
        let intv = interval;
        let arr = tomiCtrl.icons;
        const group = tomiCtrl.overlayGroup;
        let ar = [];
        group.visible = false;
        const ics = icons.split(' ');
        const r = degToRad(360 / ics.length);
        let counter = 0;
        arr.forEach(c => {
            if (ics.indexOf(c.label) > -1) {
                c.sprite.visible = true;
                c.order = counter;
                c.sprite.scale.set(.3, .3, .3);
                c.sprite.position.set(0,0, .5);
               
                counter++;
                ar.push(c);
            } else {
                c.sprite.visible = false;
                c.sprite.scale.set(0.12, 0.12, 0.12);
            }
        });
        ar = ar.sort(function(a, b){
            return a.order > b.order;
        })
        
        group.visible = true;

        const fn = (total, rot = 0) => {
            const itv = (intv.length>1) ? intv.shift() : intv[0];
            startSpin(group.rotation.y - rot, itv, ()=>{
                if (total>0) {
                    total--;
                    fn(total, rot);
                } else {
                    hide();
                }
            });
           
      
    }
        //ar = ar.reverse();
        //group.rotateY(degToRad(r * ar.length));
        let twn;
        const startSpin = (rr = 0, delay = 1, complete = undefined) => {
            twn = gsap.to(group.rotation, { y: rr, ease: 'sine.out', duration: 2, delay: delay,  onComplete: complete, onUpdate: ()=>{
                // group.children.forEach((p, u) =>{
                //     const d = THREE.Vector3.distance(p.children[0].position, group.position);
                //     console.log(u, d);
                // })
            } })
        }
        if (interval <0) interval = ar.length * 1.2;
        let tm;
       

        const hide = () => {
            if (twn) twn.pause(0);
            ar.forEach((a, i) => {
                gsap.to(a.sprite.position, {
                    y: 2.5, duration: 1.5, ease: 'elastic', delay: 0.1 * i, onComplete: () => {
                       
                    }
                });
            })
        }

        tomiCtrl.clearSets = hide;
        const rot = degToRad(360/ar.length)
        group.rotation.y = 0;
        ar.forEach((a, i) => {
            a.parent.rotation.y = i * rot;
            twn = gsap.fromTo(a.sprite.position,{y: 2.5}, {
                y: 0.2, duration: 2.5, ease: 'elastic', delay: 0.1 * i, onComplete: () => {
                    if (i == ar.length - 1) {
                        let total = ar.length-1;
                       fn(total, rot);
                    }
                }
            });

           
        })
    }

    tomiCtrl.showOverlay(false);
};

export const loadIconMesh = async (src, loader) => {
    const t = await loader.load(src, result => result);
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending }));
};