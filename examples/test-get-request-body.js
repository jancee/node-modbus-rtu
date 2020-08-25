const ModbusMaster = require('../lib').ModbusMaster;

//create ModbusMaster instance and pass the serial port object

//Read from slave with address 1 four holding registers starting from 0.
// master.readHoldingRegisters(1, 0, 4).then((data) => {
//     //promise will be fulfilled with parsed data
//     console.log(data); //output will be [10, 100, 110, 50] (numbers just for example)
// }, (err) => {
//     //or will be rejected with error
// });

//Write to first slave into second register value 150.
//slave, register, value

const sleep = require('await-sleep');

async function getDtuRequest() {
    let result;
    let master = new ModbusMaster({
        requestBodyCb: (body) => {
            console.log(body);
            result = body;
        },
        setOnDataListener: function (cb) {

        },
        removeOnDataListener: function (cb) {

        },
    });
    master.writeSingleRegister(1, 40001, 15789);
    await sleep(0);
    console.log(result);
    master = undefined;
    return result;
}

async function run() {
    for (let i = 0; i < 100000; i++) {
        await getDtuRequest();
    }

}

run();
