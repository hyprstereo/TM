function toggleSidebar(ref){
    document.getElementById("sidebar").classList.toggle('active');
  }

  var elem = document.documentElement;

  function openFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  }

//===========================================================

var myAudio = document.getElementById("mainAudio");
var isPlaying = false;

var audioBtn = document.getElementById("audioBtn");

function togglePlay() {
  isPlaying ? myAudio.pause() : myAudio.play();
};

myAudio.onplaying = function() {
  isPlaying = true;
  audioBtn.src="./assets/imgs/sidepanel/audion_on.png";
};
myAudio.onpause = function() {
  isPlaying = false;
  audioBtn.src="./assets/imgs/sidepanel/audion_off.png";
};


//===========================================================
var sidebarToggleBtn = document.getElementById('sidebarToggleBtn');

window.addEventListener('load', function () {
  if (window.screen.width < 1024 ) {
    setTimeout(function(){ 
      sidebarToggleBtn.click();
    }, 5000);
  }
})


//===========================================================
function cs_change_music(music)
{
  document.getElementById("mainAudio").pause();
  document.getElementById("mainAudio").setAttribute('src', music);
  document.getElementById("mainAudio").load();
  document.getElementById("mainAudio").play();
}