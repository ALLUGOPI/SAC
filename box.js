(function() { 
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                border-radius: 10px;
                border-width: 2px;
                border-color: black;
                border-style: solid;
                display: block;
                --gauge-color: #27ae60; /* Default color variable */
            } 
            .metric { padding: 10%; }
            .metric svg { max-width: 100%; }
            .metric path {
                stroke-width: 75;
                stroke: #ecf0f1;
                fill: none;
            }
            .metric text {
                font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
            }
            .metric.participation path.data-arc {
                stroke: var(--gauge-color);
            }
            .metric.participation text {
                fill: var(--gauge-color);
            }       
        </style>
        
        <div class="container">
            <div class="metric participation">
                <svg viewBox="0 0 1000 500">
                    <path d="M 950 500 A 450 450 0 0 0 50 500"></path>
                    <path class="data-arc"></path>
                    <text class='percentage' text-anchor="middle" alignment-baseline="middle" x="500" y="300" font-size="140" font-weight="bold">0%</text>
                    <text class='title' text-anchor="middle" alignment-baseline="middle" x="500" y="450" font-size="90" font-weight="normal"></text>
                </svg>
            </div>
        </div>
    `;

    class Box extends HTMLElement {
        constructor() {
            super(); 
            let shadowRoot = this.attachShadow({mode: "open"});
            shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Cache element references to avoid DOM lookups in render()
            this.$dataArc = shadowRoot.querySelector('.data-arc');
            this.$percentageText = shadowRoot.querySelector('.percentage');
            this.$titleText = shadowRoot.querySelector('.title');
            
            this.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("onClick"));
            });
            
            this._props = {};
        }
        
        render(val, info, color) {
            const rounded = Math.round(val * 10) / 10;
            if (rounded < 0 || rounded > 100) return;

            // 1. Update Color via CSS Variable (Very fast)
            if (color) {
                this.style.setProperty('--gauge-color', color);
            }

            // 2. Calculate and update path only
            const val1 = val * 0.01;
            const pathD = this.svg_circle_arc_path(500, 500, 450, -90, val1 * 180.0 - 90);
            this.$dataArc.setAttribute("d", pathD);

            // 3. Update text content (Faster than innerHTML)
            this.$percentageText.textContent = `${rounded}%`;
            this.$titleText.textContent = info || "";
        }
          
        polar_to_cartesian(cx, cy, radius, angle) {
            const radians = (angle - 90) * Math.PI / 180.0;
            return [
                Math.round((cx + radius * Math.cos(radians)) * 100) / 100, 
                Math.round((cy + radius * Math.sin(radians)) * 100) / 100
            ];
        }
        
        svg_circle_arc_path(x, y, radius, start_angle, end_angle) {
            const start_xy = this.polar_to_cartesian(x, y, radius, end_angle);
            const end_xy = this.polar_to_cartesian(x, y, radius, start_angle);
            return `M ${start_xy[0]} ${start_xy[1]} A ${radius} ${radius} 0 0 0 ${end_xy[0]} ${end_xy[1]}`;
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            // Only update the specific property fields and call render once
            this.$value = changedProperties["value"] !== undefined ? changedProperties["value"] : this.$value;
            this.$info = changedProperties["info"] !== undefined ? changedProperties["info"] : this.$info;
            this.$color = changedProperties["color"] !== undefined ? changedProperties["color"] : this.$color;
            
            this.render(this.$value, this.$info, this.$color);
        }
    }
    
    customElements.define("com-demo-gauge", Box);
})();
