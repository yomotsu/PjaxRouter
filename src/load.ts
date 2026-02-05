export interface LoadProgress {

	loaded: number;
	total: number;
	elapsedTime: number;

}

export interface LoadResult {

	text: string;
	progress: LoadProgress;

}

type ProgressCallback = ( progress: LoadProgress ) => void;

export async function load(
	url: string,
	progressCallback?: ProgressCallback,
	timeout: number = 5000,
): Promise<LoadResult> {

	const startTime = Date.now();
	const controller = new AbortController();
	const timeoutId = setTimeout( () => controller.abort(), timeout );

	try {

		const response = await fetch( url, { signal: controller.signal } );

		if ( ! response.ok ) {

			throw new Error( `HTTP ${ response.status }: ${ response.statusText }` );

		}

		// Stream response for progress tracking
		const reader = response.body?.getReader();
		const contentLength = parseInt( response.headers.get( 'Content-Length' ) || '0', 10 );

		if ( ! reader ) {

			// Fallback if streaming not available
			const text = await response.text();
			clearTimeout( timeoutId );
			return {
				text,
				progress: {
					loaded: text.length,
					total: text.length,
					elapsedTime: Date.now() - startTime,
				},
			};

		}

		let receivedLength = 0;
		const chunks: Uint8Array[] = [];

		while ( true ) {

			const { done, value } = await reader.read();

			if ( done ) break;

			chunks.push( value );
			receivedLength += value.length;

			if ( progressCallback ) {

				progressCallback( {
					loaded: receivedLength,
					total: contentLength || receivedLength,
					elapsedTime: Date.now() - startTime,
				} );

			}

		}

		clearTimeout( timeoutId );

		// Concatenate chunks and decode
		const blob = new Blob( chunks as BlobPart[] );
		const text = await blob.text();

		return {
			text,
			progress: {
				loaded: receivedLength,
				total: contentLength || receivedLength,
				elapsedTime: Date.now() - startTime,
			},
		};

	} catch ( error ) {

		clearTimeout( timeoutId );

		if ( error instanceof Error && error.name === 'AbortError' ) {

			throw new Error( 'Request timeout' );

		}

		throw error;

	}

}

export default load;
