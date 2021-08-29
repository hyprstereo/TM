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

var sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
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

//====================================================meet&greet
function greet_meet(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/01/preview.html";
  launchFR.src = "./assets/iframes/floor1/01/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/meet.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "MAIN LOBBY";

  if(screen.width > 800)
  previewMainTitle.style.paddingTop = "2vh";

  // previewDescriptionBox.style.height = "60%";  
  previewDescriptionBox.style.paddingTop = "10vh";
  previewDescriptionBox.style.paddingBottom = "10vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Main Lobby</b> <br><br>\
      Ground Floor<br><br>\
      This is the main lobby of the data centre administration block. \
      This area will be manned 24x7 by our operation personnel to facilitate the secondary pass exchange for access to DC hall. \
      Meeting rooms are equipped with WIFI connectivity and LCD projector for tenants use. \
      Additional facilities such as Discussion areas, Pantry, Surau and Sickroom are also available \
      on this floor are also available on this floor. <br>";
}

//====================================================mantrap
function mantrap(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/02/preview.html";
  launchFR.src = "./assets/iframes/floor1/02/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/mantrap.mp3');
    floorMap.style.display = "none";
  });
  previewMainTitle.innerHTML = "MANTRAP";

  if(screen.width > 800)
  previewMainTitle.style.paddingTop = "2vh";

  previewDescriptionBox.style.paddingTop = "10vh";
  previewDescriptionBox.style.paddingBottom = "10vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Mantrap</b> <br><br>\
      Ground Floor<br><br>\
      The bubble mantrap is the main access for all staff and tenants/visitors to the DC hall, \
      Disaster Recovery Room, Shared Workspace area and tenant offices. \
      The mantrap was designed to prevent any tailgating by having weight sensors with anti passback feature enabled by default. \
      Tenant/visitors will require secondary pass to gain access into the man trap. \
      All visitors to DC hall will be escorted with our own personnel.";
}

//====================================================Battery
function battery(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/03/preview.html";
  launchFR.src = "./assets/iframes/floor1/03/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/UPS.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "UPS BATTERY ROOM";

  if(screen.width > 800)
  previewMainTitle.style.paddingTop = "2vh";

  previewDescriptionBox.style.paddingTop = "8vh";
  previewDescriptionBox.style.paddingBottom = "8vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>UPS BATTERY ROOM</b> <br><br>\
      Ground Floor<br><br>\
      This is the dedicated room where the batteries used for the uninterruptible power supply (UPS) are compartmentalised. \
      These batteries provide up to 15 minutes of backup in the event of a power failure. \
      This room is equipped with a battery monitoring system that observes each  batteries  health, \
      along with a controlled environment to ensure optimum performance and maximum lifespan of the batteries. \
      Additional hydrogen sensors are put in place to detect any unwanted leaks from the batteries; \
      if there is such a leak, the exhaust system will automatically be triggered to extract the dangerous gas out \
      of the room. There are two battery rooms at each Data Centre floor to serve the redundant power supply.";
}

//====================================================4Tonne
function tonne(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/04/preview.html";
  launchFR.src = "./assets/iframes/floor1/04/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/CargoLift.mp3');
    floorMap.style.display = "none";
  });
  previewMainTitle.innerHTML = "DATA CENTRE <br>CARGO LIFT";

  previewMainTitle.style.paddingTop = "1vh";

  previewDescriptionBox.style.paddingTop = "8vh";
  previewDescriptionBox.style.paddingBottom = "8vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Data Centre Cargo Lift</b> <br><br>\
      Ground Floor - First Floor - Second Floor<br><br>\
      There are two data centre cargo lifts available here. \
      These are the biggest cargo lifts installed in data centres in Malaysia to date, supporting up to 4 \
      tonnes in weight and 2.8m in height (to fit 60U racks); these specifications are suitable for the high density, \
      hyper converged racks that are becoming more and more common nowadays.\
      The cargo lifts are strategically located within the delivery path, having direct access to both the \
      loading bay as well as the staging rooms, allowing smooth transportation of equipment and hardware.\
      <br> ";
}

//====================================================Buffer Tank
function buffertank(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/05/preview.html";
  launchFR.src = "./assets/iframes/floor1/05/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/CoolingPlant.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "COOLING PLANT BLOCK";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "2vh";
    previewMainTitle.style.fontSize = "0.9em"; 
  } else{
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
      <b>Cooling Plant Block</b> <br><br>\
      Ground Floor<br><br>\
      Critical equipment like water pumps, thermal buffer tanks, water cooled chillers that \
      are part of the Data Centre cooling system are housed in this room. \
      The design put in place will ensure that in the event of an interruption to \
      utility power, thermal storage tanks which provide up to 8 minutes of chilled water \
      at full IT load allows seamless ride-through for the cooling equipment to switch to diesel generator power. <br> ";
}

//====================================================Gensets
function gensets(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/06/preview.html";
  launchFR.src = "./assets/iframes/floor1/06/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/EPGenerators.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "EMERGENCY POWER GENERATORS";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
  } else{
    previewMainTitle.style.paddingTop = "0.6vh";
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
      <b>Emergency Power Generators</b> <br><br>\
      Ground Floor<br><br>\
      Dedicated Emergency Power Generators are utilised to provide backup power during utility failure. \
      The IT Load and the Cooling load are each supported by its own set of generators. \
      The generator design configuration are as follows: \
      <br> - IT Load N+2\
      <br> - Cooling Load N+1\
      <br> Foam type fire suppression system is being used in all emergency power generator rooms.\
      <br> ";
        }

//====================================================Exec Briefing
function execbriefing(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/07/preview.html";
  launchFR.src = "./assets/iframes/floor1/07/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/EBC.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "EXECUTIVE BRIEFING <br> CENTRE";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
  } else{
    previewMainTitle.style.paddingTop = "0.6vh";
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
      <b>Executive Briefing Centre (EBC)</b> <br><br>\
      Ground Floor<br><br>\
      The Executive Briefing Centre (EBC) is used to facilitate incident and problem management meetings \
      where it will be used primarily by the Data Centre operations team. \
      It will also be used to host our VIPs such as yourself during official site visits to the Data Centre.";
  }

  //====================================================commandcenter
function commandcenter(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/08/preview.html";
  launchFR.src = "./assets/iframes/floor1/08/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/DCCommand.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "DC COMMAND CENTRE";

  if(screen.width > 800)
  previewMainTitle.style.paddingTop = "2vh";

  previewDescriptionBox.style.paddingTop = "10vh";
  previewDescriptionBox.style.paddingBottom = "10vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>DC Command Centre</b> <br><br>\
      Ground Floor<br><br>\
      The command centre is manned 24 x 7 by our Data Centre operations personnel. \
      Dashboard displays on the wall are readings from a multitude of systems like the \
      Building Monitoring System and Data Centre Infrastructure Management System. \
      This will provide the operations team with the visibility on the DC critical equipments operational status such as , \
      temperature, humidity and etc.";
      }

  //====================================================loadingbay
  function loadingbay(){
    blackBG.style.display = "block";
    previewFrame.style.display = "block";
    previewTitleHolder.style.display = "block";
    previewFR.src = "./assets/iframes/floor1/09/preview.html";
    launchFR.src = "./assets/iframes/floor1/09/index.html";
  
    previewLaunchBtn.addEventListener("click", function(){
      blackBG.style.display = "none";
      previewFrame.style.display = "none";
      launchFR.style.display = "block";
      sidebarToggleBtn.click();
      previewTitleHolder.style.display = "none";
      //myAudio.pause();
      cs_change_music('./assets/iframes/audio/LoadingBay.mp3');
      floorMap.style.display = "none";
    });
    previewMainTitle.innerHTML = "LOADING BAY";

    if(screen.width > 800)
    previewMainTitle.style.paddingTop = "2vh";

    previewDescriptionBox.style.paddingTop = "10vh";
    previewDescriptionBox.style.paddingBottom = "10vh";


    previewClose.addEventListener("click", function(){
      blackBG.style.display = "none";
      previewFrame.style.display = "none";
      launchFR.style.display = "none";
      previewTitleHolder.style.display = "none";
    });
  
    descriptionText.innerHTML = " \
        <b>Loading Bay</b> <br><br>\
        Ground Floor<br><br>\
        This Loading bay was designed with two loading docks and each can receive 40-foot shipping container delivery. \
        To accommodate a variety of delivery truck sizes, we have also designed two hydraulic dock levellers which \
        will ensure a seamless delivery from the truck.";
  }


//====================================================security
function security(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor1/10/preview.html";
  launchFR.src = "./assets/iframes/floor1/10/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/DCGuardhouse.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "DATA CENTRE <br> GUARDHOUSE";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
  } else{
    previewMainTitle.style.paddingTop = "0.6vh";
  }


  previewDescriptionBox.style.paddingTop = "8vh";
  previewDescriptionBox.style.paddingBottom = "8vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Data Centre Guardhouse</b> <br><br>\
    Ground Floor<br><br>\
    Our Data Centres are designed with the highest security standard in the industry.\
    The main security checkpoint is manned 24x7 by security guards.\
    Visitors are required to pre-register using the Visitor Management System (VMS) in advance to gain access to the main administration block. Upon approval, pre-registered visitor will be provided with a QR code that will facilitate our contactless registration.\
    Visitors body temperature will also be captured via the TM ONE PASS system, where the details will be stored in the VMS. This is in-line with our ongoing efforts to make our facility a safer place to work.\
    ";
  }
