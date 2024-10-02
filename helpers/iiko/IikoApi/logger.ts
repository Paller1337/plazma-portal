import winston from 'winston'

export class Logger {
    private logger: winston.Logger;

    constructor(logLevel: string = 'info') {
        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                })
            ),
            transports: [new winston.transports.Console()],
        });
    }

    /** Add a new transport */
    public addTransport(transport: winston.transport): void {
        this.logger.add(transport);
    }

    /** Log methods */
    public info(message: string): void {
        this.logger.info(message);
    }

    public debug(message: string): void {
        this.logger.debug(message);
    }

    public warn(message: string): void {
        this.logger.warn(message);
    }

    public error(message: string): void {
        this.logger.error(message);
    }
}
