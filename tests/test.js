#!/usr/bin/env node

process.chdir(__dirname);

var YUITest = require('yuitest'),
    path = require('path'),
    exec = require('child_process').exec;



var timer = setTimeout(function() {
    console.error('Test Timeout Exiting..');
    process.exit(1);
}, (45 * 1000)); //second test timout

YUITest.TestRunner.subscribe('complete', function() {
    clearTimeout(timer);
});

var Assert = YUITest.Assert;

var wrapper = path.join(__dirname, '../lib/wrapper/wrapper.js');

var runTest = function(file, timeout, cb) {
    if (!cb) {
        cb = timeout;
        timeout = '';
    }
    var cmd = 'phantomjs ' + wrapper + ' ' + path.join(__dirname, file) + ' ' + timeout;
    //console.log('Executing: ', cmd);
    exec(cmd, cb);
};

var suite = new YUITest.TestSuite('Grover');

suite.add(new YUITest.TestCase({
    name: 'Good Results',
    'Check Results': function() {
        var test = this;
        
        runTest('./html/good.html', function(err, stdout, stderr) {
            test.resume(function() {
                var json = JSON.parse(stdout);
                Assert.areSame('Suite #1', json.name, 'Suite Name Incorrect');
                Assert.areEqual(50, json.passed, 'A test failed');
                Assert.areEqual(0, json.failed, 'A test failed');
            });
        });

        this.wait();
    }
}));

suite.add(new YUITest.TestCase({
    name: 'Failed Results',
    'Failed Tests': function() {
        var test = this;
        
        runTest('./html/bad.html', function(err, stdout) {
            test.resume(function() {
                var json = JSON.parse(stdout);
                Assert.areSame('Suite Bad', json.name, 'Suite Name Incorrect');
                Assert.areEqual(5, json.passed, 'A test failed');
                Assert.areEqual(5, json.failed, 'A test failed');
            });
        });

        this.wait();
    }
}));

suite.add(new YUITest.TestCase({
    name: 'Errors',
    'Should throw script error': function() {
        var test = this;
        
        runTest('./html/error.html', function(err, stdout) {
            test.resume(function() {
                var json = JSON.parse(stdout);
                Assert.areEqual(0, json.passed, 'A test failed');
                Assert.areEqual(1, json.failed, 'A test failed');
                Assert.isNotUndefined(json.error, 'Error message was not passed along');
            });
        });

        this.wait();
    },
    'Should Throw Timeout': function() {
        var test = this;
        
        runTest('./html/timeout.html', 1, function(err, stdout) {
            test.resume(function() {
                var json = JSON.parse(stdout);
                Assert.areEqual(0, json.passed, 'A test failed');
                Assert.areEqual(1, json.failed, 'A test failed');
                Assert.isNotUndefined(json.error, 'Error message was not passed along');
                Assert.areEqual('Script Timeout', json.error);
            });
        });

        this.wait();
    }
}));

var parse = require(path.join(__dirname, '../lib/options')).parse;

suite.add(new YUITest.TestCase({
    name: 'Options Tests',
    'check timeout number': function() {
        var opts = parse(['-t', '3']);
        Assert.areEqual(3, opts.timeout, 'Failed to set number timeout');

        opts = parse(['--timeout', '3']);
        Assert.areEqual(3, opts.timeout, 'Failed to set number timeout');
    },
    'check timeout -1': function() {
        var opts = parse(['-t', '-1']);
        Assert.isNull(opts.timeout, 'Failed to set null timeout');

        opts = parse(['--timeout', '-1']);
        Assert.isNull(opts.timeout, 'Failed to set null timeout');
    },
    'check timeout string': function() {
        var opts = parse(['-t', 'foobar']);
        Assert.isUndefined(opts.timeout, 'Failed to set null timeout');

        opts = parse(['--timeout', 'foobar']);
        Assert.isUndefined(opts.timeout, 'Failed to set null timeout');
    },
    'check booleans': function() {
        var opts = parse(['-s', '-q', '-f']);
        Assert.isTrue(opts.silent, 'Failed to set silent');
        Assert.isTrue(opts.quiet, 'Failed to set quiet');
        Assert.isTrue(opts.exitOnFail, 'Failed to set exitOnFail');

        opts = parse(['--quiet', '--silent', '--fail']);
        Assert.isTrue(opts.silent, 'Failed to set silent');
        Assert.isTrue(opts.quiet, 'Failed to set quiet');
        Assert.isTrue(opts.exitOnFail, 'Failed to set exitOnFail');
    },
    'check prefix': function() {
        var opts = parse(['-p', 'http://localhost:300/', 'foo.html', 'path/to/file.html']);

        Assert.areEqual(opts.paths.length, 2, 'Failed to parse paths');
        Assert.areEqual(opts.paths[0], 'http://localhost:300/foo.html', 'Failed to add prefix to first item');
        Assert.areEqual(opts.paths[1], 'http://localhost:300/path/to/file.html', 'Failed to add prefix to second item');
    },
    'check --server': function() {
        var opts = parse(['--server', 'foo.html', 'path/to/file.html']);

        Assert.areEqual(opts.paths.length, 2, 'Failed to parse paths');
        Assert.areEqual(opts.server, process.cwd(), 'failed to set server config');
        Assert.areEqual(opts.port, 7000, 'Failed to set default port');
    },
    'check --port 9000': function() {
        var opts = parse(['--server', '--port', '9000', 'foo.html', 'path/to/file.html']);

        Assert.areEqual(opts.paths.length, 2, 'Failed to parse paths');
        Assert.areEqual(opts.server, process.cwd(), 'failed to set server config');
        Assert.areEqual(opts.port, 9000, 'Failed to set port');
        
    },
    'check coverage prefix (sp)': function() {
        var opts = parse(['-sp', '../']);

        Assert.areEqual('../', opts.sourceFilePrefix, 'Failed to parse source file prefix.');
    },
    'check coverage prefix (sourceFilePrefix)': function() {
        var opts = parse(['--sourceFilePrefix', '../']);

        Assert.areEqual('../', opts.sourceFilePrefix, 'Failed to parse source file prefix.');
    },
    'check coverage filename (co)': function() {
        var opts = parse(['-co', 'lcov.info']);

        Assert.areEqual('lcov.info', opts.coverageFileName, 'Failed to parse coverage filename.');
    },
    'check coverage filename (coverageFileName)': function() {
        var opts = parse(['--coverageFileName', 'lcov.info']);

        Assert.areEqual('lcov.info', opts.coverageFileName, 'Failed to parse coverage filename.');
    }
}));

var cover = require(path.join(__dirname, '../lib/coverage'));

suite.add(new YUITest.TestCase({
    name: 'Coverage',
    coverageData: {"build/foo/foo.js": {
        lines: {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 0
        },
        functions: {
            'init:1': 1,
            'foo:2': 2,
            '(anonymous 1):3': 3
        },
        coveredLines: 4,
        calledLines: 3,
        coveredFunctions: 3,
        calledFunctions: 3,
        path: 'build/foo/foo.js'
    }},
    coverageFile: "TN:lcov.info\n\
SF:" + path.join(__dirname, 'build/foo/foo.js') + "\n\
FN:1,init\n\
FN:2,foo\n\
FN:3,(anonymous 1)\n\n\
FNDA:1,init\n\
FNDA:2,foo\n\
FNDA:3,(anonymous 1)\n\n\
FNF:3\n\
FNH:3\n\
DA:1,1\n\
DA:2,2\n\
DA:3,3\n\
DA:4,0\n\n\
LF:4\n\
LH:3\n\n\
end_of_record\n\n",
    'Should get lcov data for yui tests': function() {
        cover.set(this.coverageData);
        var report = cover.getCoverageReport({
            sourceFilePrefix: './'
        });
        Assert.areEqual(this.coverageFile, report, 'Failed to produce correct lcov report.');
    },
}));


YUITest.TestRunner.add(suite);

