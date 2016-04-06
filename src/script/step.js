( function() {

  'use strict';

  let step = function( _array ) {
    let array = _array;
    let count = 0;

    let func = function(){
      if( typeof _array[ count ] === 'function' ){
        _array[ count ]( func );
      }
      count ++;
    };
    func();
  };

  module.exports = step;

} )();
