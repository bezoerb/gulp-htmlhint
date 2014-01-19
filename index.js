var es = require('event-stream'),
    fs = require('fs'),
    _ = require('lodash'),
    gutil = require('gulp-util'),
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
    var messages = report.map(function(err){
        if (!err) {
            return;
        }
        return {
            file: filePath,
            error: err
        };
    }).filter(function(err){
        return err;
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
    _.forEach(HTMLHint.defaultRuleset, function(rule, key){
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

    return es.map(function(file, cb){
        var report = HTMLHint.verify(String(file.contents), ruleset);

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

    if (typeof reporter === 'undefined') {
        throw new Error('Invalid reporter');
    }

    return es.map(function(file, cb){
        // Only report if HTMLHint ran and errors were found
        if (file.htmlhint && !file.htmlhint.success) {
            reporter(file);
        }

        return cb(null, file);
    });
};

module.exports = htmlhintPlugin;


