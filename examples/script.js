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

		}
	}
} );

router.on( 'beforeload',   function () { console.log( 'beforeload' );   } );
router.on( 'load',         function () { console.log( 'load' );         } );
router.on( 'beforeswitch', function () { console.log( 'beforeswitch' ); } );
router.on( 'afterswitch',  function () { console.log( 'afterswitch' );  } );
router.on( 'error',        function () { console.log( 'error' );        } );
