const tmpDocument = document.createElement( 'html' );
const xhr = new XMLHttpRequest();

const load = ( url, callback ) => {

	xhr.open( 'GET', url, true );
	xhr.timeout = 5000;
	xhr.onload = () => {

		tmpDocument.innerHTML = xhr.responseText.replace( /^(.+)?<html(.+)?>/gi, '' );
		callback( tmpDocument );

	}

	xhr.ontimeout = function () {

		callback( null );

	};

	xhr.onerror = function () {

	  callback( null );

	};

	xhr.send( null );

}

export default load;
