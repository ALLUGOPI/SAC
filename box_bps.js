(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                padding: 15px;
                font-family: sans-serif;
            }
            .prop-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }
            label {
                font-size: 14px;
                font-weight: bold;
            }
            input {
                cursor: pointer;
                border: 1px solid #ccc;
                border-radius: 4px;
                height: 30px;
                width: 50px;
            }
        </style>
        <div class="prop-container">
            <label for="bps_color">Gauge Color</label>
            <input id="bps_color" type="color">
        </div>
    `;

    class BoxBps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: "open"});
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Listen for changes and update immediately
            this._shadowRoot.getElementById("bps_color").addEventListener("input", this._onColorChange.bind(this));
        }

        _onColorChange(e) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        color: e.target.value
                    }
                }
            }));
        }

        // Setter called by SAC when the property changes elsewhere
        set color(newColor) {
            this._shadowRoot.getElementById("bps_color").value = newColor;
        }

        // Getter called by SAC to retrieve the current value
        get color() {
            return this._shadowRoot.getElementById("bps_color").value;
        }
    }

    customElements.define("com-demo-box-bps", BoxBps);
})();
