# SolApp
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Framework for quickly creating apps

!/usr/bin/env coffee
Work in progress, not running yet

# About

## What

Goal: Quickly create apps

- edit `APPNAME.coffee`
- run `solapp`
- edit `package.json`
- create icon and screenshot in `meta`-folder
- done

## Intended features

- commands: `solapp $COMMAND`
  - `start` runs in node, and starts local development server on port 8080, watch file, and automatic reload on change.
  - `test` runs unit tests
  - `commit ...commitmsg...` run tests, increase minor version, build items in dist, git commit -a, git pull, git push, npm publish
  - `dist` build items in dist
- input
  - $APPNAME.coffee - $APPNAME should be the `name` in package.json
  - package.json - partly autogenerated, but also handedited
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
  - browser extension...
  - smarttv-apps...

## Done

- add command-line app when installing globally
- automatically update .gitignore
- generate/edit package.json
- generate README.md
- compile to $APPNAME.js
- isNodeJs - optional code - automatically removable for web environment
- Automatically create .travis.yml

## Roadmap

- 0.1 first working prototype: npm-modules, html5, phonegap-build
  - main/dispatch
  - devserver command
  - commit command
  - dist command
  - config.xml
  - manifest.appcache
  - generate index.html
- 0.2 module-dependencies and testing
  - addToHomeScreen
  - scaled icons etc.
  - test framework
  - phantomjs-test
  - minify build

# Literate source code

## initial stuff

    coffeesource = "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
    
    
    sa = exports
    window?.isNodeJs = false
    global?.isNodeJs = true if typeof isNodeJs != "boolean" and process?.versions?.node
    fs = require "fs" if isNodeJs
    require "coffee-script"
    

## utility functions
### sleep

    sa.sleep = (t,fn) -> setTimeout fn, t * 1000

### whenDone(fn) -> ()->fn

    sa.whenDone = (done) ->
      count = 0
      results = []
      ->
        idx = count
        ++count
        (args...) ->
          args.push idx
          results.push args
          done? results if results.length == count
    

### nextTick

    sa.nextTick =
      if isNodeJs
        process.nextTick
      else
        (fn) -> setTimeout fn, 0

### readFileSync
abstracted to return empty string on non-existant file, and add the ability to implement on other platforms than node

    sa.readFileSync =
      if isNodeJs
        (filename) ->
          try
            return fs.readFileSync filename, "utf8"
          catch e
            console.log "Warning, couldn't read \"#{filename}\":\n#{e}"
            return ""
       else
         -> throw "sa.readFileSync not implemented on this platform"
    

## autoexpand package.json

    if isNodeJs
      expandPackage = (project) ->
        pkg = (project.package ?= {})
        pkg.fullname ?= pkg.name || project.name
        pkg.author ?= "Rasmus Erik Voel Jensen (solsort.com)"
        pkg.description ?= "TODO: description here"
        pkg.keywords ?= []
        pkg.name ?= project.name
        pkg.version ?= "0.0.1"
        pkg.owner ?= "rasmuserik"
        pkg.main = pkg.name + ".js"
        pkg.scripts ?= {}
        pkg.scripts.start ?= "node ./node_modules/solapp/solapp.js start"
        pkg.scripts.test ?= "node ./node_modules/solapp/solapp.js test"
        pkg.dependencies ?= {}
        pkg.html5 ?=
          disabled: true
          addToHomeScreen: false
          orientation: "default"
          fullscreen: false
          css: [
            "//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
            "//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css"
          ]
          js: [
            "//code.jquery.com/jquery-1.10.2.min.js"
            "//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"
          ]
          phonegapPlugins: {}
        pkg.dependencies.solapp ?= "*" if pkg.name != "solapp"
        pkg.repository =
          type: "git"
          url: "http://github.com/#{pkg.owner}/#{pkg.name}.git"
      

## create README.md

    if isNodeJs
      genReadme = (project) ->
        source = project.source
        pkg = project.package
        result =""
        result += "![#{pkg.name}](https://raw.github.com/#{pkg.owner}/#{pkg.name}/master/meta/feature.png\n" if fs.existsSync "#{project.dirname}/meta/feature.png"
        result += "# #{pkg.fullname || pkg.name}\n"
        result += "[![ci](https://secure.travis-ci.org/#{pkg.owner}/#{pkg.name}.png)](http://travis-ci.org/#{pkg.owner}/#{pkg.name})\n"
        result += "\n#{pkg.description}\n"
      
        for line in source.split("\n")
      
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
    

## update .gitignore

    if isNodeJs
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
      

## loadProject

    
    loadProject = (dirname) ->
      pkg = JSON.parse (sa.readFileSync dirname + "/package.json") || "{}"
      name = pkg.name || dirname.split("/").slice(-1)[0]
      result =
        dirname: dirname
        name: name
        package: pkg
        source: sa.readFileSync "#{dirname}/#{name}.coffee"
      expandPackage result
      result
    

## Build

    if isNodeJs
      build = (done) ->
        console.log "updating .gitignore"
        next = sa.whenDone done
        updateGitIgnore next()
        if !fs.existsSync "#{project.dirname}/.travis.yml"
          console.log "writing .travis.yml"
          travis = "language: node_js\nnode_js:\n  - 0.10 \n"
          fs.writeFile "#{project.dirname}/.travis.yml", travis, next()
        console.log "writing package.json"
        fs.writeFile "#{project.dirname}/package.json", "#{JSON.stringify project.package, null, 4}\n", next()
        console.log "writing README.md"
        fs.writeFile "#{project.dirname}/README.md", genReadme(project), next()
        console.log "writing #{project.name}.js"
        fs.writeFile "#{project.name}.js", require("coffee-script").compile(project.source), next()
    

## Main dispatch

    if isNodeJs
      project = loadProject process.cwd()
      if !fs.existsSync "#{project.dirname}/#{project.name}.coffee"
        fs.writeFileSync "#{project.dirname}/#{project.name}.coffee", ""
    
    if isNodeJs and require.main == module then sa.nextTick ->
      commands =
        start: ->
          build()
        test: ->
          build()
        commit: ->
          build()
        dist: ->
          build()
      commands[undefined] = commands.start
      command = process.argv[2]
      fn = commands[process.argv[2]] || require("./#{project.name}.coffee").main
      fn? {
        cmd: command
        args: process.argv.slice(3)
      }
    


----

Autogenerated README.md, edit solapp.coffee or package.json to update [![repos](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)](https://github.com/rasmuserik/solapp)
