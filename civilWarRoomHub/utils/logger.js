//var app = require(process.cwd() + '/app');
var winston = require('winston');
//
// Logging levels
//
const config = {
    levels: {
      error: 0,
      debug: 1,
      warn: 2,
      data: 3,
      info: 4,
      verbose: 5,
      silly: 6,
      custom: 7
    },
    colors: {
      error: 'red',
      debug: 'blue',
      warn: 'yellow',
      data: 'grey',
      info: 'green',
      verbose: 'cyan',
      silly: 'magenta',
      custom: 'yellow'
    }
  };
  
  winston.addColors(config.colors);
  
  const logger = module.exports = winston.createLogger({
    levels: config.levels,
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format. timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        winston.format.align(),
        winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    /*
    format: winston.format.combine(
      winston.format.colorize(),

      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),

      winston.format.simple(),
    ),
    */
    transports: [
      new winston.transports.Console()
    ],
    level: 'custom'
  });
module.exports = logger;