import { ActionProps } from "../../utils/tester";

const defaultActionList = ["talkAction", "talkAction2", "talkAction3", "talkAction4", "eureka", "thinking", "sigh"];
export const setupTOMIAnimator = (tomi) => {
    const self = tomi;
    let awareId = null;
    self.autoAnimate = true;
    const selfAware = (state) => {

        if (!state) {
            if (awareId) {
                clearInterval(awareId);
                awareId = null;
            }
        } else {
            if (awareId) {
                clearInterval(awareId);
                awareId = null;
            }
            awareId = setInterval(_ => {
                const list = defaultActionList;
                const id = Math.min(Math.round(Math.random() * list.length), list.length - 1);
                self.actions(list[id])();
            }, 1500);

        }
    }
    self.selfAware = selfAware;
}