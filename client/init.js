var path = '/js/';
var loadCount = 0;
var domain;
var module = {exports: {}};
var socket;

$(function() {
    domain = new Domain();
    $.ajax({
        url: '/js/urls.json', 
        dataType: 'json'
    }).done(function(data) {
        data.forEach(function(value) {
            $.getScript(path+value, function() {
                loadCount --;
                console.info('Loading, '+loadCount+' items left');
                if(loadCount <= 0) {
                    console.info('Starting up');
                    init();
                }
            });
            loadCount ++;
        });
    });
});

function init() {
    socket = io();
    socket.on('domain', function(data) {
        var valid = true;
        data.forEach(function(key) {
            if(domain.get(key) == null) {
                console.log(key+' not found');
                valid = false;
            }
        });
        if(!valid) {
            console.error('Closing connection');
            socket.close();
        } else {
            console.info('Connected to the server!');
        }
    });
}
