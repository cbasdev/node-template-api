import config from './config/config'
import express from 'express'
import bodyParser from 'body-parser'

import cluster from 'cluster'
import v8 from 'v8'
import helmet from 'helmet'

const clog = (st, text) => console.log(st, text)

/*
Create ANSI template text
http://patorjk.com/software/taag/ ANSI REGULAR
*/
clog(
  '\x1b[33m',
  `
  ███    ██  ██████  ██████  ███████        █████  ██████  ██████  
  ████   ██ ██    ██ ██   ██ ██            ██   ██ ██   ██ ██   ██ 
  ██ ██  ██ ██    ██ ██   ██ █████   █████ ███████ ██████  ██████  
  ██  ██ ██ ██    ██ ██   ██ ██            ██   ██ ██      ██      
  ██   ████  ██████  ██████  ███████       ██   ██ ██      ██      
                                                                   
                                                                   `
)

const app = express()
let server

const runningServer = function () {
  clog('\x1b[36m%s\x1b[0m', `Lintening in ${config.domain}:${config.port}`)
}

const runServer = () => {
  // const router = express.Router();

  clog('\x1b[37m', 'Putting headers')

  app.disable('x-powered-by')
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // app.use(helmet())
  // app.use(helmet.noSniff())
  // app.use(helmet.hidePoweredBy())
  // app.use(helmet.frameguard())

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, app-name-version'
    )
    next()
  })

  clog('\x1b[37m', 'Creating node')
  //   app.use( AwsHelper(express, db, services) );
  // app.use(LangHelper(express, db))

  clog('\x1b[37m', 'Creating Controllers')

  // router.use('/parameters', routes.Parameter);
  // router.use('/places', routes.Place);
  // router.use('/transactions', routes.Transaction);
  // router.use('/users', routes.User);

  // app.use('/api/v1', router);

  app.use((err, req, res, next) => {
    console.error('GENERAL ERR', err)
    res.status(500).json({ message: 'Algo salió mal' })
  })

  // let total = v8.getHeapStatistics().total_available_size
  // let gb = (total / 1024 / 1024 / 1024).toFixed(2)
  // clog('\x1b[33m', `Memory Limit: ${gb} GB`)
}

// isMaster is deprecated

if (cluster.isMaster) {
  if (config.onlyCore) {
    runServer()
    server = app.listen(config.port, runningServer)
    server.timeout = 2 * 60 * 1000
  } else {
    const numCpus = require('os').cpus().length
    for (let i = 0; i < numCpus; ++i) {
      cluster.fork()
    }

    cluster.on('exit', (worker) => {
      console.log('Worker %d died :(', worker.id)
      cluster.fork()
    })
  }
} else {
  runServer()
  server = app.listen(config.port, runningServer)
  server.timeout = 2 * 60 * 1000
}
