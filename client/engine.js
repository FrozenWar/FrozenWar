var room = (function(exports){
	var name;
	var clients;

	exports.enter = function(r){
		name	 = r.name;
		clients	 = r.clients.concat();
		console.info(name, '에 들어감');
	}

	exports.draw_ulist = function(){
		if(!pag.c('waitingroom')) return false;

		$('#right').children().remove();
		for(i in clients){
			var c = clients[i];
			var s = $('<span>');
			var d = $('<div>');

			s.addClass('ecomp');
			s.attr('data-type', 'online');

			d.addClass('ecomp');
			d.data('id', c.id);
			d.append(s);
			d.append(c.nickname + ' ['+c.id+']');

			$('#right').append(d);
		}
	}

	return exports;
})({});

var socket = (function(exports){
	var so;

	exports.ready = function(){
		so = io(inf.o('host'));

		//handshake, 도메인, 클라이언트ID
		so.on('handshake', function(data){
			console.log(data);

			inf.o('nick', '익명'+Math.random().toFixed(4));
			so.emit('nickname', inf.o('nick'), function(){});
			inf.o('roomid', 'test');
			so.emit('roomConnect', inf.o('roomid'), function(d){
				room.enter(d);
			});
		});
		//roomUpdate, 방정보
		so.on('roomUpdate', function(r){
			console.log(r);
		});
		//chat, 클라이언트, 값
		so.on('chat', function(c, v){
			console.log(c,v);
		});
		//startSession, 세션정보, 플레이어아이디
		so.on('startSession', function(s, pi){
			console.log(s, pi);
		});
		//err, 에러내용
		so.on('err', function(e){
			console.log(e);
		});
		//turnUpdate, 턴데이터
		so.on('turnUpdate', function(td){
			console.log(td);
		});
		//turnOrder, 턴순서, 턴번호
		so.on('turnOrder', function(i, n){
			console.log(i,n);
		});
	}

	return exports;
})({});

var pag = (function(exports){
	exports.e = function(id){
		$.ajax({
			url:'./page/'+id+'.html',
			success:function(msg){
				currentPage = id;
				$('#page').html(msg);
			}
		});
	}

	var currentPage;

	exports.c = function(){
		return currentPage;
	}

	return exports;
})({});

var inf = (function(exports){
	/*$.ajax({
		url:'https://kkiro.kr/frozenwar/transport/info.json',
		success:function(msg){
			INFO = msg;
		}
	});*/

	var INFO = {};

	/*KARI*/
	INFO['host'] = 'http://kkiro.kr:8000/';

	exports.o = function(e, a){
		if(e){
			if(a)
				INFO[e] = a;
			else
				r = INFO[e];
		}else
			r = INFO;
		return r;
	}

	return exports;
})({});
var domain;

window.onload = function(){
	domain = new Domain();

	$.ajax({
		url:'http://kkiro.kr:8000/js/urls.json',
		success:function(urls){

			for(k in urls){
				console.log(inf.o('host')+'js/'+urls[k]);
				var q = $('<script>');
				q.attr('src', inf.o('host')+'js/'+urls[k]);
				$('head').append(q);
			}
			pag.e('waitingroom');
		}
	});
}
