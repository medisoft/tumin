/**
 * Created by mario on 23/04/17.
 */
module.exports = {
    fabric: {
        features: [],
        txs: {}
    },
    validate: function(tx) {
        return true;
    },
    attach: function(tx) {
        return true;
    },
    toJSON: function() {
        return JSON.stringify(this.fabric);
    },
    toBIN: function() {

    }
}