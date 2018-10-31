# gulp-htmlhint [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> [htmlhint](https://github.com/yaniswang/HTMLHint) wrapper for [gulp](https://github.com/wearefractal/gulp) to validate your HTML


## Usage

First, install `gulp-htmlhint` as a development dependency:

```shell
npm install --save-dev gulp-htmlhint
```

Then, add it to your `gulpfile.js`:

```javascript
var htmlhint = require("gulp-htmlhint");

gulp.src("./src/*.html")
	.pipe(htmlhint())
```



## API

### htmlhint([options [, customRules]])

#### options
See all rules here: [https://github.com/HTMLHint/HTMLHint/wiki/Rules](https://github.com/yaniswang/HTMLHint/wiki/Rules)

If `options` is empty, the task will use standard options.

##### options.htmlhintrc
Type: `String`<br>
Default value: `null`

If this filename is specified, options and globals defined there will be used. Task and target options override the options within the `htmlhintrc` file. The `htmlhintrc` file must be valid JSON and looks something like this:

```json
{
  "tag-pair": true
}
```

```javascript
var htmlhint = require("gulp-htmlhint");

gulp.src("./src/*.html")
	.pipe(htmlhint('.htmlhintrc'))
```

#### customRules

Type: `Array` _Optional_<br>
Default value: `null`

Array that contains all user-defined custom rules. Rules added to this param need not exist in the `htmlhintrc` file.
All rules inside this array should be valid objects and look like this:

```javascript
{
		id: 'my-custom-rule',
		description: 'Custom rule definition',
		init: function(parser, reporter){
				//Code goes here
		}
}
```

Here is an example:

```javascript
var htmlhint = require("gulp-htmlhint");

var customRules = [];
customRules.push({
		id: 'my-custom-rule',
		description: 'Custom rule definition',
		init: function(parser, reporter){
				//Code goes here
		}
});

gulp.src("./src/*.html")
	.pipe(htmlhint('.htmlhintrc', customRules))
```

Note: You can call `htmlhint` function four different ways:

- Without params (task will use standard options).
- With `options` param alone.
- With `customRules` param alone (task will only use custom rules options).
- With both `options` and `customRules` params defined.

## Reporters

### Default reporter
```javascript
var htmlhint = require("gulp-htmlhint");

gulp.src("./src/*.html")
	.pipe(htmlhint())
	.pipe(htmlhint.reporter())
```


### Fail reporters

#### failOnError

Use this reporter if you want your task to fail on the first file that triggers an HTMLHint Error.
It also prints a summary of all errors in the first bad file.

```javascript
var htmlhint = require("gulp-htmlhint");

gulp.src("./src/*.html")
	.pipe(htmlhint())
	.pipe(htmlhint.failOnError())
```

#### failAfterError

Use this reporter if you want to collect statistics from all files before failing.
It also prints a summary of all errors in the first bad file.

```javascript
var htmlhint = require("gulp-htmlhint");

gulp.src("./src/*.html")
	.pipe(htmlhint())
	.pipe(htmlhint.failAfterError())
```

#### Reporter options

Optionally, you can pass a config object to either fail reporter.

##### suppress
Type: `Boolean`<br>
Default value: `false`

  When set to `true`, errors are not displayed on failure.
  Use in conjunction with the default and/or custom reporter(s).
  Prevents duplication of error messages when used along with another reporter.

  ```javascript
  var htmlhint = require("gulp-htmlhint");

  gulp.src("./src/*.html")
	  .pipe(htmlhint())
	  .pipe(htmlhint.reporter("htmlhint-stylish"))
	  .pipe(htmlhint.failOnError({ suppress: true }))
  ```

### Third-party reporters

[gulp-reporter](https://github.com/gucong3000/gulp-reporter) used in team project, it fails only when error belongs to the current author of git.

## License

[MIT License](bezoerb.mit-license.org)

[npm-url]: https://npmjs.org/package/gulp-htmlhint
[npm-image]: https://badge.fury.io/js/gulp-htmlhint.svg

[travis-url]: https://travis-ci.org/bezoerb/gulp-htmlhint
[travis-image]: https://secure.travis-ci.org/bezoerb/gulp-htmlhint.svg?branch=master

[depstat-url]: https://david-dm.org/bezoerb/gulp-htmlhint
[depstat-image]: https://david-dm.org/bezoerb/gulp-htmlhint.svg
