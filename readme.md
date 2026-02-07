# PjaxRouter

Pjax Router for static websites.

[![Latest NPM release](https://img.shields.io/npm/v/pjax-router.svg)](https://www.npmjs.com/package/pjax-router)
![MIT License](https://img.shields.io/npm/l/pjax-router.svg)

## demos

- [basic](https://yomotsu.github.io/PjaxRouter/examples/index.html)

## Usage

Both standalone lib and NPM package are available.

### Standalone

```html
<script src="./js/PjaxRouter.js"></script>
```

### NPM

```
$ npm install --save pjax-router
```
then
```javascript
import PjaxRouter from 'pjax-router';
```

---

```javascript
var router = new PjaxRouter( {
	// trigger for Pjax link
	triggers: [ 'a' ],
	// trigger for Pjax form (supports both GET and POST)
	formTriggers: [ 'form[data-pjax]' ],
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
## Form Support

PjaxRouter supports form submissions with various HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.) via PJAX. Forms matching the `formTriggers` selector will be intercepted and submitted without a full page reload.

- **GET/HEAD**: Parameters are added to the URL query string
- **POST/PUT/PATCH/DELETE**: Data is sent as FormData in the request body

### Example

```html
<!-- GET form: parameters will be added to URL -->
<form action="/search" method="GET" data-pjax>
	<input type="text" name="q" placeholder="Search...">
	<button type="submit">Search</button>
</form>

<!-- POST form: data will be submitted as FormData -->
<form action="/submit" method="POST" data-pjax>
	<input type="text" name="name" required>
	<input type="email" name="email" required>
	<button type="submit">Submit</button>
</form>

<!-- Other methods (PUT, PATCH, DELETE) are also supported -->
<!-- Note: HTML forms natively only support GET and POST, -->
<!-- but you can override with JavaScript if needed -->
```

```javascript
var router = new PjaxRouter({
	triggers: ['a[data-pjax]'],
	formTriggers: ['form[data-pjax]'],  // Enable form PJAX
	selectors: ['#content'],
	switches: {
		'#content': function(newEl, oldEl) {
			oldEl.innerHTML = newEl.innerHTML;
		}
	}
});
```
