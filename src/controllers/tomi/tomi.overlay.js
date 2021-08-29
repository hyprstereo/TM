
import { degToRad } from '../../utils/helpers';
import * as THREE from '/build/three.module.js';

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

    tomiCtrl.mesh.add(overlayGroup);
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

    const maxItems = 4;
    const degPerItem = degToRad(360 / maxItems);
    tomiCtrl._overlaySlots = [];
    tomiCtrl._activeIcon;
    tomiCtrl._overIndex = 0;
    tomiCtrl._prevIcon;
    const iconByName = (n) => {
        const res = tomiCtrl.icons.map(arr => arr.label === n);
        return res[0];
    }

    tomiCtrl.showSets = (icons, ...interval) => {
        //const iconKeys = Object.keys(iconSets);
        let master;
        let intv = interval;
        let arr = tomiCtrl.icons;
        const group = overlayGroup;
        const hide = () => {
            tomiCtrl.showOverlay(false);
        }
        let ar = [];
        group.visible = false;

        
        group.rotation.y = 0;

        const ics = icons.split(' ');
        let rot = degToRad(360 / ics.length)
        let counter = 0;
        master = gsap.timeline({ autoRemoveChildren: true });

        arr.forEach((c, u) => {
            if (ics.indexOf(c.label) > -1) {
                c.sprite.visible = true;
                c.order = counter;
                c.delay = (intv.length > 1) ? intv.shift() : intv[0];
                c.sprite.scale.set(.12, .12, .12);
                c.sprite.material.opacity = 0;
                c.sprite.position.set(0, 0, .6);

                counter++;
                ar.push(c);

            } else {
                c.sprite.visible = false;
                c.sprite.scale.set(0.12, 0.12, 0.12);
                c.sprite.position.y = 2.5
            }
        });
        ar = ar.sort(function (a, b) {
            return a.order < b.order;
        })

        
        group.rotation.y = 0;
        if (master && master.isActive()) {
            master.kill()
            //hide();
        }
        if (ar.length<1) return
        group.visible = true;
        // ar.forEach((a, x) => {
        //     a.parent.rotation.y = x * -rot;
        //     const tl = gsap.timeline({ duration: 3, ease: 'sine.out' });


        //     tl
        //         .add(gsap.to(overlayGroup.rotation, { y: overlayGroup.rotation.y + rot }), 0)
        //         .add(gsap.fromTo(a.sprite.position, { y: .8 }, { y: 0.3, duration: 1.5 }), 0)
        //         .add(gsap.fromTo(a.sprite.material, { opacity: 0 }, { opacity: 1, duration: 2 }), 0)
        //         .add(gsap.fromTo(a.sprite.scale, { x: .3, y: .3, z: .3 }, { x: 1, y: 1, z: 1 }, { opacity: 1, duration: 2 }), 0);
        //     if (x > 0) {
        //         tl.add(gsap.to(ar[x - 1].sprite.material, { opacity: .3 }, 0))
        //         tl.add(gsap.to(ar[x - 1].sprite.scale, { x: .3, y: .3, z: .3 }, 0))
        //     }

        //     master.add(tl, '>');
        // })
        // master.play(0);

        // const stop = () => {
        //     if (master.isActive()) {
        //         master.pause();
        //     }
        // }

        // return {
        //     master,
        //     stop
        // }

        const sx = 0.12;
        const lx = 0.3;
        const speed0 = 1;
        overlayGroup.rotation.y = 0;

        ar.forEach((a, x) => {
            a.parent.rotation.y = x * -rot;
            const tl = gsap.timeline({
                duration: 2.5, onStart: () => {
                    // gsap.to(overlayGroup.rotation, {y: overlayGroup.rotation.y - rot});
                    if (x > 0) {
                        gsap.to(ar[x - 1].sprite.material, { opacity: .3, duration: speed0, ease: 'sine.out' })
                        gsap.to(overlayGroup.rotation, { y: overlayGroup.rotation.y + rot, duration: speed0, ease: 'sine.out' });
                        gsap.to(a.sprite.scale, { x: .3, y: .3, z: .3, duration: 2.5, ease: 'elastic' });
                    }
                    gsap.fromTo(a.sprite.position, { y: 2.5 }, { y: -0.4, duration: speed0 });
                    gsap.fromTo(a.sprite.material, { opacity: 0 }, { opacity: 1, duration: 2.5 });
                    gsap.fromTo(a.sprite.scale, { x: sx, y: sx, z: sx }, { x: lx, y: lx, z: lx, duration: 2.5, ease: 'elastic' });
                }, onComplete: () => {
                    if (a.delay <= 0) {
                        master.pause();
                    }
                }
            });
            let delay = (x > 0) ? `>${a.delay}` : '>';
            master.add(tl, delay);
        })
        master.play();
        tomiCtrl.clearSets = hide;
        return master;
        //tomiCtrl.showOverlay(false);*/
    }
};

export const loadIconMesh = async (src, loader) => {
    const t = await loader.load(src, result => result);
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: t }));
};