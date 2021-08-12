
import { LoopOnce } from "../build/three.module.js";
import {  } from "../web/js/build/three.module.js";

export const ClipActions = (name, faceProps = {eyes: 'default', lips: [0, 1, 2]},loop = LoopOnce, repeat = 0) => {
    return {

    }
}

export const ActionSets = (label, props = {}) => {
    
    const addActions = (time, fn) => {
        actionSet.actions[time] = fn;
    }

    const actionSet =  {
        label: label,
        clips: props.clips || [],
        audio: props.audio || null,
        actions: {},
        addActions
    }
}