# SolApp
![solsort](https://ssl.solsort.com/_solapp_rasmuserik_solapp.png)
[![ci](https://secure.travis-ci.org/rasmuserik/solapp.png)](http://travis-ci.org/rasmuserik/solapp)

Utility/library for quicly making apps

# 

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
      result = "# #{pkg.fullname || pkg.name}\n"
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

    project = loadProject __dirname
    
    console.log "writing README.md"
    fs.writeFileSync "README.md", genReadme project
    
