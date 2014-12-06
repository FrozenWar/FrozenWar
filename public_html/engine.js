var socket = (function(exports){
	exports.isSupported = function(){
		return ('WebSocket' in window);
	}

	var so;

	exports.init = function(src){
		if(!exports.isSupported) return false;
		so = new WebSocket(src);

		so.onmessage = function(e){
			console.log(e);
		}

		so.onopen = function(e){
			console.log("opened");
		}

		so.onclose = function(e){
			console.log("closed");
		}

		so.onerror = function(e){
			console.log(e);
		}
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
