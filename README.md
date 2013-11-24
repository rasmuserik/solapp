# SolApp
![solsort](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Utility/library for quicly making apps

Work in progress, not running yet

# About

## What

Quickly create apps

- edit `APPNAME.coffee`
- run `solapp`
- edit `package.json`
- create icon and screenshot in `meta`-folder
- done

## Usage

    solapp start

Starts devserver for app in current directory

    solapp test

Run tests for app in current directory

    solapp commit some description here

Increment package version, commit, pull, test, push, npm publish


## File structure for projects

Project files:

- APPNAME.coffee - handedited - APPNAME should be the `name` in package.json
- package.json - partly autogenerated, but also handedited
- meta/icon.png - at least 512x512 square icon
- meta/screen1.png - screenshot
- meta/screen2.png - screenshot
- meta/feature.png - 1024x500 banner
- res/* - resources for the app to use/access, will be in the same directory as the app

Generated files
- package.json - handedited and autoupdated
- .gitignore
- .travis.yml
- APPNAME.js - autogenerated from APPNAME.coffee
- README.md - autogenerated from package.json for description and APPNAME.coffee as literate code
- dist/* - various 

# Literate source code

    
    fs = require "fs"
    

## autoexpand package.json

    expandPackage = (project) ->
      pkg = (project.package ?= {})
      pkg.fullname ?= pkg.name || project.name
      pkg.author ?= "Rasmus Erik Voel Jensen (solsort.com)"
      pkg.description ?= "TODO: description here"
      pkg.name ?= project.name
      pkg.owner ?= "rasmuserik"
      pkg.version ?= "0.0.1"
      pkg.main ?= pkg.name + ".js"
      pkg.scripts ?= {}
      pkg.scripts.start ?= "node ./node_modules/solapp/solapp.js start"
      pkg.scripts.test ?= "node ./node_modules/solapp/solapp.js test"
      pkg.dependencies ?= {}
      pkg.dependencies.solapp ?= "*" if pkg.name != "solapp"
      console.log "writing package.json"
      fs.writeFile "#{project.dirname}/package.json", JSON.stringify(pkg, null, 4), (err) -> throw err if err
    

## create README.md

    genReadme = (project) ->
      source = project.source
      pkg = project.package
      result =""
      result += "![#{pkg.name}](https://raw.github.com/#{pkg.owner}/#{pkg.name}/master/meta/feature.png\n" if fs.existsSync "#{project.dirname}/meta/feature.png"
      result += "# #{pkg.fullname || pkg.name}\n"
      result += "![solsort](https://ssl.solsort.com/_solapp_#{pkg.owner}_#{pkg.name}.png)\n"
      result += "[![ci](https://secure.travis-ci.org/#{pkg.owner}/#{pkg.name}.png)](http://travis-ci.org/#{pkg.owner}/#{pkg.name})\n"
      result += "\n#{pkg.description}\n"
    
      for line in source.split("\n")
    
        if (line.search /^\s*#/) == -1
          line = "    " + line
          isCode = true
        else
          line = line.replace /^\s*# ?/, ""
          line = line.replace /(.*){{{(\d)(.*)/, (_, a, header, b) ->
            ("#" for i in [1..+header]).join("") + " " + (a + b).trim()
          isCode = false
    
    
        if isCode != prevWasCode
          result += "\n"
        prevWasCode = isCode
    
        result += line + "\n"
    
      return result
    

## loadProject

    
    loadProject = (dirname) ->
      try
        pkg = fs.readFileSync __dirname + "/package.json", "utf8"
      catch e
        pkg = "{}"
      pkg = JSON.parse pkg
      name = pkg.name || dirname.split("/").slice(-1)[0]
      result =
        dirname: dirname
        name: name
        package: pkg
        source: fs.readFileSync "#{dirname}/#{name}.coffee", "utf8"
      expandPackage result
      result
    
    

# temporary code during development

    project = loadProject process.cwd()
    
    console.log "writing README.md"
    fs.writeFileSync "#{project.dirname}/README.md", genReadme project
    
