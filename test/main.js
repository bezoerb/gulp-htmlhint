/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should");
    require("mocha");

var gutil = require("gulp-util"),
    File = gutil.File,
	htmlhint = require("../");

describe("gulp-htmlhint", function () {

	it("should pass valid file", function (done) {
        var valid = 0;

        var fakeFile = new File({
            cwd: "test/fixtures/",
            base: "test/fixtures",
            path: "test/fixtures/valid.html",
            contents: fs.readFileSync("test/fixtures/valid.html")
        });

		var stream = htmlhint();

		stream.on("error", function(err) {
			should.not.exist(err);
		});

		stream.on("data", function (file) {
            should.exist(file);
            file.htmlhint.valid.should.equal(true);
            file.htmlhint.errors.length.should.equal(0);
            should.exist(file.path);
            should.exist(file.relative);
            should.exist(file.contents);
            ++valid;
		});

        stream.once('end', function () {
            valid.should.equal(1);
            done();
        });

        stream.write(fakeFile);
		stream.end();
	});


    it("should fail invalid file", function (done) {
        var invalid = 0;

        var fakeFile = new File({
            cwd: "test/fixtures/",
            base: "test/fixtures",
            path: "test/fixtures/invalid.html",
            contents: fs.readFileSync("test/fixtures/invalid.html")
        });

        var stream = htmlhint();

        stream.on("error", function(err) {
            should.not.exist(err);
        });

        stream.on("data", function (file) {
            should.exist(file);
            file.htmlhint.valid.should.equal(false);
            file.htmlhint.errors.length.should.equal(1);
            should.exist(file.path);
            should.exist(file.relative);
            should.exist(file.contents);
            ++invalid;
        });

        stream.once('end', function () {
            invalid.should.equal(1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

});
