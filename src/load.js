const tmpDocument = document.createElement( 'html' );
const xhr = new XMLHttpRequest();

const load = ( url, loadedCallback, loadingCallback ) => {

	const startTime = Date.now();

	xhr.open( 'GET', url, true );
	xhr.timeout = 5000;
	xhr.onload = ( event ) => {

		tmpDocument.innerHTML = xhr.responseText.replace( /^(.+)?<html(.+)?>/gi, '' );
		loadedCallback(
			tmpDocument,
			{
				loaded: event.loaded,
				total: event.total,
				elapsedTime: Date.now() - startTime
			}
		);

	};

	xhr.ontimeout = function () {

		loadedCallback( null );

	};

	xhr.onerror = function () {

	  loadedCallback( null );

	};

	xhr.onprogress = ( event ) => {

		loadingCallback( {
			loaded: event.loaded,
			total: event.total,
			elapsedTime: Date.now() - startTime
		} );

	};

	xhr.send( null );

};

export default load;
