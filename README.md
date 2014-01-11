# SolApp
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Tool for quickly creating apps


# About

## What

Goal: Quickly create apps

- run `solapp`
- edit `$APPNAME.coffee`
- create github repos, and set remote
- optionally
  - create assets such as `icon.png`, `splash.png`, etc., and git-add them
  - add project on travis-ci, and/or build.phonegap websites
- run `solapp commit ...commit-message...`

and now the app is pushed to github, and optionally published with npm, and bower, and optionally a phonegap-build in progress



## Configuration

Assign an object to `exports.about` with the following content

- `title` publicly displayed name of app (max 30 char)
- `description` publicly displayed description of application, - should be max 4000 characters
- `keywords` list of keywords
- `author` creator of the app - defaults to me (Rasmus Erik)
- `name` name of app for files, in registry, github repos, etc. Must be the source filename, npm-package-name, repository-name, ...
- `owner` github user/organisation that owns the app, ie. repository is `github.com/owner/name`
- `dependencies` npm dependencies
- `npmjs` build and publish npm package
- `html5` build html5-app if present
  - `userScaleable` user is able to zoom in/out on touch devices if truthy
  - `addToHomeScreen` add http://cubiq.org/add-to-home-screen if truthy
  - `files` list of files in repository to include in the app
  - `css` list of urls to stylesheets to include in the app
  - `js` list of utls to javascripts to include in the app
  - `background` background color - also for splash-image, must be in format `#xxxxxx`
- `phonegap` build phonegap app if present, use configuration from html5-section in addition to this section, see also http://docs.build.phonegap.com
  - `fullscreen`
  - `orientation` default, portrait or landscape
  - `plugins` object with which phonegap plugins to use
- `webjs` build minified html-library if present

any additional properties will also be passed on into `package.json`

## Intended features

- commands (`solapp command`):
  - `start` runs in node, and starts local development server on port 8080, watch file, and automatic reload on change.
  - `test` runs unit tests
  - `commit ...commitmsg...` run tests, increase minor version, `build`, git commit -a, git pull, git push
  - `build` build all items
  - `publish ...commitmsg...` run tests, increase minor version, `commit`, git-tag, upload to npm, phonegap-build, bower, custom dist scripts ...
  - `create` - ensure name is available, mkdir, create skeleton app
- input
  - $APPNAME.coffee - $APPNAME should be the `name` in package.json
  - splash.png
  - icon.png - at least 512x512 square icon
  - meta/screen1.png meta/screen2.png ... - screenshot 640x1136
  - meta/feature.png - 1024x500 banner
  - meta/demo.webm - short video
  - various resources
- output (depending on package.json)
  - package.json
  - .gitignore
  - .travis.yml
  - README.md - generated from literate $APPNAME.coffee, and package.json
  - $APPNAME.js - node.js app
  - manifest.appcache - application cache for offline, generated by walking the directory, and read current version from package.json
  - config.xml - for phonegap build etc.
  - index.html - html
  - dist/ - scaled icons,
- targets
  - node.js (npm)
  - devserver served html5 for development (not written to disk)
  - minified html5 with cache-manifest,add-to-home-screen,ie-pinned-site(msapplication-meta-tags) etc. (www, Firefox Marketplace, Google Chrome Web Store, Facebook App Center)
  - phonegap-build & cordova (Google Play, iOS App Store, Windows Phone Store, Ubuntu Software Center, Windows Store, Mac App Store, BlackBerry World, Amazon Appstore, Steam Greenlight)
  - node-webkit
  - web-javascript (bower)
  - browser extension...
  - smarttv-apps...

## Versions

- version 0.0
  - refactor/cleanup
  - minified js-library for web
  - `build` command
  - `test` command
  - define global in devserver/web-client
  - basic require("solapp")-handling on client
  - define isNodeJs etc with `require("solapp").globalDefines global`
  - basic devserver
  - autocreate project in current directory
  - use `exports.about` for package-info, overriding/overwriting package.json
  - manifest.appcache
  - main/dispatch
  - commit command
  - add command-line app when installing globally
  - automatically update .gitignore
  - generate/edit package.json
  - generate README.md
  - compile to $APPNAME.js
  - isNodeJs - optional code - automatically removable for web environment
  - Automatically create .travis.yml
  - split out into microlibraries, ie. `require("platformDefs").register global if typeof isNodeJs != "boolean"`, `jsonml2html`, `uutil`, ...
  - have date/time instead of version in manifest
  - only increment version on commit/publish
  - add devserver-`solsort.com/_..`
  - fix userScaleable bug...
  - fix require in client apps
  - exports.about has package section, and not everything is moved into package.json
- development

## Roadmap

- now
- 0.1 first working prototype, running 360º and uccorg-backend etc.
  - stuff needed for 360º
  - stuff needed for uccorg backend
  - api-creation-library
  - manager server - keep-alive/restart
    - start/restart/stop "app-dirname"
  - solnet
  - web-server - w/static+api-server - url: /foo/bar/baz `.split "."`, urldecode, json if `/^([0-9"[{]|true|false|null)/`, string otherwise - foo must be registrated endpoint, json parameters can be overwritten with POST json object (array of parameters, without endpoint length)
  - basic publish command with git-tag
  - map name foo-bar to window.fooBar when webjs
- later
  - cleanup dev-server
  - autoreload devserver content on file change, restart/execute server
  - make sure that html5-csses/jses are include in devserver
  - generate table-of-contents in readme
  - url in exports.about creates link from title in readme
  - generate index.html
  - automatic creation of gh-pages branch with publication of index.html
  - config.xml
  - publish command
  - `create` - and disable autocreation in current dir
  - automatic creation/submission of phonegap apps using phonegap app api
  - routes on client
  - optional appcache/index.html/$APPNAME.js/...
  - addToHomeScreen
  - scaled icons etc.
  - test framework
  - phantomjs-test
  - minify build
  - infer dependencies from `require`-analysis of compiled coffeescript
  - automatic screenshot via phantomjs

# Dependencies and meta information


    uu = require "uutil"
    jsonml2html = require "jsonml2html"
    
    if isNodeJs
      exports.about =
        title: "SolApp"
        description: "Tool for quickly creating apps"
        keywords: []
        dependencies:
          platformenv: "*"
          uutil: "*"
          jsonml2html: "*"
        npmjs: true
        webjs: true
        package:
          dependencies:
            "coffee-script": "*"
            express: "3.x"
            "uglify-js": "*"

Passed on into package.json, to allow installing solapp binary with `npm install`

          bin: {solapp: "./solapp.coffee"}
    

# Utility functions

    solapp = exports

## getArgs

    solapp.getArgs = -> if isNodeJs then process.argv.slice(2) else location.hash.slice(1).split "/"

# SolApp tool

    if isNodeJs
      fs = require "fs"

## load project, and create project.package etc.
### loadProject - create module-global project-var

      loadProject = (dirname, done) ->
        try
          pkg = fs.readFileSync dirname + "/package.json", "utf8"
        catch e
          pkg = "{}"
        pkg = JSON.parse pkg
    
        name = pkg.name || dirname.split("/").slice(-1)[0]
        project =
          dirname: dirname
          name: name
          package: pkg
    
        ensureCoffeeSource project
        project.source = fs.readFileSync "#{dirname}/#{project.name}.coffee", "utf8"
    
        ensureSolAppInstalled ->
          require "coffee-script"
          project.module = require("#{dirname}/#{project.name}.coffee")
          expandPackage project
          done project
    

### ensureSolAppInstalled

TODO: probably remove this one, when solapp-object is passed to main

      ensureSolAppInstalled = (done) ->
        return done() if fs.existsSync "#{process.cwd()}/node_modules/solapp"
        console.log "writing node_modules/solapp"
        require("child_process").exec "mkdir node_modules; ln -s #{__dirname} node_modules/solapp", (err, stdout, stderr) ->
          throw err if err
          done()
    

### ensureCoffeeSource

      ensureCoffeeSource = (project) ->
        if !fs.existsSync "#{project.dirname}/#{project.name}.coffee"
          console.log "writing #{project.name}.coffee"
          fs.writeFileSync "#{project.dirname}/#{project.name}.coffee", """
            \n##{"{"}{{1 Actual source code
            if isNodeJs 
              exports.about =
                title: "#{project.name}"
                description: "..."
                html5:
                  css: [
                    "//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
                    "//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"
                  ]
                  js: [
                    "//code.jquery.com/jquery-1.10.2.min.js"
                    "//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"
                  ]
                  files: [
                  ]
                dependencies:
                  solapp: "*"
    
            exports.main = (opt) ->
              opt.setStyle {h1: {backgroundColor: "green"}}
              opt.setContent ["div", ["h1", "hello world"]]
              opt.done()"""
    

### expandPackage - create package.json content, and increment minor version

      expandPackage = (project) ->
        about = project.about = project.module.about
        about.name ?= project.name
        about.owner ?= "rasmuserik"
    
        pkg = project.package =
          name: project.name
          version: project.package.version || "0.0.0"
        uu.extend pkg, about.package || {}
        pkg.fullname ?= about.title || about.name
        pkg.description ?= about.description
        pkg.keywords ?= about.keywords || []
        pkg.author ?= about.author || "Rasmus Erik Voel Jensen (solsort.com)"
        pkg.main ?= pkg.name + ".js"
        pkg.scripts ?= {}
        pkg.scripts.start ?= "node ./node_modules/solapp/solapp.js start"
        pkg.scripts.test ?= "node ./node_modules/solapp/solapp.js test"
        pkg.html5?.files ?= []
        pkg.dependencies ?= {}
        uu.extend pkg.dependencies, project.about.dependencies
        pkg.dependencies.platformenv = "*"
        pkg.repository =
          type: "git"
          url: "http://github.com/#{about.owner}/#{about.name}.git"
    

## build
### build - Actual build function

      build = (project, done) ->
        next = uu.whenDone -> ensureGit project, done
        write = (name, content) ->
          console.log "writing #{name}"
          fs.writeFile "#{project.dirname}/#{name}", content + "\n", next()
    
        write "README.md", genReadme project
        write "package.json", JSON.stringify(project.package, null, 4)
        updateGitIgnore project, next()
        write ".travis.yml", "language: node_js\nnode_js:\n  - 0.10"
        write "manifest.appcache", genCacheManifest project if project.about.html5
        write "#{project.name}.js", compile project if project.about.npmjs
        write "#{project.name}.min.js", webjs project if project.about.webjs
    

### ensureGit

      ensureGit = (project, done) ->
        return done?() if fs.existsSync "#{project.dirname}/.git"
        console.log "creating git repository..."
        require("child_process").exec "git init && git add #{project.name}.coffee .gitignore .travis.yml README.md package.json && git commit -m \"initial commit\"", (err, stdout, stderr) ->
          throw err if err
          console.log stdout
          console.log stderr
          done?()
    

### genReadme - create README.md

      genReadme = (project) ->
        source = project.source
        pkg = project.package
        result =""
        result += "![#{project.about.name}](https://raw.github.com/#{project.about.owner}/#{project.about.name}/master/meta/feature.png\n" if fs.existsSync "#{project.dirname}/meta/feature.png"
        result += "# #{project.about.title || project.about.name}\n"
        result += "[![ci](https://secure.travis-ci.org/#{project.about.owner}/#{project.about.name}.png)](http://travis-ci.org/#{project.about.owner}/#{project.about.name})\n"
        result += "\n#{project.about.description}\n"
    
        for line in source.split("\n")
          continue if line.trim() in ["#!/usr/bin/env coffee", "require(\"platformenv\").define global if typeof isNodeJs != \"boolean\""]
    
          if (line.search /^\s*#/) == -1
            line = "    " + line
            isCode = true
          else
            line = line.replace /^\s*# ?/, ""
            line = line.replace new RegExp("(.*){{" + "{(\\d)(.*)"), (_, a, header, b) ->
              ("#" for i in [1..+header]).join("") + " " + (a + b).trim()
            isCode = false
    
    
          if isCode != prevWasCode
            result += "\n"
          prevWasCode = isCode
    
          result += line + "\n"
    
        result += "\n\n----\n\nAutogenerated README.md, edit #{project.about.name}.coffee to update "
        result += "[![repos](https://ssl.solsort.com/_solapp_#{project.about.owner}_#{project.about.name}.png)](https://github.com/#{project.about.owner}/#{project.about.name})"
    
        return result
    

### updateGitIgnore - update .gitignore

      updateGitIgnore = (project, done) ->
        fs.readFile "#{project.dirname}/.gitignore", "utf8", (err, data) ->
          data = "" if err
          data = data.split("\n")
          result = {}
          for line in data
            result[line] = true
          result["node_modules"] = true
          result["*.swp"] = true
          console.log "writing .gitignore"
          fs.writeFile ".gitignore", (Object.keys result).join("\n") + "\n", done
    

### genCacheManifest

      genCacheManifest = (project) -> """
          CACHE MANIFEST\n# #{project.name} #{Date()}
          CACHE
          index.html
          \n#{(project.about.html5?.files || []).join "\n"}
          \n#{if fs.existsSync "#{project.dirname}/icon.png" then "icon.png" else ""}
          NETWORK
          *
          http://*
          https://*"""
    

### compile

      compile = (project) -> project.jssource ||= require("coffee-script").compile project.source
    

### webjs

      webjs = (project) ->
        return project.webjs if project.webjs
        uglify = require("uglify-js")
        ast = uglify.parse (compile project).replace "{", "{var exports=window[\"#{project.name}\"]={};"
        ast.figure_out_scope()
        compressor = uglify.Compressor
          warnings: false
          global_defs:
            isNodeJs: false
            isDevServer: false
            isTesting: false
        ast = ast.transform compressor
      
        ast.figure_out_scope()
        ast.compute_char_frequency()
        ast.mangle_names()
        project.webjs = ast.print_to_string({ascii_only:true,inline_script:true})
    

## devserver
### devserverJsonml - create the html jsonml-object for the dev-server

      devserverJsonml = (project) ->
        ["html", {manifest: "manifest.appcache"},
          htmlHead project
          ["body", ""]
        ]
    

### htmlHead

      htmlHead = (project) ->
        head = [
            "head"
            ["title", project.about.title]
            ["meta", {"http-equiv": "content-type", content: "text/html;charset=UTF-8"}]
            ["meta", {"http-equiv": "content-type", content: "IE=edge,chrome=1"}]
            ["meta", {name: "HandheldFriendly", content: "true"}]
            ["meta", {name: "format-detection", content: "telephone=no"}]
        ]
        str = "width=device-width, initial-scale=1.0"
        str += ", minimum-scale=1.0, maximum-scale=1.0, user-scalable=0" if project.about.userScalable
        head.push ["meta", {name: "viewport", content: str}]
        return head

### devserver

      devserver = (opt) ->
    
        express = require "express"
        app = express()
        head = htmlHead opt.project
        head.push ["script", {src: "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"}, ""]
        head.push ["style#solappStyle", ""]
        head.push ["script", ["rawhtml", "
          global = window;
          isNodeJs = isTesting = false;
          isDevServer = true;
          require = function(name) { return window[name] };
        ".replace(/[ ]+/g, " ")]]
        head.push ["script", ["rawhtml", fs.readFileSync "#{__dirname}/node_modules/uutil/uutil.min.js"]]
        head.push ["script", ["rawhtml", fs.readFileSync "#{__dirname}/node_modules/jsonml2html/jsonml2html.min.js"]]
        for module, _ of opt.project.about.dependencies
          head.push ["script", {src: "node_modules/#{module}/#{module}.min.js"}, ""]
    
        app.all "/", (req, res) ->
          res.end "<!DOCTYPE html>" + jsonml2html.jsonml2html ["html"
            head
            ["body"
              ["div#solappContent", ""]
              ["script", ["rawhtml", "exports={};isDevServer=true;"]]
              ["script", {type: "text/coffeescript", src: "node_modules/solapp/solapp.coffee"}, ""]
              ["script", {type: "text/coffeescript"}, ["rawhtml", "window.solapp=exports;window.exports={}"]]
              ["script", {type: "text/coffeescript", src: "#{opt.project.name}.coffee"}, ""]
              ["script", {type: "text/coffeescript"}, ["rawhtml", "window[\"#{opt.project.name}\"]=exports;
                  require('solapp').devserverMain(#{JSON.stringify opt.project.package})"]]
              ["script", {src: "//ssl.solsort.com/_devserver_#{opt.project.about.owner}_#{opt.project.about.name}.js"}, ""]
            ]]
        app.use express.static process.cwd()
        app.listen 8080
        console.log "started devserver on port 8080"
    

### Code running in browser

    if isDevServer
      solapp.devserverMain = (pkg) ->
        opt =
          args: []
          setStyle: (style) ->
            document.getElementById("solappStyle").innerHTML =
              ("#{key}{#{require("jsonml2html").obj2style val}}" for key, val of style).join ""
          setContent: (html) -> document.getElementById("solappContent").innerHTML = jsonml2html.jsonml2html html
          done: -> undefined
    

Dispatch by first arg, - TODO merge with SolApp dispatch

        if solapp.getArgs()[0] == "test"
          exports.test? {done: -> undefined}
        else if solapp.getArgs()[0] in ["start", "commit", "build"]
          undefined
        else
          console.log solapp, opt
          exports.main require("uutil").extend {}, solapp, opt
    

## commit

    if isNodeJs
      commit = (opt) ->
        project = opt.project
        msg = opt.args.join(" ").replace(/"/g, "\\\"")
    
        version = (project.package.version || "0.0.1").split "."
        version[2] = +version[2] + 1
        project.package.version = version.join "."
    
        build project, ->
          command = "npm test && git commit -am \"#{msg}\" && git pull && git push"
          if project.about.npmjs
            command += " && npm publish"
          console.log "running:\n#{command}"
          require("child_process").exec command, (err, stdout, stderr) ->
            console.log stdout
            console.log stderr
            throw err if err
    

## SolApp dispatch

    if isNodeJs then do ->

### main dispatch

      if require.main == module then uu.nextTick ->
        loadProject process.cwd(), (project) ->
          commands =
            start: devserver
            test: (opt) ->
              build project, ->
                project.module.test? {done: opt.done}
            commit: commit
            build: (opt) -> build project, opt.done
          command = process.argv[2]
          fn = commands[process.argv[2]] || project.module.main
          fn?(uu.extend {}, solapp, {
            project: project
            cmd: command
            args: process.argv.slice(3)
            setStyle: -> undefined
            setContent: -> undefined
            done: -> undefined
          })
    

# main

    exports.main = -> undefined
    


----

Autogenerated README.md, edit solapp.coffee to update [![repos](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)](https://github.com/rasmuserik/solapp)
