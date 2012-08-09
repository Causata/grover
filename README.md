YUITest Wrapper for PhantomJS
=============================

A little command line tool for running [YUITest](http://yuilibrary.com/yuitest) html
files inside of PhantomJS.

This release supports exiting with the proper exit code to fail a build.

Installation
------------

You must have the `phantomjs` command line tool installed prior to running this.

    npm -g install grover

Build Status
------------

[![Travis Build Status](https://secure.travis-ci.org/davglass/grover.png?branch=master)](http://travis-ci.org/davglass/grover)

Output
------

    grover app/tests/app.html yui/tests/index.html loader/tests/index.html editor/tests/editor.html
    Starting Grover on 4 files with PhantomJS@1.5.0
      Running 15 concurrent tests at a time.
    ✔ [Loader Automated Tests]: Passed: 60 Failed: 0 Total: 60 (ignored 0)
    ✔ [App Framework]: Passed: 269 Failed: 0 Total: 269 (ignored 0)
    ✔ [Editor]: Passed: 31 Failed: 0 Total: 31 (ignored 0)
    ✔ [YUI Core Test Suite]: Passed: 50 Failed: 0 Total: 51 (ignored 1)
    ----------------------------------------------------------------
    ✔ [Total]: Passed: 410 Failed: 0 Total: 411 (ignored 1)
      [Timer] 8.928 seconds


Commandline Arguments
---------------------

    grover <paths to yuitest html files>
       -v, --version Print version
       -h, --help Print this stuff
       -s, --silent Print no output, only use exit code
       -q, --quiet Only print errors and use exit code
       -f, --fail Fail on first error
       -c, --concurrent Number of tests to run concurrently, default: 15
       -t, --timeout Specify a timeout (in seconds) for a test file to be considered as failed.
       -i, --import <path to js file> - Require this file and use the exports (array)
               as the list of files to process.
       -p, --prefix <string> String to prefix to all urls (for dynamic server names)
       -S, --suffix <string> String to add to the end of all urls (for dynamic server names)
       -o, --outfile <path to export file>
           You can specify an export type with the following:
           --tap TAP export (default)
           --xml XML export
           --json JSON export
           --junit JUnit XML export
       --server Starts a static file server in the CWD, tests should be relative to this directory
       --port <Number> The port to start the server on
       --coverage Generate a coverage report and print it to the screen (you must instrument your own files with YUITest first)
       --coverage-warn <Number> The percentage to highlight as low coverage, default is 80

Saving Results
--------------

Grover supports the 4 ways that YUITest exports it's tests results so you can import them
into another system.

    grover ./tests/*.html -o ./results/results.json --json
    grover ./tests/*.html -o ./results/results.xml --xml
    grover ./tests/*.html -o ./results/results.tap --tap
    grover ./tests/*.html -o ./results/results.junit.xml --junit

Using the built in server
-------------------------

Using the `--server` command will fire up a server in the `process.cwd()` and serve anything
under it as statis content. Then when you select the tests to be run, they are converted to URL's
under the hood and fetched from the static server instead of the file system.

Combine this with `-S` options like this:

    grover --server --port 5000 -S '?filter=coverage' ./tests/foo.html

This will create a URL like:

    http://127.0.0.1:5000/tests/foo.html?filter=coverage

YUITest Coverage
----------------

If you instrument your files with the [YUITest Coverage Tool](http://yuilibrary.com/yuitest/), you can 
have `grover` show you your coverage report:

    grover --coverage --coverage-warn 70 ./tests/*.html

Will print something like this:

    Starting Grover on 1 files with PhantomJS@1.6.1
      Running 15 concurrent tests at a time.
      starting grover server
      assuming server root as /home/yui/src/yui3
    ✔ [FOO]: Passed: 8 Failed: 0 Total: 8 (ignored 0) 97% 45/1/46
    ----------------------------------------------------------------
    ✔ [Total]: Passed: 8 Failed: 0 Total: 8 (ignored 0) 97% 45/1/46
      [Timer] 1.114 seconds
    Generating Coverage Report
    ┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━┳━━━━━━━━━━━━┳━━━━━━━┓
    ┃  path            ┃  lines ┃    % ┃  functions ┃     % ┃
    ┣━━━━━━━━━━━━━━━━━━╋━━━━━━━━╋━━━━━━╋━━━━━━━━━━━━╋━━━━━━━┫
    ┃  ✔ /tests/foo.js ┃  45/46 ┃  97% ┃        6/6 ┃  100% ┃
    ┗━━━━━━━━━━━━━━━━━━┻━━━━━━━━┻━━━━━━┻━━━━━━━━━━━━┻━━━━━━━┛

**YOU MUST INSTRUMENT YOUR OWN COVERAGE FILES, GROVER JUST GATHERS THE REPORT.**

What's with the name?
---------------------

This tool is dedicated to [Ryan Grove](https://github.com/rgrove) for all his work on YUI over the last year.
I told him that my next command line tool would be named "grover" after "rgrove".
