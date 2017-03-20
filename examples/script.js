var router = new PjaxRouter( {
	triggers: [ 'a' ],
	selectors: [ 'title', '.sandbox1', '.sandbox2' ],
	switches: {
		'title': function ( oldEl, newEl ) {

			document.title = newEl.innerHTML;

		},
		'.sandbox1': function ( oldEl, newEl ) {

			document.querySelector('.sandbox1').innerHTML = newEl.innerHTML;

		},
		'.sandbox2': function ( oldEl, newEl ) {

			document.querySelector('.sandbox2').innerHTML = newEl.innerHTML;

		}
	}
} );

router.on( 'beforeload',   function () { console.log( 'beforeload' );   } );
router.on( 'load',         function () { console.log( 'load' );         } );
router.on( 'beforeswitch', function () { console.log( 'beforeswitch' ); } );
router.on( 'afterswitch',  function () { console.log( 'afterswitch' );  } );
router.on( 'error',        function () { console.log( 'error' );        } );
