const tmpDocument = document.createElement( 'html' );
const xhr = new XMLHttpRequest();
xhr.timeout = 2000;

const load = ( url, callback ) => {

	xhr.open( 'GET', url, true );
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
