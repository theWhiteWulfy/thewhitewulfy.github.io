/* For restaring animations on window resize */

const animParts = [
  "lcd-light",
  "hour",
  "minute",
  "human-wrapper",
  "human",
  "head",
  "eyes",
  "r-upper-arm",
  "r-lower-arm",
  "l-upper-arm",
  "l-lower-arm",
  "l-thigh",
  "r-thigh",
  "l-lower-leg",
  "r-lower-leg"
];

function restartAnims(animClassArray, resetClass) {
  for (let i = 0; i < animClassArray.length; ++i) {
    // get animated elements and reset animations
    let animClass = document.getElementsByClassName(animClassArray[i])[0];
    animClass.className += " " + resetClass;

    // reflow
    let animClassW = animClass.offsetWidth;
    animClass.offsetWidth = animClassW;

    // animation reset class removed
    animClass.className = animClassArray[i];
  }
}

window.addEventListener("resize", function() {
  restartAnims(animParts, "reset-anim");
});