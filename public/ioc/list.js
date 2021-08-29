export async function loadTrayUI(is = undefined) {
    const iocScene = is;
	// var data = {
	// 	ioc: {
	// 		label: 'IOC',
	// 		items: [
	// 			{
	// 				label: 'Virtual Integrated Operations Centre - Welcome',
	// 				data: 'ioc_0'
	// 			},
	// 			{
	// 				label: 'General Benefits',
	// 				data: 'ioc_1'
	// 			},
	// 			{
	// 				label: 'Introduction',
	// 				data: 'ioc_2'
	// 			},
	// 			{
	// 				label: 'Smart Security & Surveillance (Proactive)',
	// 				data: 'ioc_3'
	// 			},
	// 			{
	// 				label: 'Smart Security & Surveillance (Reactive)',
	// 				data: 'ioc_4'
	// 			},
	// 			{
	// 				label: 'Smart Traffic Lights (Proactive)',
	// 				data: 'ioc_5'
	// 			},
	// 			{
	// 				label: 'Smart Traffic Lights (Reactive)',
	// 				data: 'ioc_6'
	// 			},
	// 			{
	// 				label: 'Smart Building (Proactive)',
	// 				data: 'ioc_7'
	// 			},
	// 			{
	// 				label: `SMART Services - Smart Building (Reactive)`,
	// 				data: 'ioc_8'
	// 			},
	// 			{
	// 				label: `WAN - Connectivity (Proactive)`,
	// 				data: `ioc_9`
	// 			},
	// 			{
	// 				label: `WAN - ICT(Proactive)`,
	// 				data: `ioc_10`
	// 			},
	// 			{
	// 				label: `WAN - Product (Reactive)`,
	// 				data: `ioc_11`
	// 			}
	// 		]
	// 	},
	// 	cyber: {
	// 		label: 'Cyber Security',
	// 		items: [
	// 			{
	// 				label: 'CYDEC - Take control',
	// 				data: 'ioc0'
	// 			},
	// 			{
	// 				label: `Introduction`
	// 			},
	// 			{
	// 				label: ` Threat Landscape`,
	// 			},
	// 			{
	// 				label : `Identify the Threat`	
	// 			},
	// 			{
	// 				label: `Stop the spread`
	// 			},
	// 			{
	// 				label: `Tell us about you!`,
	// 			},
	// 			{
	// 				label: `CYDEC for BDM`,
	// 			},
	// 			{
	// 				label: `Case Studies`,
	// 			},
	// 			{
	// 				label: `FEEDS Analyse`,
	// 			},
	// 			{
	// 				label: `Findings & Actions`
	// 			},
	// 			{
	// 				label: `Persistent Threats`,
	// 			},
	// 			{
	// 				label: `Persistent Threats Secured `
	// 			},
	// 			{
	// 				label: `Conclusion`
	// 			}
	// 		]
	// 	},
		
	// }
	const data = await fetch('./list_ioc.json').then(d=>d.json());
	var trayUI = TrayUI.init(document.body);
	// trayUI.header.innerHTML = `
	// <div style="display:inline-flex;width: 100%;"><a style="margin-right:2rem;position:relative;" href="#"><i class="material-icons">west</i></a>
	// <span>TM IOC / Cybersecurity</span>
	// </div>
	// `
	trayUI.title('Virtual Integrated Operations Centre')
	trayUI.setMode('compact');
	trayUI.show();
	//trayUI.title("TM EXR TRAY UI");


	var playlist = trayUI.createPlaylist(data);
	
	playlist.on('itemselect', function (item) {
        //iocScene.nextVideo(parseInt(item.data.split('_')[1]));
        controller.title(item.label);
       // controller._playState(true);
		console.log(item.label, item.data);
	});

	playlist.refresh();

	var controller = playlist.createController();
	controller.globalDetect(true);
	controller.title('')
	
	controller.on('click', function (id) {
		switch (id) {
			case 'list':
				trayUI.toggleCompact();
				break;
			case 'play':
				break;
			case 'replay':
				controller.playAudio('/audio/mainmap/1.mp3');
				break;
		}
		console.log(id);
	})

	return trayUI;
}