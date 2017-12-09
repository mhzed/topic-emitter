import TopicEmitter from "../topic-emitter"

export const case1 = (test) => {
  
    let emitter = new TopicEmitter();

    emitter.on('m1.button.*', (event, param, match) => {
      test.ok(false)
    });
    emitter.on('m1.button.send.click', (event, param, match) => {
      test.ok(true)
    });
    emitter.on('*.button.*.click', (event, param, match) => {
      test.ok(match === "m1.send")
    });

    emitter.emit('m1.button.send.click');

    test.done();

}