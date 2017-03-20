// https://developer.mozilla.org/ja/docs/Web/API/Element/matches#Polyfill
const matches =
	Element.prototype.matches ||
	Element.prototype.matchesSelector || 
	Element.prototype.mozMatchesSelector ||
	Element.prototype.msMatchesSelector || 
	Element.prototype.oMatchesSelector || 
	Element.prototype.webkitMatchesSelector;

function elementMatches ( el, selector ) {

	return matches.call( el, selector );

}

export default elementMatches;
