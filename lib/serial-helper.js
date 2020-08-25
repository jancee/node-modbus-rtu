'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SerialHelper = exports.SerialHelperFactory = undefined;

var _task = require('./task');

var _queue = require('./queue');

var _errors = require('./errors');

var _logger = require('./logger');

class SerialHelperFactory {
    /**
     * @param {function} bodyCb
     * @param options
     * @returns {SerialHelper}
     */
    static create(bodyCb, options) {
        var queue = new _queue.Queue(options.queueTimeout);
        return new SerialHelper(bodyCb, queue, options);
    }
}

exports.SerialHelperFactory = SerialHelperFactory;
class SerialHelper {
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
        this.logger = new _logger.Logger(options);

        this.bindToSerialPort();
    }

    /**
     *
     * @param {Buffer} buffer
     * @returns {Promise}
     */
    write(buffer) {
        var task = new _task.Task(buffer);
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
        var _this = this;

        this.logger.info('write ' + task.payload.toString('HEX'));

        this.serialPort.requestBodyCb(task.payload);

        // set execution timeout for task
        setTimeout(function () {
            task.reject(new _errors.ModbusResponseTimeout(_this.options.responseTimeout));
        }, this.options.responseTimeout);

        var onData = function onData(data) {
            task.receiveData(data, function (response) {
                _this.logger.info('resp ' + response.toString('HEX'));
                task.resolve(response);
            });
        };

        this.serialPort.setOnDataListener(onData);

        task.promise.catch(function () {}).finally(function () {
            _this.serialPort.removeOnDataListener(onData);
            done();
        });
    }
}
exports.SerialHelper = SerialHelper;