/*

nodejs style event emitter combined with rabbitmq style exchange
event can have heirarachy via '.' separator
'*" match a token (between .)

*/

export default class TopicEmitter {
  evTree;

  constructor() {
    this.evTree = {};
  }

  // register callbacks on an event name,
  // cb(event, param, match)
  //   event:  the event object provided by emit
  //   param:  then param provided by emit
  //   match:  if event.name or event contains *, then stores matched token(s) as string, see test
  on(name: string, cb: (event: string, param: any, match: string) => void): void {
    let array = name.split("."),
        adjustedLength = Math.max(array.length, 1),
        path = array.slice(0, adjustedLength - 1),
        last = array[adjustedLength - 1];
    let tree = this.evTree;
    for (let t of path) {
      tree = tree[t] || (tree[t] = { __ehs: [] });
    } // make tree via path
    if (!tree[last]) {
      tree[last] = { __ehs: [] };
    }
    tree[last].__ehs.push(cb); // store cb
  }

  // unregister specified callback
  // if cb is undefined, all callbacks at name are cleared
  off(name: string, cb: (event: string, param: any, match: string) => void): void {
    let array = name.split("."),
        adjustedLength = Math.max(array.length, 1),
        path = array.slice(0, adjustedLength - 1),
        last = array[adjustedLength - 1];
    let tree = this.evTree;
    for (let t of path) {
      if (tree != null) {
        tree = tree[t];
      }
    } // make tree via path
    if (tree != null) {
      if (cb == null) {
        delete tree[last];
      } else {
        let i = tree[last].__ehs.indexOf(cb);
        if (i !== -1) {
          tree[last].__ehs.splice(i, 1);
        }
      }
    }
  }

  // remove all callbacks
  destory(): void {
    this.evTree = {};
  }

  // return the method to be used as 'onClick' property
  h(eventName: string): (param?: any)=>void {
    return this.emit.bind(this, eventName);
  }

  // emit event, call handlers with param
  emit(eventName: string, param?: any): void {

    var walk = (toks: string[], tree: any, match: string): void => {
      if (tree == null) {
        return;
      }
      let t = toks[0];
      if (toks.length === 1) {
        let h;
        if (t in tree) {
          for (h of Array.from(tree[t].__ehs)) {
            h(eventName, param, match.slice(0, -1));
          }
        }
        if ('*' in tree) {
          for (h of tree['*'].__ehs) {
            h(eventName, param, match + t);
          }
        }
      } else {
        if (t in tree) {
          walk(toks.slice(1), tree[t], match);
        }
        if ('*' in tree) {
          walk(toks.slice(1), tree['*'], match + t + ".");
        }
      }
    };
    walk(eventName.split("."), this.evTree, '');
  }
};

