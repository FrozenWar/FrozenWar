var events = (function(exports){
	var events = {};

	exports.on	= function(t, cb){
		if(t in events) return false;

		events[t]	= cb;
		return true;
	};

	exports.dispatchEvent	= function(t, args, err){
		if(t in events){
			setTimeout(events[t], 0, exports.newEvent(t, args, err));
		}
	};

	exports.newEvent	= function(t, args, err){
		return {
			type:t,
			content:args,
			error:err
		}
	}

	exports.throwEvent	= function(cb, t, args, err){
		if(cb == undefined)
			exports.dispatchEvent(t, args, err);
		else
			cb(exports.newEvent(t, args, err));
	}
	return exports;
})(typeof module!='undefined'?module.exports:{});
