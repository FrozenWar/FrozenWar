var langRes = {};
var language = 'en';

function langAddKey(lang, key, value) {
  if(!langRes[lang])
    langRes[lang] = {};
  langRes[lang][key] = value;
}

function _(key) {
  if(!langRes[language]) return '!'+key;
  if(!langRes[language][key]) return '!'+key;
  
  var str = langRes[language][key];
  
  for(var i = 1; i < arguments.length; ++i) {
    str = str.replace('%'+i, arguments[i]);
  }
  
  return str;
}

$(document).ready(function() {
  var preferLang = window.navigator.userLanguage || window.navigator.language;
  if(preferLang.slice(0,2) == 'ko') {
    language = 'ko';
  } else {
    language = 'en';
  }
  if(location.href.indexOf('en=y') != -1) {
    language = 'en';
  }
  $.ajax({
    url: './js/lang.json', 
    dataType: 'json'
  }).done(function(lang) {
    langRes = lang;
    startInit();
  }).fail(function() {
    alertify.alert('Failed to load language file, continuing anyway', function() {
      startInit();
    });
  });
});
