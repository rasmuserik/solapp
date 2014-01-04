(function() {
  var build, compile, devserver, devserverJsonml, ensureCoffeeSource, ensureGit, ensureSolAppInstalled, expandPackage, fs, genCacheManifest, genReadme, htmlHead, loadProject, solapp, updateGitIgnore, webjs,
    __slice = [].slice;

  if (typeof isNodeJs !== "boolean") {
    exports.globalDefines = function(global) {
      var _ref;
      global.isNodeJs = (typeof process !== "undefined" && process !== null ? (_ref = process.versions) != null ? _ref.node : void 0 : void 0) ? true : false;
      global.isDevServer = typeof isDevServer !== "undefined" && isDevServer;
      return global.isTesting = isNodeJs ? process.argv.slice(2) : location.hash.slice(1).split("/");
    };
    exports.globalDefines(global);
  }

  if (isNodeJs) {
    exports.about = {
      title: "SolApp",
      description: "Framework for quickly creating apps",
      keywords: ["framework", "html5", "phonegap"],
      dependencies: {
        async: "*",
        "coffee-script": "*",
        express: "3.x",
        glob: "*",
        request: "*",
        "socket.io": "*",
        "socket.io-client": "*",
        "uglify-js": "*"
      },
      npmjs: true,
      webjs: true,
      bin: {
        solapp: "./solapp.coffee"
      }
    };
  }

  solapp = exports;

  solapp.getArgs = function() {
    if (isNodeJs) {
      return process.argv.slice(2);
    } else {
      return location.hash.slice(1).split("/");
    }
  };

  solapp.sleep = function(t, fn) {
    return setTimeout(fn, t * 1000);
  };

  solapp.extend = function() {
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

  solapp.whenDone = function(done) {
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

  solapp.nextTick = isNodeJs ? process.nextTick : function(fn) {
    return setTimeout(fn, 0);
  };

  solapp.throttleAsyncFn = function(fn, delay) {
    var lastTime, rerun, run, running, schedule, scheduled;
    delay || (delay = 1000);
    running = [];
    rerun = [];
    scheduled = false;
    lastTime = 0;
    run = function() {
      var t;
      scheduled = false;
      t = running;
      running = rerun;
      rerun = running;
      lastTime = Date.now();
      return fn(function() {
        var args, cb, _i, _len;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        for (_i = 0, _len = running.length; _i < _len; _i++) {
          cb = running[_i];
          cb.apply(null, args);
        }
        running.empty();
        return schedule();
      });
    };
    schedule = function() {
      if (rerun.length > 0 && running.length === 0 && !scheduled) {
        scheduled = true;
        return setTimeout(run, Math.max(0, lastTime - Date.now() - delay));
      }
    };
    return function(cb) {
      rerun.push(cb);
      return schedule();
    };
  };

  solapp.xmlEscape = function(str) {
    return String(str).replace(RegExp("[\x00-\x1f\x80-\uffff&<>\"']", "g"), function(c) {
      return "&#" + (c.charCodeAt(0)) + ";";
    });
  };

  solapp.obj2style = function(obj) {
    var key, val;
    return ((function() {
      var _results;
      _results = [];
      for (key in obj) {
        val = obj[key];
        key = key.replace(/[A-Z]/g, function(c) {
          return "-" + c.toLowerCase();
        });
        if (typeof val === "number") {
          val = "" + val + "px";
        }
        _results.push("" + key + ":" + val);
      }
      return _results;
    })()).join(";");
  };

  solapp.jsonml2html = function(arr) {
    var attr, key, result, tag, val, _ref, _ref1;
    if (!Array.isArray(arr)) {
      return "" + (solapp.xmlEscape(arr));
    }
    if (arr[0] === "rawhtml") {
      return arr[1];
    }
    if (((_ref = arr[1]) != null ? _ref.constructor : void 0) !== Object) {
      arr = [arr[0], {}].concat(arr.slice(1));
    }
    attr = solapp.extend(arr[1]);
    if (((_ref1 = attr.style) != null ? _ref1.constructor : void 0) === Object) {
      attr.style = solapp.obj2style(attr.style);
    }
    tag = arr[0].replace(/#([^.#]*)/, function(_, id) {
      attr.id = id;
      return "";
    });
    tag = tag.replace(/\.([^.#]*)/g, function(_, cls) {
      attr["class"] = attr["class"] === void 0 ? cls : "" + attr["class"] + " " + cls;
      return "";
    });
    result = "<" + tag + (((function() {
      var _results;
      _results = [];
      for (key in attr) {
        val = attr[key];
        _results.push(" " + key + "=\"" + (solapp.xmlEscape(val)) + "\"");
      }
      return _results;
    })()).join("")) + ">";
    if (arr.length > 2) {
      result += "" + (arr.slice(2).map(solapp.jsonml2html).join("")) + "</" + tag + ">";
    }
    return result;
  };

  if (isNodeJs) {
    fs = require("fs");
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
    ensureCoffeeSource = function(project) {
      if (!fs.existsSync("" + project.dirname + "/" + project.name + ".coffee")) {
        console.log("writing " + project.name + ".coffee");
        return fs.writeFileSync("" + project.dirname + "/" + project.name + ".coffee", "#!/usr/bin/env coffee\nrequire(\"solapp\").globalDefines global if typeof isNodeJs != \"boolean\"\nif isNodeJs \n  exports.about =\n    title: \"" + project.name + "\"\n    description: \"...\"\n    html5:\n      css: [\n        \"//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css\"\n        \"//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css\"\n      ]\n      js: [\n        \"//code.jquery.com/jquery-1.10.2.min.js\"\n        \"//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js\"\n      ]\n      files: [\n      ]\n    dependencies:\n      solapp: \"*\"\n\n#" + "{" + "{{1 Main\nexports.main = (opt) ->\n  opt.setStyle {h1: {backgroundColor: \"green\"}}\n  opt.setContent [\"div\", [\"h1\", \"hello world\"]]\n  opt.done()");
      }
    };
    expandPackage = function(project) {
      var pkg, _base, _base1, _base2, _ref;
      pkg = project["package"] = {
        name: project.name,
        version: project["package"].version || "0.0.0"
      };
      solapp.extend(pkg, project.module.about || {});
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
      if ((_ref = pkg.html5) != null) {
        if (_ref.files == null) {
          _ref.files = [];
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
    loadProject = function(dirname, done) {
      var e, name, pkg, project;
      try {
        pkg = fs.readFileSync(dirname + "/package.json", "utf8");
      } catch (_error) {
        e = _error;
        pkg = "{}";
      }
      pkg = JSON.parse(pkg);
      name = pkg.name || dirname.split("/").slice(-1)[0];
      project = {
        dirname: dirname,
        name: name,
        "package": pkg
      };
      ensureCoffeeSource(project);
      project.source = fs.readFileSync("" + dirname + "/" + project.name + ".coffee", "utf8");
      return ensureSolAppInstalled(function() {
        require("coffee-script");
        project.module = require("" + dirname + "/" + project.name + ".coffee");
        expandPackage(project);
        return done(project);
      });
    };
    ensureGit = function(project, done) {
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
    genReadme = function(project) {
      var isCode, line, pkg, prevWasCode, result, source, _i, _len, _ref, _ref1;
      source = project.source;
      pkg = project["package"];
      result = "";
      if (fs.existsSync("" + project.dirname + "/meta/feature.png")) {
        result += "![" + pkg.name + "](https://raw.github.com/" + pkg.owner + "/" + pkg.name + "/master/meta/feature.png\n";
      }
      result += "# " + (pkg.title || pkg.name) + "\n";
      result += "[![ci](https://secure.travis-ci.org/" + pkg.owner + "/" + pkg.name + ".png)](http://travis-ci.org/" + pkg.owner + "/" + pkg.name + ")\n";
      result += "\n" + pkg.description + "\n";
      _ref = source.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if ((_ref1 = line.trim()) === "#!/usr/bin/env coffee" || _ref1 === "require(\"solapp\").globalDefines global if typeof isNodeJs != \"boolean\"") {
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
      result += "\n\n----\n\nAutogenerated README.md, edit " + pkg.name + ".coffee to update ";
      result += "[![repos](https://ssl.solsort.com/_solapp_" + pkg.owner + "_" + pkg.name + ".png)](https://github.com/" + pkg.owner + "/" + pkg.name + ")";
      return result;
    };
    updateGitIgnore = function(project, write) {
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
        return write(".gitignore", (Object.keys(result)).join("\n"));
      });
    };
    genCacheManifest = function(project) {
      var _ref;
      return "CACHE MANIFEST\n# " + project["package"].name + " " + (Date()) + "\nCACHE\nindex.html\n\n" + ((((_ref = project["package"].html5) != null ? _ref.files : void 0) || []).join("\n")) + "\n\n" + (fs.existsSync("" + project.dirname + "/icon.png") ? "icon.png" : "") + "\nNETWORK\n*\nhttp://*\nhttps://*";
    };
    compile = function(project) {
      return project.jssource || (project.jssource = require("coffee-script").compile(project.source));
    };
    webjs = function(project) {
      var ast, compressor, uglify;
      if (project.webjs) {
        return project.webjs;
      }
      uglify = require("uglify-js");
      ast = uglify.parse((compile(project)).replace("{", "{var exports=window[\"" + project.name + "\"]={};"));
      ast.figure_out_scope();
      compressor = uglify.Compressor({
        warnings: false,
        global_defs: {
          isNodeJs: false,
          isDevServer: false,
          isTesting: false
        }
      });
      ast = ast.transform(compressor);
      ast.figure_out_scope();
      ast.compute_char_frequency();
      ast.mangle_names();
      return project.webjs = ast.print_to_string({
        ascii_only: true,
        inline_script: true
      });
    };
    build = function(project, done) {
      var next, write;
      next = solapp.whenDone(function() {
        return ensureGit(project, done);
      });
      write = function(name, content) {
        console.log("writing " + name);
        return fs.writeFile("" + project.dirname + "/" + name, content + "\n", next());
      };
      write("README.md", genReadme(project));
      write("package.json", JSON.stringify(project["package"], null, 4));
      updateGitIgnore(project, write);
      write(".travis.yml", "language: node_js\nnode_js:\n  - 0.10");
      if (project["package"].html5) {
        write("manifest.appcache", genCacheManifest(project));
      }
      if (project["package"].npmjs) {
        write("" + project.name + ".js", compile(project));
      }
      if (project["package"].webjs) {
        return write("" + project.name + ".min.js", webjs(project));
      }
    };
    devserverJsonml = function(project) {
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
              content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" + (project["package"].userScalable ? "" : ", user-scalable=0")
            }
          ], [
            "meta", {
              name: "format-detection",
              content: "telephone=no"
            }
          ]
        ], ["body", ""]
      ];
    };
    htmlHead = function(project) {
      var head, str;
      head = [
        ["title", project["package"].title], [
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
            name: "format-detection",
            content: "telephone=no"
          }
        ]
      ];
      str = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0";
      if (project["package"].userScalable) {
        str += ", user-scalable=0";
      }
      head.push([
        "meta", {
          name: "viewport",
          content: str
        }
      ]);
      return head;
    };
    devserver = function(opt) {
      var app, express;
      express = require("express");
      app = express();
      app.all("/", function(req, res) {
        return res.end("<!DOCTYPE html>" + solapp.jsonml2html([
          "html", ["head"].concat(htmlHead(opt.project).concat([
            [
              "script", {
                src: "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
              }, ""
            ], ["style#solappStyle", ""]
          ])), [
            "body", ["div#solappContent", ""], ["script", ["rawhtml", "global=window;exports={};isDevServer=true"]], [
              "script", {
                type: "text/coffeescript",
                src: "node_modules/solapp/solapp.coffee"
              }, ""
            ], [
              "script", {
                type: "text/coffeescript"
              }, ["rawhtml", "window.exports={}"]
            ], [
              "script", {
                type: "text/coffeescript",
                src: "" + opt.project.name + ".coffee"
              }, ""
            ], [
              "script", {
                type: "text/coffeescript"
              }, ["rawhtml", "require('solapp').devserverMain(" + (JSON.stringify(opt.project["package"])) + ")"]
            ]
          ]
        ]));
      });
      app.use(express["static"](process.cwd()));
      app.listen(8080);
      return console.log("started devserver on port 8080");
    };
  }

  if (isDevServer) {
    window.require = function(module) {
      if (module === "solapp") {
        return solapp;
      } else {
        throw "not implemented";
      }
    };
    solapp.devserverMain = function(pkg) {
      var opt, _ref;
      opt = {
        args: [],
        setStyle: function(style) {
          var key, val;
          return document.getElementById("solappStyle").innerHTML = ((function() {
            var _results;
            _results = [];
            for (key in style) {
              val = style[key];
              _results.push("" + key + "{" + (solapp.obj2style(val)) + "}");
            }
            return _results;
          })()).join("");
        },
        setContent: function(html) {
          return document.getElementById("solappContent").innerHTML = solapp.jsonml2html(html);
        },
        done: function() {
          return void 0;
        }
      };
      if (solapp.getArgs()[0] === "test") {
        return typeof exports.test === "function" ? exports.test({
          done: function() {
            return void 0;
          }
        }) : void 0;
      } else if ((_ref = solapp.getArgs()[0]) === "start" || _ref === "commit" || _ref === "build") {
        return void 0;
      } else {
        return exports.main(solapp.extend({}, solapp, opt));
      }
    };
  }

  if (isNodeJs) {
    (function() {
      var commit;
      commit = function(opt) {
        var msg, project, version;
        project = opt.project;
        msg = opt.args.join(" ").replace(/"/g, "\\\"");
        version = (project["package"].version || "0.0.1").split(".");
        version[2] = +version[2] + 1;
        project["package"].version = version.join(".");
        return build(project, function() {
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
      };
      if (require.main === module) {
        return solapp.nextTick(function() {
          return loadProject(process.cwd(), function(project) {
            var command, commands, fn;
            commands = {
              start: devserver,
              test: function(opt) {
                return build(project, function() {
                  var _base;
                  return typeof (_base = project.module).test === "function" ? _base.test({
                    done: opt.done
                  }) : void 0;
                });
              },
              commit: commit,
              build: function(opt) {
                return build(project, opt.done);
              }
            };
            command = process.argv[2];
            fn = commands[process.argv[2]] || project.module.main;
            return typeof fn === "function" ? fn(solapp.extend({}, solapp, {
              project: project,
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
    })();
  }

  exports.main = function() {
    return void 0;
  };

}).call(this);

