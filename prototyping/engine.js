var engine = (function(exports){
	var MATCH = {
		set:'세팅',
		war:'전투',
		mov:'이동',
		def:'방어',
		non:'무능',
	}
	var status = 'war';

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

	exports.update = function(){
		var items = [];
		var p = infoc(status, true);
		if(!p)	return false;
		var il = p.children('.item');
		console.log(il);
		for(var i=0;i<il.length-1;i++){
			items.push(news(i));
		}
		console.log(items);

		$.ajax({
			url:'/calc',
			type:'POST',
			data:{
				status:status,
				content:hron.encode(items)
			},
			success:function(msg){
				if(msg.error)	throw false;
				$('#result').html(msg.content);
			}
		});
	}

	exports.status = function(e){
		var target = $(e);

		if(target.attr('class') != 'disabled'){
			status = target.data('status');

			statusUpdate();
		}
	}

	function statusUpdate(){
		$('#status_result').html(MATCH[status]);

		events.throwEvent(function(e){
			infoc(e.content);
		}, 'change', status);
	}

	function infoc(e, g){
		if(!e) e = status;
		var c = $('.infoc');
		for(var i=0;i<c.length;i++){
			var t = $(c[i]);
			var ds = t.data('status');
			if(ds==e){
				if(g)
					return t;
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
