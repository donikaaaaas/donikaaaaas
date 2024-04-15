var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `;
  class HalfDoughnutPrepped extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));

      this._root = this._shadowRoot.getElementById("root");

      this._props = {};

      this.render();
    }

    onCustomWidgetResize(width, height) {
      this.render();
    }

    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      this.render();
    }

    async render() {
  await getScriptPromisify(
    "https://cdn.staticfile.org/echarts/5.3.0/echarts.min.js"
  );

  if (!this._myDataSource || this._myDataSource.state !== "success") {
    return;
  }

  const dimension = this._myDataSource.metadata.feeds.dimensions.values[0];
  const measure = this._myDataSource.metadata.feeds.measures.values[0];
  const data = this._myDataSource.data.map((data) => {
    return {
      name: data[dimension].label,
      value: data[measure].raw,
    };
  });

  const myChart = echarts.init(this._root, "wight");
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
        radius: ['40%', '100%'], // Adjusted radius for full donut
        center: ['50%', '50%'],
        label: {
          show: true,
          formatter(param) {
            return param.name + ' (' + param.percent.toFixed(1) + '%)';
          }
        },
        data,
      },
    ],
  };
  myChart.setOption(option);
    }
  }

  customElements.define("com-sap-sample-echarts-half_doughnut", HalfDoughnutPrepped);
})();
