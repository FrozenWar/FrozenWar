(function(){
	var MATCH = {
		"hp":"체력","atk":"전투력","def":"방어력","spd":"기동력","msp":"마력소모치","mn":"마력",rng:'사거리','type':''
	};

	function toString(o){
		var a = [];
		for(k in o){
			if(typeof o[k] == 'object'){
				if(o[k][1] == 0)
					a.push(MATCH[k] + ':' + o[k][0]);
				else
					a.push(MATCH[k] + ':' + o[k][0]+'~'+(o[k][0]+o[k][1]));
			}
			else{
				if(k != 'name' && MATCH[k]!=undefined){
					if(MATCH[k] == '')
						a.push(o[k]);
					else
						a.push(MATCH[k] + ':' + o[k]);
				}
			}
		}
		return '<b>' + o['name'] + '</b> ' + a.join(', ');
	}

	var fs = require('fs');
	fs.readFile('units.json', 'utf-8', function(err, data){
		if(err) throw (err);
		var u = JSON.parse(data).units;

		function news(n, hp, mn){
			if(!u[n]) return undefined;
			var p = {name:n};
			var o = u[n];
			for(k in o){
				p[k] = o[k];
			}
			if(typeof p.atk == 'number')
				p.atk = [p.atk, 0];
			else
				p.atk = [p.atk[0], p.atk[1]-p.atk[0]];

			p.type = p.rng ? '원거리유닛' : '근거리유닛';

			if(hp)	p.hp = Math.min( parseInt(hp), p.hp );
			if(mn)	p.mn = Math.min( parseInt(mn), p.mn );

			return p;
		}

		function op(a, b){
			var r = Math.max(0,
				Math.floor(
					(a.atk[0]+Math.random()*a.atk[1])	//전투력
						*
					a.mn/u[a.name].mn		// 마력
				)
					-
				b.def		// 방어력
			);
			b.hp -= r;
			return r;
		}

		function calc(o){
			var n1 = o.a.split('|');
			var n2 = o.b.split('|');

			var p1 = news(n1[0], n1[1], n1[2]);
			var p2 = news(n2[0], n2[1], n2[2]);

			if(p1&&p2){

				console.log(p1, p2);

				var r = '';
				r += '<div>';
				r += toString(p1) + '</br>' +  toString(p2);
				r += '</div>';
				r += '<p>';
				r += p2.name + ', <b>' + op(p1, p2) + '</b>만큼 피해!';
				if(p1.type == '근거리유닛'){
					r += '</br>';
					r += p1.name + ', <b>' + op(p2, p1) + '</b>만큼 피해!';
				}
				r += '</p>';
				r += '<div>';
				if(p1.hp<0) r+='<strike>';
				r += toString(p1);
				if(p1.hp<0) r+='</strike><b style="color:red;">사망</b>';
				r += '</br>';
				if(p2.hp<0) r+='<strike>';
				r += toString(p2);
				if(p2.hp<0) r+='</strike><b style="color:red;">사망</b>';
				r += '</div>';

				return r;
			}
			return 'fail';
		}

		var express	 = require('express');
		var app		 = express();
		var http	 = require('http').Server(app);

		app.use('/', express.static(__dirname));
		app.get('/calc', function(req, res){
			console.log( req.query );

			res.send(calc(req.query));
		});

		app.listen(5001, function(){
			console.log('ready!');
		});
	});
})();
