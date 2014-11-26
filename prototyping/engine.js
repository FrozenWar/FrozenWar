function war_update(){
	$.ajax({
		url:'/calc',
		type:'POST',
		data:{
			a:hron.encode({name:$('#A').val()}),
			b:hron.encode({name:$('#B').val()})
		},
		success:function(msg){
			$('#result').html(msg);
		}
	});
}

function init_update(){

}