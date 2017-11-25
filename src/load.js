// const tmpDocument = document.createElement( 'html' );
const xhr = new XMLHttpRequest();

const load = ( url, loadedCallback, loadingCallback, timeout = 5000 ) => {

	const startTime = Date.now();

	xhr.open( 'GET', url, true );
	xhr.timeout = timeout;
	xhr.onload = ( event ) => {

		loadedCallback(
			xhr.responseText,
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
