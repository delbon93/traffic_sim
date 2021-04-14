function MousePressedEvent(x, y, mButtons, modKeys, collider = null) {
    return { _type: MousePressedEvent, 
        x: x, y: y, mButtons: mButtons, modKeys: modKeys,
        collider: collider, hit: function() {
            if (this.collider == null) return true;
            return collider.hit(x, y);
        }};
}

function MouseReleasedEvent(x, y, mButtons, modKeys, collider = null) {
    return { _type: MouseReleasedEvent, 
        x: x, y: y, mButtons: mButtons, modKeys: modKeys,
        collider: collider, hit: function() {
            if (this.collider == null) return true;
            return collider.hit(x, y);
        }};
}


class InputEventManager {
    constructor() {
        this.listeners = {};
    }

    subscribe(eventType, listenerCallback) {
        if (!this.listeners[eventType]) this.listeners[eventType] = [];
        this.listeners[eventType].push(listenerCallback);
    }

    unsubscribe(eventType, listenerCallback) {
        if (!this.listeners[eventType]) return;
        let i = this.listeners[eventType].indexOf(listenerCallback);
        if (i < 0) return;
        this.listeners[eventType].splice(i, 1);
    }

    raise(event) {
        if (!this.listeners[event._type]) return;
        this.listeners[event._type].some(listenerCallback => {
            return listenerCallback(event);
        })
    }
}

let INPUT_EVENT_MANAGER = new InputEventManager();