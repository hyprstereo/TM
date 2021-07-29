export const Tween = async  (targets, from, to, duration = 1000, props = {}) => {
  const tween = createjs.Tween.get(targets, {...props});
  return tween;
}