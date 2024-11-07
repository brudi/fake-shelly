const EventEmitter = require('eventemitter3')
const errors = require('restify-errors');
const os = require('os')

class BaseDevice extends EventEmitter {
  constructor(type, id) {
    super()

    this.type = type
    this.id = id
    this.macAddress = '1A2B3C' + id
    this._props = new Map()
    this._httpRoutes = new Map()
  }

  _defineProperty(name, id = null, defaultValue = null, validator = null) {
    const key = `_${name}`

    Object.defineProperty(this, key, {
      value: defaultValue,
      writable: true,
    })

    Object.defineProperty(this, name, {
      get() { return this[key] },
      set(newValue) {
        const nv = validator ? validator(newValue) : newValue
        if (this[key] !== nv) {
          const oldValue = this[key]
          this[key] = nv
          console.log(name, 'changed from', oldValue, 'to', nv)
          this.emit('change', name, nv, oldValue, this)
          this.emit(`change:${name}`, nv, oldValue, this)
        }
      },
      enumerable: true,
    })

    if (id !== null) {
      this._props.set(id, name)
    }
  }

  getCoapStatusPayload() {
    const updates = []

    for (const [id, name] of this._props.entries()) {
      if (id < 0) {
        continue
      }

      let val = this[name]
      if (typeof val === 'boolean') {
        val = Number(val)
      }

      updates.push([ 0, id, val ])
    }

    return { G: updates }
  }

  setupHttpRoutes(server) {
    for (const [path, handler] of this._httpRoutes.entries()) {
      server.get(path, handler.bind(this))
    }
  }

  _getRandomFloat(min, max) {
    return min + Math.random()*max
  }
}

class Device extends BaseDevice {
  constructor(type, id) {
    super(type, id)

    this._httpRoutes.set('/shelly', this._handleShellyRequest)
    this._httpRoutes.set('/settings', this._handleSettingsRequest)
    this._httpRoutes.set('/status', this._handleStatusRequest)
  }

  _handleShellyRequest(req, res, next) {
    res.send({
      type: this.type,
      mac: this.macAddress,
      auth: false,
    })
    next()
  }

  _handleSettingsRequest(req, res, next) {
    res.send(Object.assign(
      {
        device: {
          type: this.type,
          mac: this.macAddress,
        },
        login: {
          enabled: false,
        },
        name: 'fake-shelly',
        time: new Date().toTimeString().substr(0, 5),
      },
      this._getHttpSettings()
    ))
    next()
  }

  _getHttpSettings() {
    return {}
  }

  _handleStatusRequest(req, res, next) {
    res.send(Object.assign(
      {
        time: new Date().toTimeString().substr(0, 5),
        has_update: false,
        ram_total: os.totalmem(),
        ram_free: os.freemem(),
        uptime: Math.floor(process.uptime()),
      },
      this._getHttpStatus()
    ))
    next()
  }

  _getHttpStatus() {
    return {}
  }
}

class Gen2Device extends BaseDevice {
  constructor(type, id) {
    super(type, id)

    this._defineProperty("_inputs", id, new Map())
    // this._inputs = new Map()
    this._defineProperty("_switches", id+1, new Map())
    //this._switches = new Map()
    console.log("Gen2Device", this)

    this._httpRoutes.set('/rpc/Shelly.GetStatus', this._handleShellyGetStatus)
    this._httpRoutes.set('/rpc/Switch.Set', this._handleSwitchSet)
    this._httpRoutes.set('/rpc/Switch.Toggle', this._handleSwitchSet)
    this._httpRoutes.set('/rpc/Switch.ResetCounters', this._handleNoop)

    /*
    this._httpRoutes.set('/rpc/Input.SetConfig', this._handleSetConfig)
    this._httpRoutes.set('/rpc/Input.GetConfig', this._handleSwitchGetConfig)
    this._httpRoutes.set('/rpc/Input.GetStatus', this._handleSwitchGetStatus)
    this._httpRoutes.set('/rpc/Input.CheckExpression', this._handleSwitchCheckExpression)
    this._httpRoutes.set('/rpc/Input.ResetCounters', this._handleSwitchResetCounters)
    this._httpRoutes.set('/rpc/Input.Trigger', this._handleSwitchTrigger)
    */
    this._httpRoutes.set('/rpc/Input.SetConfig', this._handleNoop)
    this._httpRoutes.set('/rpc/Input.GetConfig', this._handleNoop)
    this._httpRoutes.set('/rpc/Input.GetStatus', this._handleNoop)
    this._httpRoutes.set('/rpc/Input.CheckExpression', this._handleNoop)
    this._httpRoutes.set('/rpc/Input.ResetCounters', this._handleNoop)
    this._httpRoutes.set('/rpc/Input.Trigger', this._handleNoop)

    this._httpRoutes.set('/relay/:id', this._handleRelay)
  }
  
  _handleShellyGetStatus(req, res, next) {
    res.send(Object.assign(
      {
        // ble: {},
        // cloud: {
        //   connected: false,
        // },
        // eth: {
        //   ip: "10.33.55.170",
        // },
        // "input:0": {
        //   id: 0,
        //   state: false,
        // },
        // "input:1": {
        //   id: 1,
        //   state: false,
        // },
        // "input:2": {
        //   id: 2,
        //   state: false,
        // },
        // "input:3": {
        //   id: 3,
        //   state: false,
        // },
        // mqtt: {
        //   connected: false,
        // },
        // "switch:0": {
        //   id: 0,
        //   source: "timer",
        //   output: true,
        //   timer_started_at: 1626935739.79,
        //   timer_duration: 60,
        //   apower: 8.9,
        //   voltage: 237.5,
        //   aenergy: {
        //     toal: 6.532,
        //     by_minute: [
        //       45.199,
        //       47.141,
        //       88.397
        //     ],
        //     minute_ts: 1626935779
        //   },
        //   temperature: {
        //     tC: 23.5,
        //     tF: 74.4
        //   }
        // },
        // "switch:1": {
        //   id: 1,
        //   source: "init",
        //   output: false,
        //   apower: 0,
        //   voltage: 237.5,
        //   aenergy: {
        //     toal: 0,
        //     by_minute: [
        //       0,
        //       0,
        //       0
        //     ],
        //     minute_ts: 1626935779
        //   },
        //   temperature: {
        //     tC: 23.5,
        //     tF: 74.4
        //   }
        // },
        // "switch:2": {
        //   id: 2,
        //   source: "timer",
        //   output: false,
        //   timer_started_at: 1626935591.8,
        //   timer_duration: 345,
        //   apower: 0,
        //   voltage: 237.5,
        //   aenergy: {
        //     toal: 0.068,
        //     by_minute: [
        //       0,
        //       0,
        //       0
        //     ],
        //     minute_ts: 1626935779
        //   },
        //   temperature: {
        //     tC: 23.5,
        //     tF: 74.4
        //   }
        // },
        // "switch:3": {
        //   id: 3,
        //   source: "init",
        //   output: false,
        //   apower: 0,
        //   voltage: 237.5,
        //   aenergy: {
        //     toal: 0,
        //     by_minute: [
        //       0,
        //       0,
        //       0
        //     ],
        //     minute_ts: 1626935779
        //   },
        //   temperature: {
        //     tC: 23.5,
        //     tF: 74.4
        //   }
        // },
        sys: {
          mac: this.macAddress,
          restart_required: false,
          time: new Date().toTimeString().substr(0, 5),
          unixtime: Math.round(+new Date()/1000),
          uptime: Math.floor(process.uptime()),
          ram_size: os.totalmem(),
          ram_free: os.freemem(),
          fs_size: os.totalmem() * 10, // FIXME(mg): Is this important to have correct?
          fs_free: os.freemem() * 7,
          // cfg_rev: 26,
          // kvs_rev: 2725,
          // schedule_rev: 0,
          // webhook_rev: 0,
          // available_updates: {
          //   stable: {
          //     version: "0.10.1",
          //   }
          // }
        },
        // wifi: {
        //   sta_ip: null,
        //   statu: "disconnected",
        //   ssid: null,
        //   rssi: 0
        // },
        ws: {
          connected: true,
        }
      },
      this._getComponentStatus(),
    ))
    next()
  }

  _handleSwitchSet(req, res, next) {
    if (req.query) {
      const ix = req.query.id
      const on = req.query.on
      const toggle_after = req.query.toggle_after

      if (ix === undefined || ix < 0 || ix >= this._switches.size) {
        return next(new errors.BadRequestError(`invalid id (should be 0 <= id < ${this._switches.size}`))
      }
      let name = `switch${ix}`
      let sw = this._getSwitch(name)
      let was_on = sw.output

      if (on !== undefined) {
        if (on !== 'true' && on !== 'false') {
           return next(errors.BadRequestError('on must be "true" or "false"'))
        }
        sw.output = on === 'true'
      } else if (req.path().endsWith("Toggle")) {
        sw.output = !was_on
      } else {
        return next(new errors.BadRequestError('Invalid request: missing query variables id, on, [toggle_after] or using wrong endpoint'))
      }

      this._setSwitch(name, sw)
      res.send({
        was_on: was_on,
      })
    } else {
      return next(new errors.BadRequestError('Invalid request: missing query variables id, [on, toggle_after]'))
    }
    next()
  }

  _handleNoop(req, res, next) {
    res.send({
      noop: true,
    })
    next()
  }

  _handleRelay(req, res, next) {
    if (req.params && req.query) {
      const ix = req.params.id
      const turn = req.query.turn

      if (ix === undefined || ix < 0 || ix >= this._switches.size) {
        return next(new errors.BadRequestError(`invalid id (should be 0 <= id < ${this._switches.size}`))
      }
      let name = `switch${ix}`
      let sw = this._getSwitch(name)
      let was_on = sw.output

      if (turn !== undefined) {
        if (turn !== 'on' && turn !== 'off') {
          return next(new errors.BadRequestError('turn must be "on" or "off"'))
        }
        sw.output = turn === 'on'
      }

      this._setSwitch(name, sw)
      res.send({
        was_on: was_on,
      })
    } else {
      return next(new errors.BadRequestError('Invalid request: invalid relay ID or parameters.'))
    }
    next()
  }

  _getComponentStatus() {
    return {...this._getInputsStatus(), ...this._getSwitchesStatus()};
  }

  _getInputsStatus() {
    let st = {}
    this._inputs.forEach((inp, name) => {
      st[name] = inp
    })
    return st
  }

  _addInput(ix, id, defaultValue, validator) {
    let name = `input${ix}`
    let inp = {
      id: id,
      state: state
    }
    this._setInput(name, inp)

    return name
  }

  _setInput(name, inp) {
    console.log("Setting input", name, inp)
    let inputs = new Map(this._inputs)
    inputs.set(name, inp)
    this._inputs = inputs
  }

  _getInput(name) {
    console.log("Getting input", name)
    return this._inputs.get(name)
  }

  _getInputs() {
    console.log("Getting inputs")
    return this._inputs
  }

  _getSwitchesStatus() {
    let st = {}
    this._switches.forEach((sw, name) => {
      st[name] = sw
    })
    
    return st
  }

  _addSwitch(ix, id, defaultValue, validator) {
    let name = `switch${ix}`
    let sw = {
      id: id,
      // source: "init",
      output: defaultValue,
      apower: 0,
      voltage: 0,
      current: 0,
      // aenergy: {
      //   toal: 0,
      //   by_minute: [
      //     0,
      //     0,
      //     0
      //   ],
      //   minute_ts: 1626935779
      // },
      // temperature: {
      //   tC: 23.5,
      //   tF: 74.4
      // }
    }
    this._setSwitch(name, sw)

    return name
  }

  _setSwitch(name, sw) {
    console.log("Setting switch", name, sw)
    let switches = new Map(this._switches)
    switches.set(name, sw)
    this._switches = switches
  }

  _getSwitch(name) {
    console.log("Getting switch", name)
    return this._switches.get(name)
  }

  _getSwitches() {
    console.log("Getting switches")
    return this._switches
  }
}


module.exports = { BaseDevice, Device, Gen2Device }
