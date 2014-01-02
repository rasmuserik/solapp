#!/usr/bin/env coffee
# Work in progress, not running yet
#
#{{{1 About
#
#{{{2 What
#
# Goal: Quickly create apps
#
# - run `solapp`
# - edit `$APPNAME.coffee`
# - create github repos, and set remote
# - optionally
#   - create assets such as `icon.png`, `splash.png`, etc., and git-add them
#   - add project on travis-ci, and/or build.phonegap websites
# - run `solapp commit ...commit-message...`
#
# and now the app is pushed to github, and optionally published with npm, and bower, and optionally a phonegap-build in progress
#
#
#
#{{{2 Configuration
#
# Assign an object to `exports.about` with the following content
#
# - `title` publicly displayed name of app (max 30 char)
# - `description` publicly displayed description of application, - should be max 4000 characters
# - `keywords` list of keywords
# - `author` creator of the app - defaults to me (Rasmus Erik)
# - `name` name of app for files, in registry, github repos, etc. Must be the source filename, npm-package-name, repository-name, ...
# - `owner` github user/organisation that owns the app, ie. repository is `github.com/owner/name`
# - `dependencies` npm dependencies
# - `npmjs` build and publish npm package
# - `html5` build html5-app if present
#   - `userScaleable` user is able to zoom in/out on touch devices if truthy
#   - `addToHomeScreen` add http://cubiq.org/add-to-home-screen if truthy
#   - `files` list of files in repository to include in the app
#   - `css` list of urls to stylesheets to include in the app
#   - `js` list of utls to javascripts to include in the app
#   - `background` background color - also for splash-image, must be in format `#xxxxxx`
# - `phonegap` build phonegap app if present, use configuration from html5-section in addition to this section, see also http://docs.build.phonegap.com
#   - `fullscreen`
#   - `orientation` default, portrait or landscape
#   - `plugins` object with which phonegap plugins to use
# - `webjs` build minified html-library if present
#
# any additional properties will also be passed on into `package.json`
#
#{{{2 Intended features
#
# - commands (`solapp command`): 
#   - `start` runs in node, and starts local development server on port 8080, watch file, and automatic reload on change.
#   - `test` runs unit tests
#   - `commit ...commitmsg...` run tests, increase minor version, build items in dist, git commit -a, git pull, git push, npm publish, upload to phonegap build
#   - `dist` build items in dist
# - input
#   - $APPNAME.coffee - $APPNAME should be the `name` in package.json
#   - splash.png
#   - icon.png - at least 512x512 square icon
#   - meta/screen1.png meta/screen2.png ... - screenshot 640x1136
#   - meta/feature.png - 1024x500 banner
#   - meta/demo.webm - short video
#   - various resources
# - output (depending on package.json)
#   - package.json
#   - .gitignore 
#   - .travis.yml
#   - README.md - generated from literate $APPNAME.coffee, and package.json
#   - $APPNAME.js - node.js app
#   - manifest.appcache - application cache for offline, generated by walking the directory, and read current version from package.json
#   - config.xml - for phonegap build etc.
#   - index.html - html
#   - dist/ - scaled icons, 
# - targets
#   - node.js (npm)
#   - devserver served html5 for development (not written to disk)
#   - minified html5 with cache-manifest,add-to-home-screen,ie-pinned-site(msapplication-meta-tags) etc. (www, Firefox Marketplace, Google Chrome Web Store, Facebook App Center)
#   - phonegap-build & cordova (Google Play, iOS App Store, Windows Phone Store, Ubuntu Software Center, Windows Store, Mac App Store, BlackBerry World, Amazon Appstore, Steam Greenlight)
#   - web-javascript (bower)
#   - browser extension...
#   - smarttv-apps...
#
#{{{2 Done
#
# - autocreate project in current directory
# - use `exports.about` for package-info, overriding/overwriting package.json
# - manifest.appcache
# - main/dispatch
# - commit command
# - add command-line app when installing globally
# - automatically update .gitignore
# - generate/edit package.json
# - generate README.md
# - compile to $APPNAME.js
# - isNodeJs - optional code - automatically removable for web environment
# - Automatically create .travis.yml
#
#{{{2 Roadmap
#
# - 0.1 first working prototype: npm-modules, html5, phonegap-build
#   - devserver command
#   - dist command
#   - config.xml
#   - generate index.html
#   - refactor/cleanup
# - 0.2 module-dependencies and testing
#   - automatic creation/submission of phonegap apps using phonegap app api
#   - minified js-library for web
#   - optional appcache/index.html/$APPNAME.js/...
#   - addToHomeScreen
#   - scaled icons etc.
#   - test framework
#   - phantomjs-test
#   - minify build
#
#{{{1 Meta information
exports.about =
  title: "SolApp"
  description: "Framework for quickly creating apps"
  dependencies:
    async: "*"
    "coffee-script": "*"
    express: "*"
    glob: "*"
    request: "*"
    "socket.io": "*"
    "socket.io-client": "*"
    "uglify-js": "*"
  npmjs: {}
  keywords: ["framework", "html5", "phonegap"]
  bin: {solapp: "./solapp.coffee"}

#{{{1 Boilerplate
sa = exports
sa.global = if global? then global else window
if typeof isNodeJs != "boolean"
  sa.global.isNodeJs = if process?.versions?.node then true else false
#{{{1 Initial stuff
if isNodeJs
  coffeesource = "//cdnjs.cloudflare.com/ajax/libs/coffee-script/1.6.3/coffee-script.min.js"
  fs = require "fs"
  require "coffee-script"

#{{{1 Utility functions
#{{{2 sleep
sa.sleep = (t,fn) -> setTimeout fn, t * 1000
#{{{2 extend
sa.extend = (target, sources...) ->
  for source in sources
    for key, val of source
      target[key] = val
  target
#{{{2 whenDone - combining several callbacks into a single one
#
# Utility function for combining several callbacks into a single one. `fn = sa.whenDone(done)` returns a function `fn` where each call `done1 = fn(); done2 = fn(); ...` returns new callback functions, such that when all of `done1 done2 ...` has been called once, then done will be called. 
#
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

#{{{2 nextTick
sa.nextTick = if isNodeJs then process.nextTick else (fn) -> setTimeout fn, 0
#{{{2 readFileSync 
#
# TODO: probably remove
#
# abstracted to return empty string on non-existant file, and add the ability to implement on other platforms than node
if isNodeJs
  sa.readFileSync =
    (filename) ->
      try
        return fs.readFileSync filename, "utf8"
      catch e
        console.log "Warning, couldn't read \"#{filename}\":\n#{e}"
        return ""

#{{{1 SolApp app build/creation
if isNodeJs
  #{{{2 expandPackage - create package.json content, and increment minor version
  expandPackage = () ->
    version = (project.package.version || "0.0.1").split "."
    version[2] = +version[2] + 1
    pkg = project.package =
      name: project.name
      version: version.join "."
    sa.extend pkg, project.module.about || {}
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
  
  #{{{2 genReadme - create README.md
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

  #{{{2 updateGitIgnore - update .gitignore
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
  
  #{{{2 ensureCoffeeSource
  ensureCoffeeSource = ->
    if !fs.existsSync "#{project.dirname}/#{project.name}.coffee"
      console.log "writing #{project.name}.coffee"
      fs.writeFileSync "#{project.dirname}/#{project.name}.coffee", """
  #!/bin/env coffee
  ##{"{"}{{1 Boilerplate
  #
  # Define `isNodeJs` in a way such that it can be optimised away by uglify-js
   
  if typeof isNodeJs != "boolean"
    (global? || window?).isNodeJs = if process?.versions?.node then true else false
  
  ##{"{"}{{1 Meta information
  
  exports.about =
    fullname: "#{project.name}"
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
  
  ##{"{"}{{1 Main
  
  exports.main = (opt) ->
    opt.setStyle {h1: {backgroundColor: "green"}}
    opt.setContent ["div", ["h1", "hello world"]]
    opt.done()
  
  """
  #{{{2 ensureSolAppInstalled
  #
  # TODO: probably remove this one, when solapp-object is passed to main
  ensureSolAppInstalled = (done) ->
    return done() if fs.existsSync "#{process.cwd()}/node_modules/solapp"
    console.log "writing node_modules/solapp"
    require("child_process").exec "mkdir node_modules; ln -s #{__dirname} node_modules/solapp", (err, stdout, stderr) ->
      throw err if err
      done()
  
  #{{{2 ensureGit
  ensureGit = (done) ->
    return done?() if fs.existsSync "#{project.dirname}/.git"
    console.log "creating git repository..."
    require("child_process").exec "git init && git add . && git commit -am \"initial commit\"", (err, stdout, stderr) ->
      throw err if err
      console.log stdout
      console.log stderr
      done?()
  
  #{{{2 loadProject - create module-global project-var
  #
  # TODO, maybe make this passed around as parameter
  project = undefined
  loadProject = (dirname, done) ->
    ensureSolAppInstalled ->
      pkg = JSON.parse (sa.readFileSync dirname + "/package.json") || "{}"
      name = pkg.name || dirname.split("/").slice(-1)[0]
      project =
        dirname: dirname
        name: name
        package: pkg
      ensureCoffeeSource()
      project.source = sa.readFileSync "#{dirname}/#{project.name}.coffee"
      project.module = require("#{dirname}/#{project.name}.coffee")
      expandPackage()
      done project
  
  #{{{2 build - Actual build function
  build = (done) ->
    next = sa.whenDone ->
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
      # #{project.package.name} #{project.package.version}
      CACHE
      index.html
      #{(project.package.html5?.files || []).join "\n"}
      #{if fs.existsSync "#{project.dirname}/icon.png" then "icon.png" else ""}
      NETWORK
      *
      http://*
      https://*

    """, next()

    console.log "writing README.md"
    fs.writeFile "#{project.dirname}/README.md", genReadme(project), next()

    console.log "writing #{project.name}.js"
    fs.writeFile "#{project.name}.js", require("coffee-script").compile(project.source), next()

  #{{{2 devserverJsonml - create the html jsonml-object for the dev-server
  devserverJsonml = () ->
    ["html", {manifest: "manifest.appcache"},
      ["head"
        ["title", project.package.title]
        ["meta", {"http-equiv": "content-type", content: "text/html;charset=UTF-8"}]
        ["meta", {"http-equiv": "content-type", content: "IE=edge,chrome=1"}]
        ["meta", {name: "HandheldFriendly", content: "true"}]
        ["meta", {name: "viewport", content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,
          #{if project.package.userScalable then "" else ", user-scalable=0"}"}]
        ["meta", {name: "format-detection", content: "telephone=no"}]
      ]
      ["body"
      ]
    ]
  
#{{{1 Main dispatch
if isNodeJs then do ->
  #{{{2 devserver
  devserver = (opt) ->
    build ->
      undefined

  #{{{2 commit
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

  #{{{2 dist
  dist = (opt) ->
    build()

  #{{{2 main dispatch
  if require.main == module then sa.nextTick ->
    loadProject process.cwd(), ->
      commands =
        start: devserver
        test: -> build() #TODO
        commit: commit
        dist: build
      commands[undefined] = commands.start
      command = process.argv[2]
      fn = commands[process.argv[2]] || project.module.main
      fn?(sa.extend {}, sa, {
        cmd: command
        args: process.argv.slice(3)
        setStyle: -> undefined
        setContent: -> undefined
        done: -> undefined
      })
