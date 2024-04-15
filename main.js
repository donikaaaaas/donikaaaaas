var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
    <style>
      #root {
        width: 100%;
        height: 100%;
      }
    </style>
    <div id="root"></div>
  `;

  class FullDoughnutPrepped extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));
      this._root = this._shadowRoot.getElementById("root");
      this._myDataSource = null;
      this.render();
    }

    async connectedCallback() {
      await this.loadECharts();
    }

    async loadECharts() {
      if (!window.echarts) {
        await getScriptPromisify(
          "https://cdn.staticfile.org/echarts/5.3.0/echarts.min.js"
        );
      }
      this.render();
    }

    onCustomWidgetResize(width, height) {
      this.render();
    }

    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      this.render();
    }

    render() {
      if (!window.echarts || !this._myDataSource || this._myDataSource.state !== "success") {
        return;
      }

      const dimension = this._myDataSource.metadata.feeds.dimensions.values[0];
      const measure = this._myDataSource.metadata.feeds.measures.values[0];
      const data = this._myDataSource.data.map((item) => ({
        name: item[dimension].label,
        value: item[measure].raw,
      }));

      const myChart = window.echarts.init(this._root);

      const option = {
        color: ['#0070F2', '#D2EFFF', '#4CB1FF', '#89D1FF'],
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            label: {
              show: true,
              formatter: "{b}: {d}%",
            },
            data,
          },
        ],
      };

      myChart.setOption(option);
    }
  }

  customElements.define("com-sap-sample-echarts-full_doughnut", FullDoughnutPrepped);
})();
