#!/usr/bin/env node
const { options } = require('./init.js')
const start = require('./src/index')
start(options.dir, options.env)
