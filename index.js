var express = require('express');
var multer = require('multer');
var fs = require('fs');
var app = express();
var io = require('socket.io')(8822);
var upload = multer({
  dest: './upload'
})

var quene = {
	size:2,
	data:[],
	add:function(name){
		if(this.data.length < this.size){
			this.data.push(name);
		}else{
			for(var i = 0;i < this.size-1;i++){
				this.data[i] = this.data[i+1]
			}
			this.data[i] = name;
		}
	}
};

app.use(upload.any())
app.use('/public', express.static('public'));
app.use('/upload', express.static('upload'));
app.get('/', (req, res) => res.sendFile( __dirname + "/" + "index.html" ))
app.get('/play', (req, res) => res.sendFile( __dirname + "/" + "play.html" ))
app.listen(8282, () => console.log('Example app listening on port 8282!'))
app.post('/upload', (req, res, next) => {
	var des_file = __dirname + "\\upload\\" + req.files[0].originalname;
	fs.readFile(req.files[0].path, function (err, data) {
		fs.writeFile(des_file,data, function (err) {
			if( err ){
				console.log( err );
			}else{
				fs.unlink(req.files[0].path,function(err){
				})
				quene.add(req.files[0].originalname);
					console.log(quene.data);
			}
		});
	});
})

let play = null;
io.on('connection',function(socket){
	console.log("connection",socket.id);
	socket.join('Room',()=>{
		let rooms = Object.keys(socket.rooms);
    	console.log(rooms);
	});
	socket.on('onPlay',function(data){
		if(play == null){
			console.log("onPlay",socket.id);
			play = socket.id;
			socket.on('Playing',function(data){
				io.binary(true).to("Room").emit('Playing',data);
			});
		}
	})
	socket.on('disconnect',function(){
		if(socket.id == play){
			console.log("DisPlay",play);
			play = null;
		}else{
			console.log("disconnect",socket.id);
		}
	})
});
