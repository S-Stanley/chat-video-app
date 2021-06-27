console.log(ROOM_ID)

const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001',
});

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true,
}).then(stream => {
	addVideoStream(myVideo, stream);
	const video = document.createElement('video');
	myPeer.on('call', call => {
		call.answer(stream);
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		})
	})

	socket.on('user-connected', user_id => {
		connectedToNewUser(user_id, stream);
	})
})

myPeer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id);
})

socket.on('user-connected', user_id => {
	console.log('user connected ', user_id);
});

socket.on('user_disconnected', user_id => {
	console.log('*******');
	console.log(user_id);
	console.log(peers);
	if (peers[user_id]){
		peers[user_id].close(); 
	}
})


function addVideoStream(video, stream){
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
	videoGrid.append(video);
}

function connectedToNewUser(uid, stream){
	const call = myPeer.call(uid, stream);
	const video = document.createElement('video');
	call.on('stream', userVideoStream => {
		addVideoStream(video,  userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});
	peers[uid] = call;
}