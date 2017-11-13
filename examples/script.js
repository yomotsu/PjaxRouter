var router = new PjaxRouter( {
	triggers: [ 'a' ],
	ignores: [ 'a.ignore' ],
	selectors: [ 'title', '.sandbox1', '.sandbox2' ],
	switches: {
		'title': function ( newEl, oldEl ) {

			document.title = newEl.innerHTML;

		},
		'.sandbox1': function ( newEl, oldEl ) {

			document.querySelector('.sandbox1').innerHTML = newEl.innerHTML;

		},
		'.sandbox2': function ( newEl, oldEl ) {

			document.querySelector('.sandbox2').innerHTML = newEl.innerHTML;

			setTimeout( function () {

				router.emit( 'delay1second' );

			}, 1000 );

		}
	}
} );

router.on( 'beforeload',   function () { console.log( 'beforeload' );   } );
router.on( 'loading',      function ( progress ) { console.log( 'loading', progress );} );
router.on( 'load',         function ( progress ) { console.log( 'loaded', progress );} );
router.on( 'beforeswitch', function () { console.log( 'beforeswitch' ); } );
router.on( 'afterswitch',  function () { console.log( 'afterswitch' );  } );
router.on( 'error',        function () { console.log( 'error' );        } );

// custom event
router.on( 'delay1second', function () { console.log( '1sec delay' );   } );

router.once( 'load',       function () { console.log( 'onetime load' ); } );
