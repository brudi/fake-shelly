const { Gen2Device } = require('./base')
const mixins = require('./mixins')

class ShellyPlus1PM extends Gen2Device {
  constructor(id) {
    console.log("ShellyPlus1PM", id)
    super('Shelly Plus 1PM (Vendor SNSW-001P16EU)', id)

    //this._addSwitch(0, 111, true, 0, 0, 0)
    let name = this._addSwitch(0, 111, true)

    console.log("add switch", name)

    this.on('change', newValue => {
      console.log("change", "*")
      this._setNewValues(true)
    })

    this.on('change:_inputs', newValue => {
      console.log("change", "_inputs")
      this._setNewValues(true)
    })

    this.on('change:_switches', newValue => {
      console.log("change", "_switches")
      this._setNewValues(true)
    })
  }

  _setNewValues(only_pm0 = false) {
    console.log("setNewValues", "...")
    // console.log("setNewValues", this._getInputs(), this._getSwitches())
    // var pm0 = 0
    // var pm0V = 0
    // var pm0A = 0
    // if (this.relay0 === true) {
    //   pm0 = this._getRandomFloat(10, 200)
    //   pm0V = this._getRandomFloat(1, 30)
    //   pm0A = pm0 / pm0V
    // }
    // this.powerMeter0 = pm0
    // this.powerMeter0V = pm0V
    // this.powerMeter0A = pm0A

    // if (only_pm0) {
    //   return
    // }

    // this.powerMeter1 = this._getRandomFloat(0, 10)
    // this.powerMeter1V = this._getRandomFloat(230, 242)
    // this.powerMeter1A = this.powerMeter1 / this.powerMeter1V

    // this.powerMeter2 = this._getRandomFloat(100, 2000)
    // this.powerMeter2V = 240
    // this.powerMeter2A = this.powerMeter2 / this.powerMeter2V
  }
}

module.exports = ShellyPlus1PM
