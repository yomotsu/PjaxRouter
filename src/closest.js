import elementMatches from './elementMatches.js';

const DOCUMENT_NODE_TYPE = 9;

function closest ( el, selector ) {

	while ( el && el.nodeType !== DOCUMENT_NODE_TYPE ) {

		if ( elementMatches( el, selector ) ) return el;

		el = el.parentNode;

	}

}

export default closest;
