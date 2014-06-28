var fs = require('fs'),
    through2 = require('through2'),
    gutil = require('gulp-util'),
    PluginError = require('gulp-util').PluginError,
    HTMLHint = require('htmlhint').HTMLHint,
    c = gutil.colors;

var formatOutput = function(report, file, options){
    'use strict';
    if (!report.length) {
        return {
            success: true
        };
    }

    var filePath = (file.path || 'stdin');

    // Handle errors
    var messages = report.filter(function(err){
        return err;
    }).map(function(err){
        return {
            file: filePath,
            error: err
        };
    });

    var output = {
        errorCount: messages.length,
        success: false,
        messages: messages,
        options: options
    };

    return output;
};

var htmlhintPlugin = function(options){
    'use strict';

    var ruleset = {};

    if (!options) {
        options = {};
    }


    // Read Htmlhint options from a specified htmlhintrc file.
    if (typeof options === 'string') {
        // Don't catch readFile errors, let them bubble up
        options = {
            htmlhintrc: './' + options
        };
    }

    // if necessary check for required param(s), e.g. options hash, etc.
    // read config file for htmlhint if available
    if (options.htmlhintrc) {
        try {
            var externalOptions = fs.readFileSync(options.htmlhintrc);
            options = JSON.parse(externalOptions);
        } catch (err) {
            throw new Error('gulp-htmlhint: Cannot parse .htmlhintrc');
        }
    }

    // Build a list of all available rules
    for(var key in HTMLHint.defaultRuleset) {
        ruleset[key] = 1;
    }


    // normalize htmlhint options
    // htmllint only checks for rulekey, so remove rule if set to false
    for (var rule in options) {
        if (!options[rule]) {
            delete ruleset[rule];
        } else {
            ruleset[rule] = options[rule];
        }
    }

    return through2.obj(function (file, enc, cb) {
        var report = HTMLHint.verify(file.contents.toString(), ruleset);

        // send status down-stream
        file.htmlhint = formatOutput(report, file, options);
        cb(null, file);
    });
};

var defaultReporter = function(file){
    'use strict';
    var errorCount = file.htmlhint.errorCount;
    var plural = errorCount === 1 ? '' : 's';

    process.stderr.write('\x07'); // Send a beep to the terminal so it bounces

    gutil.log(c.cyan(errorCount) + ' error' + plural + ' found in ' + c.magenta(file.path));

    file.htmlhint.messages.forEach(function(result){
        var message = result.error,
            evidence = message.evidence,
            line = message.line,
            col = message.col,
            detail = typeof message.line !== 'undefined' ?
                c.yellow('L' + line) + c.red(':') + c.yellow('C' + col) : c.yellow('GENERAL');

        if (col === 0) {
            evidence = c.red('?') + evidence;
        } else if (col > evidence.length) {
            evidence = c.red(evidence + ' ');
        } else {
            evidence = evidence.slice(0, col - 1) + c.red(evidence[col - 1]) + evidence.slice(col);
        }

        gutil.log(
            c.red('[') + detail + c.red(']') + c.yellow(' ' + message.message) + ' (' + message.rule.id + ')'
        );
        gutil.log(evidence);

    });
};

htmlhintPlugin.reporter = function(customReporter){
    'use strict';
    var reporter = defaultReporter;

    if (typeof customReporter === 'function') {
        reporter = customReporter;
    }

    if (customReporter === 'fail') {
        return htmlhintPlugin.failReporter();
    }

    if (typeof reporter === 'undefined') {
        throw new Error('Invalid reporter');
    }

    return through2.obj(function(file, enc, cb){
        // Only report if HTMLHint ran and errors were found
        if (file.htmlhint && !file.htmlhint.success) {
            reporter(file);
        }

        cb(null, file);
    });
};

htmlhintPlugin.failReporter = function(){
    'use strict';
    return through2.obj(function (file, enc, cb) {
        // something to report and has errors
        var error;
        if (file.htmlhint && !file.htmlhint.success) {
            error = new PluginError('gulp-htmlhint', {
                message: 'HTMLHint failed for: ' + file.relative,
                showStack: false
            });
        }
        cb(error, file);
    });
};

module.exports = htmlhintPlugin;


