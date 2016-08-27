'use strict';

const test = require('./tape');
const _ = require('lodash');
const packetUtils = require('../packet-utils');

test('Parse holding registers packet', (t) => {
    var buf = new Buffer('11 03 06 AE41 5652 4340 49AD'.replace(/\s/g, ''), 'hex');

    var results = packetUtils.parseFc03Packet(packetUtils.getDataBuffer(buf));

    t.equal(results.length, 3, 'Should be 3 results in packet, because we read 3 registers');

    var expectedResults = [-20927, 22098, 17216];

    _.each(results, (result, i) => {
        t.equal(results[i], expectedResults[i], `Result ${i} is equal to expected`);
    });

    t.end();
});

test('Parse holding registers packet with Unsigned int data type', (t) => {
    var buf = new Buffer('11 03 02 AE41 49AD'.replace(/\s/g, ''), 'hex');
    var results = packetUtils.parseFc03Packet(packetUtils.getDataBuffer(buf), packetUtils.DATA_TYPES.UINT);

    t.equal(results[0], 44609, 'Result should not be negative');
    t.end();
});

test('Parse holding registers packet with ascii data type', (t) => {
    var buf = new Buffer('11 03 04 5652 5652 49AD'.replace(/\s/g, ''), 'hex');

    var results = packetUtils.parseFc03Packet(packetUtils.getDataBuffer(buf), packetUtils.DATA_TYPES.ASCII);

    t.equal(results[0], 'VR', 'Result should be 2 ascii letters');
    t.equal(results[1], 'VR', 'Result should be 2 ascii letters, and no collisions');

    t.end();
});

test('Calculate and add CRC to packet', (t) => {
    var buf = new Buffer('11 03 06 AE41 5652 4340'.replace(/\s/g, ''), 'hex');

    var signedBuffer = packetUtils.addCrc(buf);
    var actualCrc = signedBuffer.readUInt16LE(signedBuffer.length - 2);

    t.equal(actualCrc, 44361, 'Added crc is valid');

    t.end();
});
