const { Device } = require('./base')
const mixins = require('./mixins')

class ShellyEM3 extends Device {
  constructor(id) {
    super('SHEM-3', id)

    mixins.powerMeter(this, 0, 111, true)
    mixins.relay(this, 0, 141)
    mixins.powerMeter(this, 1, 121, true)
    mixins.powerMeter(this, 2, 131, true)

    this.on('change:relay0', newValue => {
      this._setNewValues(true)
    })
  }

  _getHttpSettings() {
    return {
      relays: [
        this._getRelay0HttpSettings(),
      ],
      meters: [
        this._getPowerMeter0HttpSettings(),
        this._getPowerMeter1HttpSettings(),
        this._getPowerMeter2HttpSettings(),
      ],
    }
  }

  _getHttpStatus() {
    this._setNewValues()
    return {
      relays: [
        this._getRelay0HttpStatus(),
      ],
      emeters: [
        this._getPowerMeter0HttpStatus(),
        this._getPowerMeter1HttpStatus(),
        this._getPowerMeter2HttpStatus(),
      ],
      total_power: this.powerMeter0 + this.powerMeter1 + this.powerMeter2,
      update: {
        has_update: false,
      }
    }
  }

  _setNewValues(only_pm0 = false) {
    var pm0 = 0
    var pm0V = 0
    var pm0A = 0
    if (this.relay0 === true) {
      pm0 = this._getRandomFloat(10, 200)
      pm0V = this._getRandomFloat(1, 30)
      pm0A = pm0 / pm0V
    }
    this.powerMeter0 = pm0
    this.powerMeter0V = pm0V
    this.powerMeter0A = pm0A

    if (only_pm0) {
      return
    }

    this.powerMeter1 = this._getRandomFloat(0, 10)
    this.powerMeter1V = this._getRandomFloat(230, 242)
    this.powerMeter1A = this.powerMeter1 / this.powerMeter1V

    this.powerMeter2 = this._getRandomFloat(100, 2000)
    this.powerMeter2V = 240
    this.powerMeter2A = this.powerMeter2 / this.powerMeter2V
  }
}

module.exports = ShellyEM3
