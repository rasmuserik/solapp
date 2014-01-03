# SolApp
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Framework for quickly creating apps

Work in progress, not running yet

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
  - web-javascript (bower)
  - browser extension...
  - smarttv-apps...

## Versions

- version 0.1
- development
  - define global in devserver/web-client
  - basic require("solapp")-handling on client
  - define isNodeJs etc with `require("solapp").be global`
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

## Roadmap

- 0.1 first working prototype: npm-modules, html5, phonegap-build
  - `build` command
  - `test` command
  - refactor/cleanup
  - minified js-library for web
- 0.2 real-world use within 360º, uccorg-backend and maybe more
  - stuff needed for 360º 
  - stuff needed for uccorg backend
  - autoreload devserver content on file change, restart/execute server
  - api-creation-library
  - faye-support
  - only increment version on publish
    - have date/time instead of version in manifest
  - basic publish command with git-tag
- later
  - generate index.html
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

# Meta information

    exports.about =
      title: "SolApp"
      description: "Framework for quickly creating apps"
      dependencies:
        async: "*"
        "coffee-script": "*"
        express: "3.x"
        glob: "*"
        request: "*"
        "socket.io": "*"
        "socket.io-client": "*"
        "uglify-js": "*"
      npmjs: {}
      keywords: ["framework", "html5", "phonegap"]
      bin: {solapp: "./solapp.coffee"}
    

# Boilerplate

    solapp = exports
    exports.be = (global) ->
      global.solapp = solapp
      if typeof isNodeJs != "boolean"
        global.isNodeJs = if process?.versions?.node then true else false
        global.isDevServer = typeof isDevServer != "undefined" && isDevServer
        global.isTesting = isNodeJs && process.argv[2] == "test"
    exports.be global
    
    

# Initial stuff

    if isNodeJs
      coffeesource = "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
      fs = require "fs"
      require "coffee-script"
    

# Utility functions
## sleep

    solapp.sleep = (t,fn) -> setTimeout fn, t * 1000

## extend

    solapp.extend = (target, sources...) ->
      for source in sources
        for key, val of source
          target[key] = val
      target

## whenDone - combining several callbacks into a single one

Utility function for combining several callbacks into a single one. `fn = solapp.whenDone(done)` returns a function `fn` where each call `done1 = fn(); done2 = fn(); ...` returns new callback functions, such that when all of `done1 done2 ...` has been called once, then done will be called. 


    solapp.whenDone = (done) ->
      count = 0
      results = []
      ->
        idx = count
        ++count
        (args...) ->
          args.push idx
          results.push args
          done? results if results.length == count
    

## nextTick

    solapp.nextTick = if isNodeJs then process.nextTick else (fn) -> setTimeout fn, 0

## throttleAsyncFn - throttle asynchronous function

    solapp.throttleAsyncFn = (fn, delay) ->
      delay ||= 1000
      running = []
      rerun = []
      scheduled = false
      lastTime = 0
      run = ->
        scheduled = false
        t = running; running = rerun; rerun = running
        lastTime = Date.now()
        fn (args...) ->
          for cb in running
            cb args...
          running.empty()
          schedule()
          
      schedule = ->
        if rerun.length > 0 && running.length == 0 && !scheduled
          scheduled = true
          setTimeout run, Math.max(0, lastTime - Date.now() - delay)
    
      (cb) ->
        rerun.push cb
        schedule()
    

## xmlEscape

    solapp.xmlEscape = (str) -> String(str).replace RegExp("[\x00-\x1f\x80-\uffff&<>\"']", "g"), (c) -> "&##{c.charCodeAt 0};"

## obj2style

    solapp.obj2style = (obj) ->
      (for key, val of obj
        key = key.replace /[A-Z]/g, (c) -> "-" + c.toLowerCase()
        val = "#{val}px" if typeof val == "number"
        "#{key}:#{val}"
      ).join ";"

## jsonml2html

    solapp.jsonml2html = (arr) ->
      return "#{solapp.xmlEscape arr}" if !Array.isArray(arr)

raw html, useful for stuff which shouldn't be xmlescaped etc.

      return arr[1] if arr[0] == "rawhtml"

normalise jsonml, make sure it contains attributes

      arr = [arr[0], {}].concat arr.slice(1) if arr[1]?.constructor != Object
      attr = solapp.extend arr[1]

convert style objects to strings

      attr.style = solapp.obj2style attr.style if attr.style?.constructor == Object

shorthand for classes and ids

      tag = arr[0].replace /#([^.#]*)/, (_, id) -> attr.id = id; ""
      tag = tag.replace /\.([^.#]*)/g, (_, cls) ->
        attr["class"] = if attr["class"] == undefined then cls else "#{attr["class"]} #{cls}"
        ""

create actual tag string

      result = "<#{tag}#{(" #{key}=\"#{solapp.xmlEscape val}\"" for key, val of attr).join ""}>"

add children and endtag, if there are children. `<foo></foo>` is done with `["foo", ""]`

      result += "#{arr.slice(2).map(solapp.jsonml2html).join ""}</#{tag}>" if arr.length > 2
      return result
    

## readFileSync

TODO: probably remove

abstracted to return empty string on non-existant file, and add the ability to implement on other platforms than node

    if isNodeJs
      solapp.readFileSync =
        (filename) ->
          try
            return fs.readFileSync filename, "utf8"
          catch e
            console.log "Warning, couldn't read \"#{filename}\":\n#{e}"
            return ""
    

# SolApp app build/creation

    if isNodeJs

## expandPackage - create package.json content, and increment minor version

      expandPackage = () ->
        version = (project.package.version || "0.0.1").split "."
        version[2] = +version[2] + 1
        pkg = project.package =
          name: project.name
          version: version.join "."
        solapp.extend pkg, project.module.about || {}
        pkg.title ?= pkg.name
        pkg.author ?= "Rasmus Erik Voel Jensen (solsort.com)"
        pkg.owner ?= "rasmuserik"
        pkg.main = pkg.name + ".js"
        pkg.scripts ?= {}
        pkg.scripts.start ?= "node ./node_modules/solapp/solapp.js start"
        pkg.scripts.test ?= "node ./node_modules/solapp/solapp.js test"
        pkg.html5?.files ?= []
        pkg.dependencies ?= {}
        pkg.dependencies.solapp ?= "*" if pkg.name != "solapp"
        pkg.repository =
          type: "git"
          url: "http://github.com/#{pkg.owner}/#{pkg.name}.git"
      

## genReadme - create README.md

      genReadme = (project) ->
        source = project.source
        pkg = project.package
        result =""
        result += "![#{pkg.name}](https://raw.github.com/#{pkg.owner}/#{pkg.name}/master/meta/feature.png\n" if fs.existsSync "#{project.dirname}/meta/feature.png"
        result += "# #{pkg.title || pkg.name}\n"
        result += "[![ci](https://secure.travis-ci.org/#{pkg.owner}/#{pkg.name}.png)](http://travis-ci.org/#{pkg.owner}/#{pkg.name})\n"
        result += "\n#{pkg.description}\n"
      
        for line in source.split("\n")
          continue if line.trim() == "#!/usr/bin/env coffee"
      
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
      
        result += "\n\n----\n\nAutogenerated README.md, edit #{pkg.name}.coffee or package.json to update "
        result += "[![repos](https://ssl.solsort.com/_solapp_#{pkg.owner}_#{pkg.name}.png)](https://github.com/#{pkg.owner}/#{pkg.name})\n"
      
        return result
    

## updateGitIgnore - update .gitignore

      updateGitIgnore = (done) ->
        fs.readFile "#{project.dirname}/.gitignore", "utf8", (err, data) ->
          data = "" if err
          data = data.split("\n")
          result = {}
          for line in data
            result[line] = true
          result["node_modules"] = true
          result["*.swp"] = true
          fs.writeFile "#{project.dirname}/.gitignore", (Object.keys result).join("\n")+"\n", done
      

## ensureCoffeeSource

      ensureCoffeeSource = ->
        if !fs.existsSync "#{project.dirname}/#{project.name}.coffee"
          console.log "writing #{project.name}.coffee"
          fs.writeFileSync "#{project.dirname}/#{project.name}.coffee", """

!/bin/env coffee

            require("solapp").be global 
            

#{"{"}{{1 Meta information

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
            

#{"{"}{{1 Main

            exports.main = (opt) ->
              opt.setStyle {h1: {backgroundColor: "green"}}
              opt.setContent ["div", ["h1", "hello world"]]
              opt.done()
    
            """

## ensureSolAppInstalled

TODO: probably remove this one, when solapp-object is passed to main

      ensureSolAppInstalled = (done) ->
        return done() if fs.existsSync "#{process.cwd()}/node_modules/solapp"
        console.log "writing node_modules/solapp"
        require("child_process").exec "mkdir node_modules; ln -s #{__dirname} node_modules/solapp", (err, stdout, stderr) ->
          throw err if err
          done()
      

## ensureGit

      ensureGit = (done) ->
        return done?() if fs.existsSync "#{project.dirname}/.git"
        console.log "creating git repository..."
        require("child_process").exec "git init && git add . && git commit -am \"initial commit\"", (err, stdout, stderr) ->
          throw err if err
          console.log stdout
          console.log stderr
          done?()
      

## loadProject - create module-global project-var

TODO, maybe make this passed around as parameter

      project = undefined
      loadProject = (dirname, done) ->
        ensureSolAppInstalled ->
          pkg = JSON.parse (solapp.readFileSync dirname + "/package.json") || "{}"
          name = pkg.name || dirname.split("/").slice(-1)[0]
          project =
            dirname: dirname
            name: name
            package: pkg
          ensureCoffeeSource()
          project.source = solapp.readFileSync "#{dirname}/#{project.name}.coffee"
          project.module = require("#{dirname}/#{project.name}.coffee")
          expandPackage()
          done project
      

## build - Actual build function

      build = (done) ->
        next = solapp.whenDone ->
          ensureGit done
    
        console.log "writing package.json"
        version = project.package.version.split "."
        version[2] = +version[2] + 1
        project.package.version = version.join "."
        fs.writeFile "#{project.dirname}/package.json", "#{JSON.stringify project.package, null, 4}\n", next()
    
        console.log "writing .gitignore"
        updateGitIgnore next()
    
        console.log "writing .travis.yml"
        travis = "language: node_js\nnode_js:\n  - 0.10 \n"
        fs.writeFile "#{project.dirname}/.travis.yml", travis, next()
    
        console.log "writing manifest.appcache"
        fs.writeFile "#{project.dirname}/manifest.appcache", """
          CACHE MANIFEST

#{project.package.name} #{project.package.version}

          CACHE
          index.html

{(project.package.html5?.files || []).join "\n"}
{if fs.existsSync "#{project.dirname}/icon.png" then "icon.png" else ""}

          NETWORK
          *
          http://*
          https://*
    
        """, next()
    
        console.log "writing README.md"
        fs.writeFile "#{project.dirname}/README.md", genReadme(project), next()
    
        console.log "writing #{project.name}.js"
        fs.writeFile "#{project.name}.js", require("coffee-script").compile(project.source), next()
    

## devserverJsonml - create the html jsonml-object for the dev-server

      devserverJsonml = (project) ->
        ["html", {manifest: "manifest.appcache"},
          ["head"
            ["title", project.package.title]
            ["meta", {"http-equiv": "content-type", content: "text/html;charset=UTF-8"}]
            ["meta", {"http-equiv": "content-type", content: "IE=edge,chrome=1"}]
            ["meta", {name: "HandheldFriendly", content: "true"}]
            ["meta", {name: "viewport", content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0#{
              if project.package.userScalable then "" else ", user-scalable=0"}"}]
            ["meta", {name: "format-detection", content: "telephone=no"}]
          ]
          ["body", ""]
        ]
      

# devserver

    if isNodeJs

## htmlHead

      htmlHead = (project) ->
        head = [
            ["title", project.package.title]
            ["meta", {"http-equiv": "content-type", content: "text/html;charset=UTF-8"}]
            ["meta", {"http-equiv": "content-type", content: "IE=edge,chrome=1"}]
            ["meta", {name: "HandheldFriendly", content: "true"}]
            ["meta", {name: "format-detection", content: "telephone=no"}]
        ]
        str = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"
        str += ", user-scalable=0" if project.package.userScalable
        head.push ["meta", {name: "viewport", content: str}]
        return head

## devserver

      devserver = (opt) ->
    
        express = require "express"
        app = express()
        app.all "/", (req, res) ->
          res.end "<!DOCTYPE html>" + solapp.jsonml2html ["html"
            ["head"].concat htmlHead(opt.project).concat [
              ["script", {src: coffeesource}, ""]
              ["style#solappStyle", ""]]
            ["body"
              ["div#solappContent", ""]
              ["script", ["rawhtml", "global=window;exports={};isDevServer=true"]]
              ["script", {type: "text/coffeescript", src: "node_modules/solapp/solapp.coffee"}, ""]
              ["script", {type: "text/coffeescript"}, ["rawhtml", "window.exports={}"]]
              ["script", {type: "text/coffeescript", src: "#{opt.project.name}.coffee"}, ""]
              ["script", {type: "text/coffeescript"}, ["rawhtml", "require('solapp').devserverMain(#{JSON.stringify opt.project.package})"]]]]
        app.use express.static process.cwd()
        app.listen 8080
        console.log "started devserver on port 8080"
    

## Code running in browser

    if isDevServer
      window.require = (module) -> if module == "solapp" then return solapp else throw "not implemented"
      solapp.devserverMain = (pkg)->
        opt =
          args: []
          setStyle: (style) ->
            document.getElementById("solappStyle").innerHTML =
              ("#{key}{#{solapp.obj2style val}}" for key, val of style).join ""
          setContent: (html) -> document.getElementById("solappContent").innerHTML = solapp.jsonml2html html
          done: -> undefined
        exports.main solapp.extend {}, solapp, opt
    

# SolApp dispatch

    if isNodeJs then do ->

## commit

      commit = (opt) ->
        msg = opt.args.join(" ").replace(/"/g, "\\\"")
        build ->
          command = "npm test && git commit -am \"#{msg}\" && git pull && git push"
          if project.package.npmjs
            command += " && npm publish"
          console.log "running:\n#{command}"
          require("child_process").exec command, (err, stdout, stderr) ->
            console.log stdout
            console.log stderr
            throw err if err
    

## dist

      dist = (opt) ->
        build()
    

## main dispatch

      if require.main == module then solapp.nextTick ->
        loadProject process.cwd(), ->
          commands =
            start: devserver
            test: -> build() #TODO
            commit: commit
            dist: build
          command = process.argv[2]
          fn = commands[process.argv[2]] || project.module.main
          fn?(solapp.extend {}, solapp, {
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

Autogenerated README.md, edit solapp.coffee or package.json to update [![repos](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)](https://github.com/rasmuserik/solapp)
