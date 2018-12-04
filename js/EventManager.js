var all = {};
var EventManager = {
    on: function (type, handler) {
        (all[type] || (all[type] = [])).push(handler);
    },
    off: function (type, handler) {
        if (handler) {
            if (all[type]) {
                all[type].splice(all[type].indexOf(handler) >>> 0, 1);
            }
        }
        else {
            if (all[type])
                all[type] = [];
        }
    },
    emit: function (type, evt) {
        (all[type] || []).slice().map(function (handler) { return handler(evt); });
    }
};
