# solapp
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Framework for simple app creation

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

- generate/edit package.json
- generate README.md
- compile to $APPNAME.js
- isNodeJs - optional code - automatically removable for web environment

## Backlog

- main/dispatch
- Automatically update .gitignore
- Automatically create .travis.yml
- commit command
- devserver command
- dist command
- generate index.html
- manifest.appcache
- config.xml
- addToHomeScreen
- test framework
- scaled icons etc.
- test framework
- phantomjs-test
- minify build

# Literate source code

## initial stuff

    coffeesource = "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
    
    sa = exports
    global?.isNodeJs = true if typeof isNodeJs != "boolean" and process?.versions?.node
    

## utility functions
### sleep

    sa.sleep = (t,fn) -> setTimeout fn, t * 1000

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
            return (require "fs").readFileSync filename, "utf8"
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
        pkg.name ?= project.name
        pkg.owner ?= "rasmuserik"
        pkg.version ?= "0.0.1"
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
        result += "![#{pkg.name}](https://raw.github.com/#{pkg.owner}/#{pkg.name}/master/meta/feature.png\n" if (require "fs").existsSync "#{project.dirname}/meta/feature.png"
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
      project = loadProject process.cwd()
      build = ->
        console.log "writing package.json"
        (require "fs").writeFile "#{project.dirname}/package.json", "#{JSON.stringify project.package, null, 4}\n", (err) -> throw err if err
        console.log "writing README.md"
        require("fs").writeFileSync "#{project.dirname}/README.md", genReadme project
        console.log "writing #{project.name}.js"
        require("fs").writeFileSync "#{project.name}.js", require("coffee-script").compile(project.source)
    

## Main dispatch

    if isNodeJs and require.main == module
      console.log process.argv
      sa.nextTick ->
        require "coffee-script"
        require("./#{project.name}.coffee").main()
    

# main

    sa.main = (args...)->
      build()
    


----

Autogenerated README.md, edit solapp.coffee or package.json to update [![repos](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)](https://github.com/rasmuserik/solapp)
