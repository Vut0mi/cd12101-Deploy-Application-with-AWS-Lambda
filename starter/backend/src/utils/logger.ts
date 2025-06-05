// TODO: Logger utility

// === src/utils/logger.ts ===
import * as winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.Console()
  ]
})

export default logger

