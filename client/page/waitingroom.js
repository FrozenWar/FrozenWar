var waitingroom = (function(exports){
    var raw_chatbox = $('#chatbox').html();

    socket.ready();

    var isSend = false;

    $('#waitingroom #input').on('keydown', function(e){
        if(e.keyCode == 13){
            console.log(e.shiftKey);
            if(e.shiftKey){

            }else{
                var target = $(e.target);

                socket.chat( target.val() );
                isSend = true;
                $(e.target).val('');
            }
        }
    });
    $('#waitingroom #input').on('keyup', function(e){
        if(isSend){
            $(e.target).val('');
            isSend = false;
        }
        $('#waitingroom #input').css('height', 'auto');
        //$('#waitingroom #input').innerHeight($('#waitingroom #input').prop('scrollHeight'));
    });

    function chat(msg){
        var chatbox = $(raw_chatbox);

        chatbox.children('.nickname').html(msg.nickname);
        chatbox.children('.content').html(msg.content.replace(/\n/g, '</br>'));

        $('#waitingroom #left').append(chatbox);

        if($('#waitingroom #left').scrollTop() >= $('#waitingroom #left').prop('scrollHeight')-700)
            $('#waitingroom #left').scrollTop($('#waitingroom #left').prop('scrollHeight'));
    }

    exports.chat = chat;

    return exports;
})({});
