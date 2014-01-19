var es = require('event-stream'),
    fs = require('fs'),
    _ = require('lodash'),
    gutil = require('gulp-util'),
    HTMLHint = require('htmlhint').HTMLHint;

var formatOutput = function(report, file, options) {
    if (!report.length) {
        return {
            success: true
        };
    }

    var filePath = (file.path || 'stdin');

    gutil.log(report);

    // Handle errors
    var messages = report.map(function(err) {
        if (!err) return;
        return { file: filePath, error: err };
    }).filter(function(err) {
        return err;
    });

    var output = {
        errorCount: messages.length,
        success: false,
        messages: messages,
        options: options
    };

    return output;
}

var htmlhintPlugin = function (options) {
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
    _.forEach(HTMLHint.defaultRuleset,function(rule,key) {
        ruleset[key] = 1;
    });



    // normalize htmlhint options
    // htmllint only checks for rulekey, so remove rule if set to false
    for (var rule in options) {
        if (!options[rule]) {
            delete ruleset[rule];
        } else {
            ruleset[rule] = options[rule];
        }
    }

    return es.map(function(file, cb) {
        var report = HTMLHint.verify(String(file.contents), ruleset);

        // send status down-stream
        file.htmlhint = formatOutput(report, file, options);
        cb(null, file);

    });

};

var defaultReporter = function(file) {
    var errorCount = file.htmlhint.errorCount;
    var plural = errorCount === 1 ? '' : 's';

    process.stderr.write('\x07'); // Send a beep to the terminal so it bounces

    gutil.log(c.cyan(errorCount)+' error'+plural+' found in '+c.magenta(file.path));

    file.htmlhint.messages.forEach(function(result) {
        var message = result.message,
            evidence = message.evidence,
            col = message.col;

        if (col === 0) {
            evidence = gutil.colors.red('?') + evidence;
        } else if (col > evidence.length) {
            evidence = gutil.colors.red(evidence + ' ');
        } else {
            evidence = evidence.slice(0, col - 1) + gutil.colors.red(evidence[col - 1]) + evidence.slice(col);
        }


        gutil.log(
            gutil.colors.red('[') +
            (
                typeof result.line !== 'undefined' ?
                    gutil.colors.yellow( 'L' + result.line ) +
                    gutil.colors.red(':') +
                    gutil.colors.yellow( 'C' + result.col )
                : gutil.colors.yellow( 'GENERAL' )
            ) +
            gutil.colors.red(']') +
            gutil.colors.yellow(' ' + message) + ' (' + message.rule.id + ')'
        );
        gutil.log(evidence);

    });
};

htmlhintPlugin.reporter = function(customReporter) {
    var reporter = defaultReporter;

    if (typeof customReporter === 'function') {
        reporter = customReporter;
    }

    if (typeof reporter === 'undefined') {
        throw new Error('Invalid reporter');
    }

    return es.map(function(file, cb) {
        // Only report if HTMLHint ran and errors were found
        if (file.htmlhint && !file.htmlhint.success) {
            reporter(file);
        }

        return cb(null, file);
    });
};

module.exports = htmlhintPlugin;


