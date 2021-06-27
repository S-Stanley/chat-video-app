const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3030;
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	// res.render('room');
	res.redirect(`/${uuidv4()}`)
});

app.get('/:room', (req, res) => {
	res.render('room', {roomId: req.params.room})
});

io.on('connection', socket => {
	socket.on('join-room', (room_id, user_id) => {
		console.log(room_id, user_id);
		socket.join(room_id);
		socket.to(room_id).emit('user-connected', user_id);

		socket.on('disconnect', () => {
			socket.to(room_id).emit('user_disconnected', user_id);
		})
	});
})

server.listen(port, function(){
	console.log('Listening on ', port);
});