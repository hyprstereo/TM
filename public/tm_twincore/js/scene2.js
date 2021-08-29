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
  previewFR.src = "./assets/iframes/floor2/01/preview.html";
  launchFR.src = "./assets/iframes/floor2/01/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/Future.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "TWIN CORE DATA CENTRE <br>FUTURE EXPANSION";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
    previewMainTitle.style.fontSize = "0.9em";
  } else{
    previewMainTitle.style.paddingTop = "0.8vh";
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
      <b>Twin Core Data Centre Future Expansion</b> <br><br>\
      First Floor<br><br>\
      The Twin Core Data Centres are designed to cater for future expansion of the Data Centre block. \
      This will ensure that our tenants will continue to have sufficient space to grow their future requirements \
      within the same facility which will provide a seamless connectivity.  <br>";
}

//====================================================mantrap
function mantrap(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/02/preview.html";
  launchFR.src = "./assets/iframes/floor2/02/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    cs_change_music('./assets/iframes/audio/CRAH.mp3');
    floorMap.style.display = "none";
  });
  previewMainTitle.innerHTML = "CRAH";

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
      <b>Data Centre Hall Computer Room Air Handler (CRAH) Room</b> <br><br>\
      First Floor<br><br>\
      This room houses the Computer Room Air Handler (CRAH) units and NOVEC1230 gas fire suppression \
      system which is dedicated per individual Data Centre hall. This room will also serve as a service \
      corridor for any maintenance works while ensuring zero access of the maintenance personnel in the Data Centre hall. \
      Our CRAH is designed with N+2 configuration. This provides a higher redundancy than the industry norm of N+1 for a \
      typical Tier III or Rated 3 Data Centre. <br>";
}

//====================================================BUSINESS SUITE
function battery(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/03/preview.html";
  launchFR.src = "./assets/iframes/floor2/03/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/BusinessSuite.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "BUSINESS SUITE";

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
      <b>Business Suite</b> <br><br>\
      First Floor<br><br><br>\
      At our Twin Core Data Centres, we prepared Business Suites area where our Data Centre tenants can rent \
      and customise space according to their needs. This can range from their Command Centre, Network Operations Centre, \
      Disaster Recovery Centre or a remote office space for their operations staff. <br>\
       ";
}

//====================================================DR
function tonne(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/04/preview.html";
  launchFR.src = "./assets/iframes/floor2/04/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/DisasterR.mp3');
    floorMap.style.display = "none";
  });
  previewMainTitle.innerHTML = "DISASTER RECOVERY <br> ROOM";

  if(screen.width > 800)
  previewMainTitle.style.paddingTop = "1vh";

  previewDescriptionBox.style.paddingTop = "10vh";
  previewDescriptionBox.style.paddingBottom = "10vh";

  previewClose.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "none";
    previewTitleHolder.style.display = "none";
  });

  descriptionText.innerHTML = " \
      <b>Disaster Recovery Room</b> <br><br>\
      First Floor<br><br>\
      The Disaster Recovery Room is designed for customers to run their planned Disaster \
      Recovery (DR)/Business Continuity simulations where standard amenities are provided. \
      Optional facilities such as desktop/notebook, printer, telephony system. \
      A cross connect to the tenant’s rack in the data hall are also available. <br> ";
}

//====================================================Tenant
function buffertank(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/05/preview.html";
  launchFR.src = "./assets/iframes/floor2/05/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/Pantry.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "TENANT PANTRY";

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
      <b>Tenant Pantry</b> <br><br>\
      First Floor<br><br>\
      The pantry area is for the use of our Business Suite/DR Workspace tenants. \
      It is designed next to Business Suites/DR workspace for the convenience of our tenants \
      while working at the Data Centre. <br> ";
}

//====================================================DC Block
function gensets(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/06/preview.html";
  launchFR.src = "./assets/iframes/floor2/06/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/DCBlock.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "DATA CENTRE BLOCK CORRIDOR";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
  }else{
    previewMainTitle.style.paddingTop = "0.8vh";
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
      <b>Data Centre block corridor</b> <br><br>\
      First Floor<br><br>\
      This is the ring corridor of the Data Centre block where services serving the Data \
      Centre halls are designed to run along the corridor. The doors into respective Data Centre halls \
      allow for a 60U to be rolled in without any obstruction and for any higher racks, we have built in roller \
      shutter to ensure that the Data Centre remains future proof in design. <br> ";
      }

//====================================================MMR
function execbriefing(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/07/preview.html";
  launchFR.src = "./assets/iframes/floor2/07/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/MMR.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "MEET ME ROOM (MMR)";

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
      <b>Meet Me Room (MMR)</b> <br><br>\
      First Floor<br><br>\
      This room houses patch panel racks that facilitates the cross connect between the \
      telecommunication services provider to the end customers. This is a secured room and only \
      accessible by TM ONE authorised staff for any cross connect provisioning.<br> ";
  }

  //====================================================staging
function commandcenter(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/08/preview.html";
  launchFR.src = "./assets/iframes/floor2/08/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/Staging.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "STAGING ROOM";

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
      <b>Staging Room</b> <br><br>\
      First Floor<br><br>\
      Our Twin Core Data Centre policy follows international best practices of not allowing equipment \
      and deliveries to be unboxed in the Data Centre hall. This ensures that there is no contaminants \
      introduced into the Data Centre hall and also reduces any potential fire hazard risks.  \
      At each floor of our Data Centre, we provide staging rooms for our tenants, which  can reserved \
      for use for the purpose of unboxing equipment and performing the necessary equipment burn-in test \
      before moving the equipment and racks into the Data Centre hall. ";
    }

  //====================================================DC hall
  function loadingbay(){
    blackBG.style.display = "block";
    previewFrame.style.display = "block";
    previewTitleHolder.style.display = "block";
    previewFR.src = "./assets/iframes/floor2/09/preview.html";
    launchFR.src = "./assets/iframes/floor2/09/index.html";
  
    previewLaunchBtn.addEventListener("click", function(){
      blackBG.style.display = "none";
      previewFrame.style.display = "none";
      launchFR.style.display = "block";
      sidebarToggleBtn.click();
      previewTitleHolder.style.display = "none";
      cs_change_music('./assets/iframes/audio/DCHall.mp3');
      floorMap.style.display = "none";
    });
    previewMainTitle.innerHTML = "DATA CENTRE HALL";

    if(screen.width > 800)
    previewMainTitle.style.paddingTop = "2vh";

    previewDescriptionBox.style.paddingTop = "4vh";
    previewDescriptionBox.style.paddingBottom = "4vh";

    previewClose.addEventListener("click", function(){
      blackBG.style.display = "none";
      previewFrame.style.display = "none";
      launchFR.style.display = "none";
      previewTitleHolder.style.display = "none";
    });
  
    descriptionText.innerHTML = " \
        <b>Data Centre Hall</b> <br><br>\
        First Floor<br><br>\
        The Data Centre hall is an open white space to house customer equipment racks. \
        It is based on a cold-aisle and hot-aisle set up where each rack have been designed for \
        average of 5kW power and cooling. The Data Centre hall have raised floor setup of 1 metre high \
        and with a slab to slab height of 6.4 metres. Our data centre hall is adequate to support racks up to \
        60U making it  futureproof to accept the next generation of hyper converged computing requirements. \
        Hanging down from the unistruct above the white space is the temperature and humidity \
        sensors where it will be connected to our Building Management System (BMS) or Data Centre \
        Infrastructure Management (DCIM) where the monitoring of the respective Data Centre hall will be \
        showin the respective dashboard in the Command Centre. The NOVEC1230 gas fire suppression system is \
        also used here due to its lower release pressure that minimises equipment and hard disk damage in the \
        event it discharges during a fire event.<br>";
  }


//====================================================security
function security(){
  blackBG.style.display = "block";
  previewFrame.style.display = "block";
  previewTitleHolder.style.display = "block";
  previewFR.src = "./assets/iframes/floor2/10/preview.html";
  launchFR.src = "./assets/iframes/floor2/10/index.html";

  previewLaunchBtn.addEventListener("click", function(){
    blackBG.style.display = "none";
    previewFrame.style.display = "none";
    launchFR.style.display = "block";
    sidebarToggleBtn.click();
    previewTitleHolder.style.display = "none";
    //myAudio.pause();
    cs_change_music('./assets/iframes/audio/LV.mp3');
    floorMap.style.display = "none";
  });

  previewMainTitle.innerHTML = "LOW VOLTAGE (LV) <br> ELECTRICAL ROOM";

  if(screen.width > 800){
    previewMainTitle.style.paddingTop = "1vh";
    previewMainTitle.style.fontSize = "0.9em";
  } else{
    previewMainTitle.style.paddingTop = "0.8vh";
    previewMainTitle.style.fontSize = "0.5em";
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
      <b>Low Voltage (LV) Electrical Room</b> <br><br>\
      First Floor<br><br>\
      The Low Voltage (LV) Electrical Room houses LV main switchboard, Distribution boards, \
      Isolation transformers and Uninterruptible Power Supply (UPS). Our UPS system is designed \
      based on 2N design which is a Tier IV feature (Fault Tolerant). Each Data Centre floor will \
      have two independent LV rooms to ensure compartmentalisation of the systems. \
      This was designed in such a fashion as we understand the criticality of ensuring the \
      continuous power the customer racks during power interruption from the utility provider. ";
  }
