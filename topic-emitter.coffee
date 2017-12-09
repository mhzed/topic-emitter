###

nodejs style event emitter combined with rabbitmq style exchange
event can have heirarachy via '.' separator
'*" match a token (between .)


###


module.exports = class TopicEmitter

  constructor : ()->
    @evTree = {}

  # register callbacks on an event name,
  # cb(event, param, match)
  #   event:  the event object provided by emit
  #   param:  then param provided by emit
  #   match:  if event.name or event contains *, then stores matched token(s) as string, see test
  on : (name, cb)->
    [path..., last] = name.split(".")
    tree = @evTree
    (tree = tree[t] ||= {__ehs: []} ) for t in path  # make tree via path
    tree[last] ||= {__ehs: []}
    tree[last].__ehs.push cb                # store cb

  # unregister specified callback
  # if cb is undefined, all callbacks at name are cleared
  off : (name, cb)->
    [path..., last] = name.split(".")
    tree = @evTree
    (tree = tree[t]) for t in path when tree? # make tree via path
    if tree?
      if !cb? then delete tree[last]
      else
        i = tree[last].__ehs.indexOf(cb)
        if i!=-1 then tree[last].__ehs.splice(i, 1)

  # remove all callbacks
  destory : ()->
    @evTree = {}

  # return the method to be used as 'onClick' property
  # event may be string or an object, which then must contain property name
  # i.e. R.div { onClick: h('open') }
  #      R.div { onClick: h( {name: 'open', key:'val'} )
  h : (event)-> @emit.bind(@, event)

  # emit event, call handlers with param
  emit : (event, param)->
    name = if 'string' == typeof event then event else event.name
    walk = (toks, tree, match)=>
      if !tree? then return
      t = toks[0]
      if toks.length == 1
        if t of tree then h(event, param, match[...-1]) for h in (tree[t]).__ehs
        if '*' of tree then h(event, param, match + t) for h in (tree['*']).__ehs
      else
        if t of tree then walk(toks[1..], tree[t], match)
        if '*' of tree then walk(toks[1..], tree['*'], match + t + ".")
    walk(name.split("."), @evTree, '')


if require.main == module

  assert = require "assert"
  do->
    emitter = new TopicEmitter()

    emitter.on 'm1.button.*', (event, param, match)->
      assert false
    emitter.on 'm1.button.send.click', (event, param, match)->
      assert true
    emitter.on '*.button.*.click', (event, param, match)->
      assert match == "m1.send"

    emitter.emit 'm1.button.send.click'

