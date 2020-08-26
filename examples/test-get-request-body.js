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
    let master = new ModbusMaster();
    let result = master.writeSingleRegister(1, 40001, 15789);
    console.log(result);
    return result;
}

async function run() {
    for (let i = 0; i < 1; i++) {
        await getDtuRequest();
    }

}

run();
