//Main Menu Code For Jug and Gabriel
// audio
var tomipopup = true;
var audio = document.getElementById('audio1');
var box1= document.getElementById("menu");		
var btn_tech_anim = document.getElementById("btn_tech_popup");
var btn_contact_anim = document.getElementById("btn_contact_popup");
var btn_center_anim = document.getElementById("btn_center_content");
var sound_click_audio = document.getElementById('audioclick');
//fly position holder
var btn_flypos_holder = document.getElementById("fly_pos_menu");

document.getElementById("btn_tech").addEventListener("click", function(){
	sound_click_audio.play();

	audio.currentTime = 0;
	audio.pause();
	tomi_animation.src = "./texture/cm_play_btn_idle.png";
	tomipopup = false;	

	gsap.to(btn_center_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_center_anim.style.display = "none";

	btn_tech_anim.style.display = "block";
	gsap.to(btn_tech_anim, 0.75,{opacity:1,ease: Power1.easeOut});
});

document.getElementById("btn_tech_back").addEventListener("click", function(){
	sound_click_audio.play();
	gsap.to(btn_tech_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_tech_anim.style.display = "none";

	btn_center_anim.style.display = "block";
	gsap.to(btn_center_anim, 0.75,{opacity:1,ease: Power1.easeOut});
});

document.getElementById("btn_contact").addEventListener("click", function(){
	sound_click_audio.play();
	audio.currentTime = 0;
	audio.pause();
	tomipopup = false;	
	tomi_animation.src = "./texture/cm_play_btn_idle.png";

	gsap.to(btn_center_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_center_anim.style.display = "none";

	btn_contact_anim.style.display = "block";
	gsap.to(btn_contact_anim, 0.75,{opacity:1,ease: Power1.easeOut});
});

document.getElementById("btn_contact_back").addEventListener("click", function(){
	sound_click_audio.play();
	gsap.to(btn_contact_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_contact_anim.style.display = "none";

	btn_center_anim.style.display = "block";
	gsap.to(btn_center_anim, 0.75,{opacity:1,ease: Power1.easeOut});
});

var firstclick = false;
var tomi_animation = document.getElementById("tomiimg");

document.getElementById("btn_play").addEventListener("click", function(){
	sound_click_audio.play();
	if(firstclick == false){
		firstclick = true;
		tomi_animation.src = "./texture/animated3.gif";
		audio.play();
		tomipopup = true;
	}
	else if (firstclick == true){
		audio.currentTime = 0;
		audio.pause();
		tomi_animation.src = "./texture/cm_play_btn_idle.png";
		tomipopup = false;	
	}
});

document.getElementById("closetomi").addEventListener("click", function(){
	sound_click_audio.play();
	firstclick = false
	if(btn_flypos_holder != null){
		gsap.to(btn_flypos_holder, 0.5,{marginBottom:0,ease: Power1.easeOut});
	}
	audio.currentTime = 0;
	audio.pause();
	tomi_animation.src = "./texture/cm_play_btn_idle.png";
	tomipopup = false;

	document.getElementById("btn_char_holder").style.opacity = 1;
	gsap.to(box1, 0.3,{scale:0,ease: Power1.easeOut});
	setTimeout(function(){
		audio.currentTime = 0;
		audio.pause();
		document.getElementById("menu").style.opacity = 0;
		document.getElementById("menu-toggler").checked = false;
		document.getElementById("menu").style.zIndex="-20";
	}, 300);
});

document.getElementById("btn_char").addEventListener("click", function(){
	sound_click_audio.play();
	if(btn_flypos_holder != null){
		gsap.to(btn_flypos_holder, 0.5,{marginBottom:-150,ease: Power1.easeOut});
	}
	document.getElementById("menu").style.opacity = 1;
	document.getElementById("btn_char_holder").style.opacity = 0;
	document.getElementById("menu-toggler").checked = true;
	document.getElementById("menu").style.zIndex="6";

	gsap.to(btn_tech_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_tech_anim.style.display = "none";
	
	gsap.to(btn_contact_anim, 0.1,{opacity:0,ease: Power1.easeOut});
	btn_contact_anim.style.display = "none";

	btn_center_anim.style.display = "block";
	gsap.to(btn_center_anim, 0.75,{opacity:1,ease: Power1.easeOut});

	//tomi_animation.src = "./texture/animated3.gif";
	//audio.play();		
	setTimeout(function(){
		gsap.to(box1, 0.5,{scale:1,ease: Power1.easeOut});
	}, 100);
});

//Contact Form
document.getElementById('simple_form').onsubmit = function(){
	//console.log("m_name");
	//var m_name = $("#user_name").val();
	//var m_email = $("#user_email").val();
	//User_details(m_name, m_email);
	return false 
}

const submitButton = document.getElementById( 'btn_submitcontact' );
submitButton.addEventListener( 'click', function () {
	sound_click_audio.play();
	firstclick = false
	gsap.to(box1, 0.3,{scale:0,ease: Power1.easeOut});
	document.getElementById("btn_char_holder").style.opacity = 1;
	setTimeout(function(){
		audio.currentTime = 0;
		audio.pause();
		document.getElementById("menu").style.opacity = 0;
		document.getElementById("menu-toggler").checked = false;
		document.getElementById("menu").style.zIndex="-20";
	}, 300);
} );