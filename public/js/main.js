

// Initialize Database
var config = {
  apiKey: "AIzaSyANIN_3xoPo0CWZrci9LhcN0cEue1SR-rA",
  authDomain: "tm-one-415f4.firebaseapp.com",
  databaseURL: "https://tm-one-415f4.firebaseio.com",
  projectId: "tm-one-415f4",
  storageBucket: "tm-one-415f4.appspot.com",
  messagingSenderId: "450348745615",
  appId: "1:450348745615:web:dc2ef98e8397777f0781fa",
  measurementId: "G-BFD0CX5H82"
};
firebase.initializeApp(config);

var database = firebase.database();


function checkDatabase(){
    database.ref('/').once('value', function(snapshot){
      console.log(snapshot.val());
    });

    var rootRef = database.ref('/');

    rootRef.once('value', function(snapshot){
      console.log(snapshot.val());
    });
}


var userip;
$(document).ready(function () {
    $.getJSON("https://jsonip.com/?callback=?", function (data) {
        userip = data.ip;
    });
});

function pushData(){
  var data = document.getElementById("dataValue").value;
  var dataRef = database.ref('/username').push();
    
  dataRef.set({
    user: userip,
    value: data
  });
}

function Benefits_agility(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/agility/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_competition(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/competition/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_cost(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/cost/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_enablement(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/enablement/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_futureproof(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/futureproof/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_inovation(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/inovation/').push();
  dataRef.set({
    user: userip
  });
}

function Benefits_security(){
  var dataRef = database.ref('user_selection/CloudMigrationBenefits/security/').push();
  dataRef.set({
    user: userip
  });
}

function User_Name(){
  var dataRef = database.ref('user_selection/UserDetails/username/').push();
  dataRef.set({
    name: 'test'
  });
}

// function User_details(m_name, m_email){
//   console.log("whatever");

//     console.log(m_email);
//     console.log(m_name);
    

//     var today = new Date();
//     var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

//     var today = new Date();
//     var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

//     var datetime = date + ' ' + time;
  
//     if(m_name != null && m_email != null){
//       var dataRef = database.ref('user_selection/UserDetails/').push();

//       dataRef.set({
//         name : m_name,
//         email : m_email,
//         time : datetime 
//       });
//     }


// }

function User_details(m_name, m_email){
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var datetime = date + ' ' + time;

  if(m_name != null && m_email != null){
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://www.tmone.link/l/502671/2021-07-13/7br4lr", true);
      xhr.onload = ()=>{
          if(xhr.readyState === XMLHttpRequest.DONE){
              if(xhr.status === 200){
                  let data = xhr.response;
                  //console.log(data);
                  window.location = "https://www.tmone.com.my/thank-you/";
              }
          }
      }
      let formData = new FormData();
      formData.append('full_name', m_name);
      formData.append('email', m_email);
      xhr.send(formData);
  }
}



function setData(){
  var data = document.getElementById("dataValue").value;
  var dataRef = database.ref('/setData');
  console.log(data)
  dataRef.set({
    value: data
  });
}


function getchildcount(){
    var rootRef = database.ref('user_selection/');
    rootRef.once('value', function(snapshot){
        var agility = snapshot.child("CloudMigrationBenefits/agility").numChildren();
        var competition = snapshot.child("CloudMigrationBenefits/competition").numChildren();
        var cost = snapshot.child("CloudMigrationBenefits/cost").numChildren();
        var enablement = snapshot.child("CloudMigrationBenefits/enablement").numChildren();
        var futureproof = snapshot.child("CloudMigrationBenefits/futureproof").numChildren();
        var inovation = snapshot.child("CloudMigrationBenefits/inovation").numChildren();
        var security = snapshot.child("CloudMigrationBenefits/security").numChildren();
        
        var refactoring = snapshot.child("CloudMigrationSolutions/refactoring").numChildren();
        var rehosting = snapshot.child("CloudMigrationSolutions/rehosting").numChildren();
        var relocate = snapshot.child("CloudMigrationSolutions/relocate").numChildren();
        var replatforming = snapshot.child("CloudMigrationSolutions/replatforming").numChildren();
        var repurchasing = snapshot.child("CloudMigrationSolutions/repurchasing").numChildren();
        var retain = snapshot.child("CloudMigrationSolutions/retain").numChildren();
        var retire = snapshot.child("CloudMigrationSolutions/retire").numChildren();
        
        document.getElementById("agility").innerHTML = agility;
        document.getElementById("competition").innerHTML = competition;
        document.getElementById("cost").innerHTML = cost;
        document.getElementById("enablement").innerHTML = enablement;
        document.getElementById("futureproof").innerHTML = futureproof;
        document.getElementById("inovation").innerHTML = inovation;
        document.getElementById("security").innerHTML = security;
        
        document.getElementById("refactoring").innerHTML = refactoring;
        document.getElementById("rehosting").innerHTML = rehosting;
        document.getElementById("relocate").innerHTML = relocate;
        document.getElementById("replatforming").innerHTML = replatforming;
        document.getElementById("repurchasing").innerHTML = repurchasing;
        document.getElementById("retain").innerHTML = retain;
        document.getElementById("retire").innerHTML = retire;
    });
}

function setData(){
setDataRef = database.ref("/setData");
setDataRef.on('child_changed', function(snapshot) {
  console.log("Below is the data from child_changed");
  console.log(snapshot.val());
});

pushDataRef = database.ref("/pushData");
pushDataRef.on("child_added", function(snapshot){
  console.log("Below is the data from child_added");
  console.log(snapshot.val());
});

database.ref('/pushData').once('value', function(snapshot){
  snapshot.forEach(function(data){
    console.log("Below are the child keys of the values in 'pushData'")
    console.log(data.key);
  });
  console.log(Object.keys(snapshot.val()));
});
}



function Solutions_retain(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/retain/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_retire(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/retire/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_refactoring(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/refactoring/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_relocate(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/relocate/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_rehosting(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/rehosting/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_replatforming(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/replatforming/').push();
  dataRef.set({
    user: userip
  });
}

function Solutions_repurchasing(){
  var dataRef = database.ref('user_selection/CloudMigrationSolutions/repurchasing/').push();
  dataRef.set({
    user: userip
  });
}



