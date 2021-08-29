import { TOMIController } from "./tomi.controller.js";
import { setupFacial } from "./tomi.facial.js";
import { setupAudio } from "./tomi.audio.js";
import { setupReflection } from "./tomi.reflect.js";
import { setupTOMIAnimator, ActionProps } from "./tomi.animator.js";
const index =  { TOMIController, setupFacial, setupAudio, setupReflection, setupTOMIAnimator, ActionProps }
export {index as default, index} ; 
