(function() {
  var build, coffeesource, devserverJsonml, ensureCoffeeSource, ensureGit, ensureSolAppInstalled, expandPackage, fs, genReadme, loadProject, project, sa, updateGitIgnore, _ref,
    __slice = [].slice;

  exports.about = {
    title: "SolApp",
    description: "Framework for quickly creating apps",
    dependencies: {
      async: "*",
      "coffee-script": "*",
      express: "*",
      glob: "*",
      request: "*",
      "socket.io": "*",
      "socket.io-client": "*",
      "uglify-js": "*"
    },
    npmjs: {},
    keywords: ["framework", "html5", "phonegap"],
    bin: {
      solapp: "./solapp.coffee"
    }
  };

  sa = exports;

  sa.global = typeof global !== "undefined" && global !== null ? global : window;

  if (typeof isNodeJs !== "boolean") {
    sa.global.isNodeJs = (typeof process !== "undefined" && process !== null ? (_ref = process.versions) != null ? _ref.node : void 0 : void 0) ? true : false;
  }

  if (isNodeJs) {
    coffeesource = "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js";
    fs = require("fs");
    require("coffee-script");
  }

  sa.sleep = function(t, fn) {
    return setTimeout(fn, t * 1000);
  };

  sa.extend = function() {
    var key, source, sources, target, val, _i, _len;
    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (key in source) {
        val = source[key];
        target[key] = val;
      }
    }
    return target;
  };

  sa.whenDone = function(done) {
    var count, results;
    count = 0;
    results = [];
    return function() {
      var idx;
      idx = count;
      ++count;
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.push(idx);
        results.push(args);
        if (results.length === count) {
          return typeof done === "function" ? done(results) : void 0;
        }
      };
    };
  };

  sa.nextTick = isNodeJs ? process.nextTick : function(fn) {
    return setTimeout(fn, 0);
  };

  if (isNodeJs) {
    sa.readFileSync = function(filename) {
      var e;
      try {
        return fs.readFileSync(filename, "utf8");
      } catch (_error) {
        e = _error;
        console.log("Warning, couldn't read \"" + filename + "\":\n" + e);
        return "";
      }
    };
  }

  if (isNodeJs) {
    expandPackage = function() {
      var pkg, version, _base, _base1, _base2, _ref1;
      version = (project["package"].version || "0.0.1").split(".");
      version[2] = +version[2] + 1;
      pkg = project["package"] = {
        name: project.name,
        version: version.join(".")
      };
      sa.extend(pkg, project.module.about || {});
      if (pkg.title == null) {
        pkg.title = pkg.name;
      }
      if (pkg.author == null) {
        pkg.author = "Rasmus Erik Voel Jensen (solsort.com)";
      }
      if (pkg.owner == null) {
        pkg.owner = "rasmuserik";
      }
      pkg.main = pkg.name + ".js";
      if (pkg.scripts == null) {
        pkg.scripts = {};
      }
      if ((_base = pkg.scripts).start == null) {
        _base.start = "node ./node_modules/solapp/solapp.js start";
      }
      if ((_base1 = pkg.scripts).test == null) {
        _base1.test = "node ./node_modules/solapp/solapp.js test";
      }
      if ((_ref1 = pkg.html5) != null) {
        if (_ref1.files == null) {
          _ref1.files = [];
        }
      }
      if (pkg.dependencies == null) {
        pkg.dependencies = {};
      }
      if (pkg.name !== "solapp") {
        if ((_base2 = pkg.dependencies).solapp == null) {
          _base2.solapp = "*";
        }
      }
      return pkg.repository = {
        type: "git",
        url: "http://github.com/" + pkg.owner + "/" + pkg.name + ".git"
      };
    };
    genReadme = function(project) {
      var isCode, line, pkg, prevWasCode, result, source, _i, _len, _ref1;
      source = project.source;
      pkg = project["package"];
      result = "";
      if (fs.existsSync("" + project.dirname + "/meta/feature.png")) {
        result += "![" + pkg.name + "](https://raw.github.com/" + pkg.owner + "/" + pkg.name + "/master/meta/feature.png\n";
      }
      result += "# " + (pkg.title || pkg.name) + "\n";
      result += "[![ci](https://secure.travis-ci.org/" + pkg.owner + "/" + pkg.name + ".png)](http://travis-ci.org/" + pkg.owner + "/" + pkg.name + ")\n";
      result += "\n" + pkg.description + "\n";
      _ref1 = source.split("\n");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        if (line.trim() === "#!/usr/bin/env coffee") {
          continue;
        }
        if ((line.search(/^\s*#/)) === -1) {
          line = "    " + line;
          isCode = true;
        } else {
          line = line.replace(/^\s*# ?/, "");
          line = line.replace(new RegExp("(.*){{" + "{(\\d)(.*)"), function(_, a, header, b) {
            var i;
            return ((function() {
              var _j, _results;
              _results = [];
              for (i = _j = 1; 1 <= +header ? _j <= +header : _j >= +header; i = 1 <= +header ? ++_j : --_j) {
                _results.push("#");
              }
              return _results;
            })()).join("") + " " + (a + b).trim();
          });
          isCode = false;
        }
        if (isCode !== prevWasCode) {
          result += "\n";
        }
        prevWasCode = isCode;
        result += line + "\n";
      }
      result += "\n\n----\n\nAutogenerated README.md, edit " + pkg.name + ".coffee or package.json to update ";
      result += "[![repos](https://ssl.solsort.com/_solapp_" + pkg.owner + "_" + pkg.name + ".png)](https://github.com/" + pkg.owner + "/" + pkg.name + ")\n";
      return result;
    };
    updateGitIgnore = function(done) {
      return fs.readFile("" + project.dirname + "/.gitignore", "utf8", function(err, data) {
        var line, result, _i, _len;
        if (err) {
          data = "";
        }
        data = data.split("\n");
        result = {};
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          line = data[_i];
          result[line] = true;
        }
        result["node_modules"] = true;
        result["*.swp"] = true;
        return fs.writeFile("" + project.dirname + "/.gitignore", (Object.keys(result)).join("\n") + "\n", done);
      });
    };
    ensureCoffeeSource = function() {
      if (!fs.existsSync("" + project.dirname + "/" + project.name + ".coffee")) {
        console.log("writing " + project.name + ".coffee");
        return fs.writeFileSync("" + project.dirname + "/" + project.name + ".coffee", "#!/bin/env coffee\n#" + "{" + "{{1 Boilerplate\n#\n# Define `isNodeJs` in a way such that it can be optimised away by uglify-js\n \nif typeof isNodeJs != \"boolean\"\n  (global? || window?).isNodeJs = if process?.versions?.node then true else false\n\n#" + "{" + "{{1 Meta information\n\nexports.about =\n  fullname: \"" + project.name + "\"\n  description: \"...\"\n  html5:\n    css: [\n      \"//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css\"\n      \"//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css\"\n    ]\n    js: [\n      \"//code.jquery.com/jquery-1.10.2.min.js\"\n      \"//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js\"\n    ]\n    files: [\n    ]\n  dependencies:\n    solapp: \"*\"\n\n#" + "{" + "{{1 Main\n\nexports.main = (opt) ->\n  opt.setStyle {h1: {backgroundColor: \"green\"}}\n  opt.setContent [\"div\", [\"h1\", \"hello world\"]]\n  opt.done()\n");
      }
    };
    ensureSolAppInstalled = function(done) {
      if (fs.existsSync("" + (process.cwd()) + "/node_modules/solapp")) {
        return done();
      }
      console.log("writing node_modules/solapp");
      return require("child_process").exec("mkdir node_modules; ln -s " + __dirname + " node_modules/solapp", function(err, stdout, stderr) {
        if (err) {
          throw err;
        }
        return done();
      });
    };
    ensureGit = function(done) {
      if (fs.existsSync("" + project.dirname + "/.git")) {
        return typeof done === "function" ? done() : void 0;
      }
      console.log("creating git repository...");
      return require("child_process").exec("git init && git add . && git commit -am \"initial commit\"", function(err, stdout, stderr) {
        if (err) {
          throw err;
        }
        console.log(stdout);
        console.log(stderr);
        return typeof done === "function" ? done() : void 0;
      });
    };
    project = void 0;
    loadProject = function(dirname, done) {
      return ensureSolAppInstalled(function() {
        var name, pkg;
        pkg = JSON.parse((sa.readFileSync(dirname + "/package.json")) || "{}");
        name = pkg.name || dirname.split("/").slice(-1)[0];
        project = {
          dirname: dirname,
          name: name,
          "package": pkg
        };
        ensureCoffeeSource();
        project.source = sa.readFileSync("" + dirname + "/" + project.name + ".coffee");
        project.module = require("" + dirname + "/" + project.name + ".coffee");
        expandPackage();
        return done(project);
      });
    };
    build = function(done) {
      var next, travis, version, _ref1;
      next = sa.whenDone(function() {
        return ensureGit(done);
      });
      console.log("writing package.json");
      version = project["package"].version.split(".");
      version[2] = +version[2] + 1;
      project["package"].version = version.join(".");
      fs.writeFile("" + project.dirname + "/package.json", "" + (JSON.stringify(project["package"], null, 4)) + "\n", next());
      console.log("writing .gitignore");
      updateGitIgnore(next());
      console.log("writing .travis.yml");
      travis = "language: node_js\nnode_js:\n  - 0.10 \n";
      fs.writeFile("" + project.dirname + "/.travis.yml", travis, next());
      console.log("writing manifest.appcache");
      fs.writeFile("" + project.dirname + "/manifest.appcache", "CACHE MANIFEST\n# " + project["package"].name + " " + project["package"].version + "\nCACHE\nindex.html\n" + ((((_ref1 = project["package"].html5) != null ? _ref1.files : void 0) || []).join("\n")) + "\n" + (fs.existsSync("" + project.dirname + "/icon.png") ? "icon.png" : "") + "\nNETWORK\n*\nhttp://*\nhttps://*\n", next());
      console.log("writing README.md");
      fs.writeFile("" + project.dirname + "/README.md", genReadme(project), next());
      console.log("writing " + project.name + ".js");
      return fs.writeFile("" + project.name + ".js", require("coffee-script").compile(project.source), next());
    };
    devserverJsonml = function() {
      return [
        "html", {
          manifest: "manifest.appcache"
        }, [
          "head", ["title", project["package"].title], [
            "meta", {
              "http-equiv": "content-type",
              content: "text/html;charset=UTF-8"
            }
          ], [
            "meta", {
              "http-equiv": "content-type",
              content: "IE=edge,chrome=1"
            }
          ], [
            "meta", {
              name: "HandheldFriendly",
              content: "true"
            }
          ], [
            "meta", {
              name: "viewport",
              content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,          " + (project["package"].userScalable ? "" : ", user-scalable=0")
            }
          ], [
            "meta", {
              name: "format-detection",
              content: "telephone=no"
            }
          ]
        ], ["body"]
      ];
    };
  }

  if (isNodeJs && require.main === module) {
    sa.nextTick(function() {
      return loadProject(process.cwd(), function() {
        var command, commands, fn;
        commands = {
          start: function() {
            return build();
          },
          test: function() {
            return build();
          },
          commit: function(opt) {
            var msg;
            msg = opt.args.join(" ").replace(/"/g, "\\\"");
            return build(function() {
              var command;
              command = "npm test && git commit -am \"" + msg + "\" && git pull && git push";
              if (project["package"].npmjs) {
                command += " && npm publish";
              }
              console.log("running:\n" + command);
              return require("child_process").exec(command, function(err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                if (err) {
                  throw err;
                }
              });
            });
          },
          dist: function() {
            return build();
          }
        };
        commands[void 0] = commands.start;
        command = process.argv[2];
        fn = commands[process.argv[2]] || project.module.main;
        return typeof fn === "function" ? fn(sa.extend({}, sa, {
          cmd: command,
          args: process.argv.slice(3),
          setStyle: function() {
            return void 0;
          },
          setContent: function() {
            return void 0;
          },
          done: function() {
            return void 0;
          }
        })) : void 0;
      });
    });
  }

}).call(this);
