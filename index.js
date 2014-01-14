var es = require('event-stream'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    HTMLHint = require('htmlhint').HTMLHint;

module.exports = function (options) {
    'use strict';

    options = options || {
        'tagname-lowercase': !0,
        'attr-lowercase': !0,
        'attr-value-double-quotes': !0,
        'doctype-first': !0,
        'tag-pair': !0,
        'spec-char-escape': !0,
        'id-unique': !0,
        'reporter' : function(message) {
            gutil.log(
                gutil.colors.red.bold('['),
                gutil.colors.yellow( 'L' + message.line ),
                gutil.colors.red(':'),
                gutil.colors.yellow( 'C' + message.col ),
                gutil.colors.red.bold(']'),
                ' ',
                gutil.colors.yellow(message.message)
            );
            var evidence = message.evidence,
                col = message.col;
            if (col === 0) {
                evidence = gutil.colors.red('?') + evidence;
            } else if (col > evidence.length) {
                evidence = gutil.colors.red(evidence + ' ');
            } else {
                evidence = evidence.slice(0, col - 1) + gutil.colors.red(evidence[col - 1]) + evidence.slice(col);
            }
            gutil.log(evidence);
        }
    };

    // see 'Writing a plugin'
    // https://github.com/wearefractal/gulp/wiki/Writing-a-gulp-plugin
    function htmlhint(file, callback) {
        var html = file.contents.toString('utf8'),
            errors,
            reporter = typeof options.reporter === 'function' ? options.reporter : function(){};


        if (options.reporter) {
            options.reporter = undefined;
        }

        // if necessary check for required param(s), e.g. options hash, etc.
        // read config file for htmlhint if available
        if (options.htmlhintrc) {
            try {
                var rc = fs.readFileSync(options.htmlhintrc);
                options = _.assign(JSON.parse(rc), options);
                delete options.htmlhintrc;
            } catch (err) {
                return callback(new Error('gulp-htmlhint: Cannot parse .htmlhintrc'), undefined);
            }
        }

        // normalize htmlhint options
        // htmllint only checks for rulekey, so remove rule if set to false
        for (var i in options) {
            if (!options[i]) {
                delete options[i];
            }
        }

        //
        errors = HTMLHint.verify(html, options);

        file.htmlhint = {
            valid: errors.length <= 0,
            errors: errors
        };

        errors.forEach(function( message ) {

            reporter(message);
        });

        callback(null, file);
    }

    return es.map(htmlhint);
};
