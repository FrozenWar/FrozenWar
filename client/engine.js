var socket = (function(exports){
	var so;

	exports.init = function(src){
		so = io(info.get('host'));

		so.on('ppp', function(data){
			console.log(data);

			so.emit('hello', {pony:'pedo'});
		});
	}

	return exports;
})({});

var info = (function(exports){
	$.ajax({
		url:'https://kkiro.kr/frozenwar/transport/info.json',
		success:function(msg){
			INFO = msg;
		}
	});

	var INFO;

	exports.get = function(e){
		if(e){
			r = INFO[e];
		}else
			r = INFO;
		return r;
	}

	return exports;
})({});
