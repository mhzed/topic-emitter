"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const topic_emitter_1 = require("../topic-emitter");
exports.case1 = (test) => {
    let emitter = new topic_emitter_1.default();
    emitter.on('m1.button.*', (event, param, match) => {
        test.ok(false);
    });
    emitter.on('m1.button.send.click', (event, param, match) => {
        test.ok(true);
    });
    emitter.on('*.button.*.click', (event, param, match) => {
        test.ok(match === "m1.send");
    });
    emitter.emit('m1.button.send.click');
    test.done();
};
//# sourceMappingURL=test.js.map