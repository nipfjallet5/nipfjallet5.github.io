
var map = L.map('themap', {
    dragging: false, 
    tap: false, 
    scrollWheelZoom: false,
    touchZoom: false
}).setView([59.3389, 17.9765], 17);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker = new L.Marker([59.3390, 17.9764]);
marker.addTo(map);

class HomeMap extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = "The Map";
    }
}

window.customElements.define('home-map', HomeMap)
