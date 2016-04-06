( function() {

  'use strict';

  let requestText = function( _url, _callback ) {
    let xhr = new XMLHttpRequest();
    xhr.open( 'GET', _url, true );
    xhr.responseType = 'text';
    xhr.onload = function( _e ){
      if( typeof _callback === 'function' ){
        _callback( this.response );
      }
    };
    xhr.send();
  };

  module.exports = requestText;

} )();
