import { Task } from './task';
import { Queue } from './queue';
import { ModbusResponseTimeout } from './errors';
import { Logger } from './logger';

export class SerialHelperFactory {
    /**
     * @param {function} bodyCb
     * @param options
     * @returns {SerialHelper}
     */
    static create(bodyCb, options) {
        const queue = new Queue(options.queueTimeout);
        return new SerialHelper(bodyCb, queue, options);
    }
}

export class SerialHelper {
    /**
     * @param {function} bodyCb
     * @param {Queue<Task>} queue
     * @param options
     */
    constructor(bodyCb, queue, options) {
        /**
         * @type {Queue<Task>}
         * @private
         */
        this.queue = queue;
        queue.setTaskHandler(this.handleTask.bind(this));

        /**
         * @private
         */
        this.options = options;
        this.serialPort = bodyCb;
        this.logger = new Logger(options);

        this.bindToSerialPort();
    }

    /**
     *
     * @param {Buffer} buffer
     * @returns {Promise}
     */
    write(buffer) {
        const task = new Task(buffer);
        this.queue.push(task);

        return task.promise;
    }

    /**
     * @private
     */
    bindToSerialPort() {
        this.queue.start();
    }

    /**
     *
     * @param {Task} task
     * @param {function} done
     * @private
     */
    handleTask(task, done) {
        this.logger.info('write ' + task.payload.toString('HEX'));

        this.serialPort.requestBodyCb(task.payload);

        // set execution timeout for task
        setTimeout(() => {
            task.reject(new ModbusResponseTimeout(this.options.responseTimeout));
        }, this.options.responseTimeout);

        const onData = (data) => {
            task.receiveData(data, (response) => {
                this.logger.info('resp ' + response.toString('HEX'));
                task.resolve(response);
            });
        };

        this.serialPort.setOnDataListener(onData);

        task.promise.catch(() => {}).finally(() => {
            this.serialPort.removeOnDataListener(onData);
            done();
        });
    }
}
