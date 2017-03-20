var router = new PjaxRouter( {
	triggers: [ 'a' ],
	selectors: [ 'title', '.sandbox1', '.sandbox2' ],
	switches: {
		'title': function ( oldEl, newEl ) {

			document.title.innerHTML = newEl.innerHTML;

		},
		'.sandbox1': function ( oldEl, newEl ) {

			document.querySelector('.sandbox1').innerHTML = newEl.innerHTML;

		},
		'.sandbox2': function ( oldEl, newEl ) {

			document.querySelector('.sandbox2').innerHTML = newEl.innerHTML;

		}
	}
} );
