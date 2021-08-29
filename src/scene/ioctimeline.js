export const IOCTimeline = (data, iocScene, sceneManager) => {
    const master = gsap.timeline();
    
    data.forEach((d, i) => {
        const tl = gsap.timeline();
        if (typeof d === 'function') {
            tl.call(d)
        } else {
            if (d['media']) {
                if (d.media.video) {
                    tl.pause()
                    d.media.video.onload = function() {

                        tl.call('medialoaded');
                        tl.resume();
                    }
                }
            }
        }
        master.add(tl, d['label'] || '>');
    });

    const gd = gsap.delayedCall;
    const e0 = gsap.timeline();
    let curDur = 0;
    e0
    .call(function(){
        iocScene.setCurrentPlaylist('ioc', data);
    }, null, 1)
    .call(function() {
        iocScene.nextVideo();
        if (iocScene.video) {
            curDur = iocScene.duration;
        }
    }, null, curDur)
}