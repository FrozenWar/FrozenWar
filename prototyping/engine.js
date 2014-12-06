var engine = (function(exports){
	var MATCH = {
		set:'세팅',
		war:'전투',
		mov:'이동',
		def:'방어',
		non:'무능',
	}
	var status = 'set';
	var setlen = 0;

	function news(t){
		var o = {};
		var r = $('.info'+status+t);

		for(var i=0;i<r.length;i++){
			var e = $(r[i]);
			//console.log(e.val(), e.attr('placeholder'));
			var k = e.attr('placeholder');
			var v = e.val();
			if(v){
				o[k] = v;
			}
		}
		return o;
	}

	function newd(){
		var o = $('<div>');
		o.attr('class', 'item');

		setlen++;
		o.append($('<div class="w100"><input class="infoset'+setlen+' form-control" placeholder="name"></div>'));
		o.append($('<div class="w50"><input class="infoset'+setlen+' form-control" placeholder="num"></div>'));

		return o;
	}

	function set(){
		var items = [];
		var p = $('#set');
		if(!p)	return false;
		var il = p.children('.item');
		console.log(il);
		for(var i=0;i<il.length-1;i++){
			items.push(news(i));
		}
		return items;
	}

	function war(){
		var items = [];
		var p = $('#war');
		if(!p)	return false;
		var il = p.children('.item');
		console.log(il);
		for(var i=0;i<il.length-1;i++){
			items.push(news(i));
		}
		return items;
	}

	exports.update = function(){
		var a;
		switch(status){
			case 'set':
				a = set();
				break;
			case 'war':
				a = war();
				break;
		}
		if(a){
			$.ajax({
				url:'/calc',
				type:'POST',
				data:{
					status:status,
					content:hron.encode(a)
				},
				success:function(msg){
					if(msg.error)	throw false;
					$('#result').html(msg.content);
				}
			});
		}
	}

	exports.status = function(e){
		var target = $(e);

		if(target.attr('class') != 'disabled'){
			status = target.data('status');

			statusUpdate();
		}
	}

	exports.addset = function(){
		$('#set').append(newd());
	}

	function statusUpdate(){
		$('#status_result').html(MATCH[status]);

		events.throwEvent(function(e){
			infoc(e.content);
		}, 'change', status);
	}

	function infoc(e){
		if(!e) e = status;
		var c = $('.infoc');
		for(var i=0;i<c.length;i++){
			var t = $(c[i]);
			var ds = t.attr('id');
			if(ds==e){
				t.toggleClass('mienai', false);
			}else{
				t.toggleClass('mienai', true);
			}
		}
	}

	$(window).ready(function(){
		console.log('ready!');

		statusUpdate();
	});

	return exports;
})({});
