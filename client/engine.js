var room = (function(exports){
	var name;
	var clients;

	exports.update = function(r){
		if(!pag.c('waitingroom')) return false;

		name	 = r.name;
		clients	 = r.clients.concat();
		console.info(name, '에 들어감');

		$('#right').children().remove();
		for(i in clients){
			var c = clients[i];
			var s = $('<span>');
			var d = $('<div>');

			s.addClass('ecomp');
			s.attr('data-status', 'online');

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
		if(so) return true;
		so = io(inf.o('host'));

		//handshake, 도메인, 클라이언트ID
		so.on('handshake', function(data){
			console.log(data);

			inf.o('nick', 'Lolita_'+Math.random().toFixed(4));
			so.emit('nickname', inf.o('nick'), function(){});
			inf.o('roomid', 'test');
			so.emit('roomConnect', inf.o('roomid'), function(d){
				room.update(d);
			});
		});
		//roomUpdate, 방정보
		so.on('roomUpdate', function(r){
			console.log('roomUpdate', r);

			room.update(r);
		});
		//chat, 클라이언트, 값
		so.on('chat', function(c, v){
			console.log('chat', c,v);
		});
		//startSession, 세션정보, 플레이어아이디
		so.on('startSession', function(s, pi){
			console.log('startSession', s, pi);
		});
		//err, 에러내용
		so.on('err', function(e){
			console.log('err', e);
		});
		//turnUpdate, 턴데이터
		so.on('turnUpdate', function(td){
			console.log('turnUpdate', td);
		});
		//turnOrder, 턴순서, 턴번호
		so.on('turnOrder', function(i, n){
			console.log('turnOrder', i,n);
		});
	}

	return exports;
})({});

var pag = (function(exports){
	var cb;

	exports.e = function(id, scripts){
		$.ajax({
			url:'./page/'+id+'.html',
			success:function(msg){
				currentPage = id;

				$('#page').html(msg);
				for(var k in scripts){
					var d = $('<script>');
					d.attr('type', 'text/javascript');
					d.attr('src', '/page/'+scripts[k]+'.js');
					$('#page').append(d);
				}

				if(cb)
					cb({
						page:id,
						type:'ready',
					});
			}
		});
	}

	exports.ready = function(_){
		cb = _;
	}

	var currentPage;

	exports.c = function(){
		return currentPage;
	}

	return exports;
})({});

var inf = (function(exports){

	var INFO = {};

	/*Default*/
	INFO['host'] = 'http://localhost:8000/';

	exports.load = function(cb){
		$.ajax({
			url:'./server.json',
			success:function(path){
				console.info('[SERVER]', path);
				INFO['host'] = path;
				if(cb) cb();
			}
		});
	}
	
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
	inf.load(function(){
		pag.ready(function(e){
			console.info('[PAGE]', e.page);
		});

		$.ajax({
			url:inf.o('host')+'shared/urls.json',
			success:function(urls){
				// base.js를 맨 처음에 불러옴
				urls.unshift('base.js');
				function loadNext(){
					var current = urls.shift();
					if(!current){
						pag.e('waitingroom', ['waitingroom']);
						return;
					}
					$.getScript(inf.o('host')+'shared/'+current, function(){
						if(!domain){
							domain = new Domain();
						}
						// 함수 스택 오버플로 안시키려면 필요함
						setTimeout(loadNext, 0);
					});
				}
				loadNext();
			}
		});
	});
}
