export const createAnalyser = () => {
    const analyser = Howler.ctx.createAnalyser();
    Howler.masterGain.connect(analyser);
    analyser.connect(Howler.ctx.destination);

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get the Data array
    analyser.getByteTimeDomainData(dataArray)
    return {
        analyser,
        dataArray
    }
}
export const createAudioPlayer = (sources, config = { autoplay: true, analyser: true }) => {
    const props = {
        timer: null, 
        analyser: null, 
        dataArray: null,
        update: config.update || null,
        sources: sources,
        playlistIndex: 0,
        data: [],
    }

    const next = (id=undefined) => {
        if (!id) next = props.playlistIndex;
        if (id < props.data.length-1) {
            props.data[id].howl.stop();
            props.data[id].howl.play()
        }

    } 

    if (config.analyser) {
        const { analyser, dataArray } = createAnalyser();
        props.analyser = analyser;
        props.dataArray = dataArray;
        props.timer = setInterval(_ => {
            props.analyser.getByteTimeDomainData(props.dataArray);
            if (props.update) props.update(props);
        }, 100);
    }

    const newHowl = (src, config = {}) =>{
        const data = {}
        data.howl = new Howl({
            src: src,
            html5: true,
            onplay: config.onplay || null,
            onended:config.onended || null,
            onstop: config.onstop || null,
            autoplay: config.autoplay || trues
        });
    
    }
    

}