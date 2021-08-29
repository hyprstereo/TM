// var viewer = new Marzipano.Viewer(document.getElementById('pano'));

// // Create source.
// var source = Marzipano.ImageUrlSource.fromString(
//   "assets/panaromas/outside.png"
// );

// // Create geometry.
// var geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

// // Create view.
// var limiter = Marzipano.RectilinearView.limit.traditional(1024, 100*Math.PI/180);
// var view = new Marzipano.RectilinearView({ yaw: Math.PI }, limiter);

// // Create scene.
// var scene = viewer.createScene({
//   source: source,
//   geometry: geometry,
//   view: view,
//   pinFirstLevel: true
// });

// var view2 = scene.view(); 
// view.setYaw(200 * Math.PI/180);
// view.setPitch(20 * Math.PI/180);
// view.setFov(80 * Math.PI/180);

// // Display scene.
// scene.switchTo();

var sidebarToggleBtn = document.getElementById('sidebarToggleBtn')
var blackBG = document.getElementById('blackBG');
var previewFrame = document.getElementById('previewFrame');
var previewFR = document.getElementById('previewfr');
var previewClose = document.getElementById('previewClose');
var descriptionText = document.getElementById('descriptionText');
var previewLaunchBtn = document.getElementById('previewLaunchBtn');
var launchFR = document.getElementById('launchfr');
var previewTitleHolder = document.getElementById('previewTitleHolder');
var previewMainTitle = document.getElementById('previewMainTitle');
var floorMap = document.getElementById("map");
var previewDescriptionBox = document.getElementById('previewDescriptionBox');

var myAudio = document.getElementById("mainAudio");

//====================================================Day-1
function greet_meet(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor3/01/preview.html";
  launchFR.src = "./assets/iframes/floor3/01/preview.html";

  previewLaunchBtn.addEventListener("click", function(){
    launchFR.src = "./assets/iframes/floor3/01/index.html";
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/H.Chiller.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "HYBRID CHILLER SYSTEM";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "2vh";
    previewMainTitle.style.fontSize = "0.9em";
  } else{
    previewMainTitle.style.paddingTop = "0.9vh";
    previewMainTitle.style.fontSize = "0.5em";
  }

  previewDescriptionBox.style.paddingTop = "10vh";
  previewDescriptionBox.style.paddingBottom = "10vh";
  
  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Hybrid Chiller System</b> <br><br>\
      Data Hall Rooftop<br>\
      The Data Centre block runs on a Hybrid Chiller System which uses a \
      combination of both water-cooled and air-cooled system with N+1 redundancy. \
      This design provides us with the capabilities to operate the Data Centre \
      during periods of water supply interruption.  <br>";
}

//====================================================mantrap
