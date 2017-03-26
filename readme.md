# PjaxRouter

Pjax Router for static websites.

[![Latest NPM release](https://img.shields.io/npm/v/pjax-router.svg)](https://www.npmjs.com/package/pjax-router)
![MIT License](https://img.shields.io/npm/l/pjax-router.svg)

## demos

- [basic](https://yomotsu.github.io/PjaxRouter/examples/index.html)

## supported

IE10+ and others.

## Usage

Both standalone lib and NPM package are available.

### Standalone

```html
<script src="./js/ScrambleText.js"></script>
```

### NPM

```
$ npm install --save scramble-text
```
then
```javascript
import ScrambleText from 'scramble-text';
```

---

```javascript
var router = new PjaxRouter( {
	// trigger for Pjax link
	triggers: [ 'a' ],
	// ignore selectors for Pjax link
	ignores: [ 'a.ignore' ],
	// replace target areas
	selectors: [ 'title', '.sandbox1', '.sandbox2' ],
	// callback for page transition. called when ajax has done
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

// events
router.on( 'beforeload',   function () { console.log( 'beforeload' );   } );
router.on( 'load',         function () { console.log( 'load' );         } );
router.on( 'beforeswitch', function () { console.log( 'beforeswitch' ); } );
router.on( 'afterswitch',  function () { console.log( 'afterswitch' );  } );
router.on( 'error',        function () { console.log( 'error' );        } );
```
