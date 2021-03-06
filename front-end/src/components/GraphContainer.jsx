import React, { useEffect, useState } from "react";
import {
  VictoryPie,
  VictoryChart,
  VictoryBar,
  VictoryTheme,
  VictoryLine,
  VictoryScatter,
  VictoryLabel,
  VictoryTooltip,
} from "victory";
import axios from "axios";
import h337 from "heatmap.js";

function WindowHeatMap(props) {
  return (
    <div class="heatmap-pic">
      <div className="heatmap-iframe">
        <iframe
          class="heatmap-home"
          id="heatmap-home"
          src="http://localhost:3000/"
          height="1000px"
        ></iframe>
      </div>
    </div>
  );
}

function WindowGraphs(props) {
  return (
    <div class="victorypie">
      <div class="graph-description">
        <p>Зависимость количества кликов от типа браузера</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
      </div>
    </div>
  );
}

function FiltersHeatMap(props) {
  return (
    <div className="filter">
      <h1>Heatmap</h1>
      <label for="page">Выберите страницу</label>
      <select id="page" className="choosePage" onChange={ChoosePage}>
        <option value="home" selected>Home</option>
        <option value="grid">Grid</option>
        <option value="product">Product</option>
      </select>
      <button onClick={ViewHeatMap}>ФИЛЬТР по кликам</button>
      <label for="browser">ФИЛЬТР по браузеру</label>
      <select id="browser" className="chooseBrowser" onChange={() => { Choose(props.homeDataBr, props.gridDataBr, props.productDataBr, "browser") }}>
        <option value="">--Сделайте выбор--</option>
        {props.browsers}
      </select>
      <label for="browser">ФИЛЬТР по гаджету</label>
      <select id="browser" className="chooseGadget" onChange={() => { Choose(props.homeDataGg, props.gridDataGg, props.productDataGg, "gadget") }}>
        <option value="">--Сделайте выбор--</option>
        {props.gadgets}
      </select>
    </div>
  );
}

function Choose(home, grid, product, type) {
  let myFrame = document.getElementById("heatmap-home")
  let name = myFrame.getAttribute("src");
  let select
  if (type == "browser") {
    select = document.querySelector('.chooseBrowser')
  }
  else if (type == "gadget") {
    select = document.querySelector('.chooseGadget')
  }
  let choice = select.value;

  if (choice == "") {
    document.querySelector(".heatmap-home").contentDocument.querySelector('canvas').remove()
    return
  }
  if (document.querySelector(".heatmap-home").contentDocument.querySelector('canvas') != null) {
    document.querySelector(".heatmap-home").contentDocument.querySelector('canvas').remove()
  }

  let dataForHeatMap = []
  let page = "";
  if (name == "http://localhost:3000/") {
    page = "home"
    for (let i = 0; i < home.length; i++) {
      for (let key in home[i]) {
        if (key.indexOf(choice) + 1) {
          dataForHeatMap = dataForHeatMap.concat(
            dataForHeatMap,
            home[i][key]
          )
        }
      }
    }
  }
  else if (name == "http://localhost:3000/grid") {
    page = "grid"
    for (let i = 0; i < grid.length; i++) {
      for (let key in grid[i]) {
        if (key.indexOf(choice) + 1) {
          dataForHeatMap = dataForHeatMap.concat(
            dataForHeatMap,
            grid[i][key]
          )
        }
      }
    }
  }
  else {
    page = "product"
    for (let i = 0; i < product.length; i++) {
      for (let key in product[i]) {
        if (key.indexOf(choice) + 1) {
          dataForHeatMap = dataForHeatMap.concat(
            dataForHeatMap,
            product[i][key]
          )
        }
      }
    }
  }


  let data = {
    max: 15,
    min: 0,
    data: dataForHeatMap,
  };

  let heatmap = document
    .querySelector(".heatmap-home")
    .contentDocument.querySelector('canvas')
  if (heatmap != null) {
    heatmap.remove()
  }
  let heatmapInstance = h337.create({
    container: document
      .querySelector(".heatmap-home")
      .contentDocument.querySelector("." + page),
  });
  heatmapInstance.setData(data);
}

function ViewHeatMap() {
  let myFrame = document.getElementById("heatmap-home")
  let name = myFrame.getAttribute("src");
  let page = "";
  if (name == "http://localhost:3000/") {
    page = "home"
  }
  else if (name == "http://localhost:3000/grid") {
    page = "grid"
  }
  else {
    page = "product"
  }
  axios
    .get(`http://127.0.0.1:5000/get_heatmap/${page}`)
    .then((response) => {
      let dataPoints = response.data.data;
      let data = {
        max: 15,
        min: 0,
        data: dataPoints,
      };
      let heatmap = document
        .querySelector(".heatmap-home")
        .contentDocument.querySelector('canvas')
      if (heatmap != null) {
        heatmap.remove()
      }
      let heatmapInstance = h337.create({
        container: document
          .querySelector(".heatmap-home")
          .contentDocument.querySelector("." + page),
      });
      heatmapInstance.setData(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

function FiltersGraphs(props) {
  return (
    <h1>Graphs</h1>
  );
}

function ChoosePage() {
  let select = document.querySelector('.choosePage')
  let myFrame = document.getElementById("heatmap-home")
  let choice = select.value;

  switch (choice) {
    case 'home':
      myFrame.setAttribute("src", "http://localhost:3000/");
      break;
    case 'grid':
      myFrame.setAttribute("src", "http://localhost:3000/grid");
      break;
    case 'product':
      myFrame.setAttribute("src", "http://localhost:3000/product");
      break;
    default:

  }

}


class GraphContainer extends React.Component {
  constructor(props) {
    super(props);
    this.onHeatMap = this.onHeatMap.bind(this);
    this.onGraphs = this.onGraphs.bind(this);
    this.state = {
      isHeatMap: true,
      browsersItems: null,
      browsersHomeData: null,
      browsersGridData: null,
      browsersProductData: null,
      gadgetsItems: null,
      gadgetsHomeData: null,
      gadgetsGridData: null,
      gadgetsProductData: null
    };
  }
  componentDidMount() {
    axios
      .all([
        axios.get(`http://127.0.0.1:5000/get_heatmap/browser/home`),
        axios.get(`http://127.0.0.1:5000/get_heatmap/browser/grid`),
        axios.get(`http://127.0.0.1:5000/get_heatmap/browser/product`),
        axios.get(`http://127.0.0.1:5000/get_list_of/browser`),
        axios.get(`http://127.0.0.1:5000/get_heatmap/gadget_type/home`),
        axios.get(`http://127.0.0.1:5000/get_heatmap/gadget_type/grid`),
        axios.get(`http://127.0.0.1:5000/get_heatmap/gadget_type/product`),
        axios.get(`http://127.0.0.1:5000/get_list_of/gadget_type`)
      ])
      .then((response) => {
        // for browsers
        let browsers = []
        let currentBrowsers = []
        let data = response[3].data.data
        for (let i = 0; i < data.length; i++) {
          let key = new String(data[i][i + 1])
          currentBrowsers.push(key.split(" ")[0])
        }
        let browsersSet = new Set(currentBrowsers)
        for (let browser of browsersSet) {
          browsers.push(browser)
        }
        const browsersItems = browsers.map((browser) =>
          <option value={browser}>{browser}</option>
        );
        // for gadgets
        let gadgets = []
        let dataGg = response[7].data.data
        for (let i = 0; i < dataGg.length; i++) {
          gadgets.push(dataGg[i][i + 1])
        }
        const gadgetsItems = gadgets.map((gadget) =>
          <option value={gadget}>{gadget}</option>
        );
        this.setState({
          browsersHomeData: response[0].data.data,
          browsersGridData: response[1].data.data,
          browsersProductData: response[2].data.data,
          browsersItems: browsersItems,
          gadgetsHomeData: response[4].data.data,
          gadgetsGridData: response[5].data.data,
          gadgetsProductData: response[6].data.data,
          gadgetsItems: gadgetsItems
        })
      })
      .catch((error) => {
        console.log(error);
      })
  }
  onHeatMap() {
    this.setState({ isHeatMap: true });
  }
  onGraphs() {
    this.setState({ isHeatMap: false });
  }

  render() {
    // choose graphs or heatmap logic
    const isHeatMap = this.state.isHeatMap;
    let window = null;
    let filters = null;
    if (isHeatMap) {
      filters = <FiltersHeatMap
        browsers={this.state.browsersItems}
        homeDataBr={this.state.browsersHomeData}
        gridDataBr={this.state.browsersGridData}
        productDataBr={this.state.browsersProductData}
        gadgets={this.state.gadgetsItems}
        homeDataGg={this.state.gadgetsHomeData}
        gridDataGg={this.state.gadgetsGridData}
        productDataGg={this.state.gadgetsProductData} />
      window = <WindowHeatMap />
    } else {
      filters = <FiltersGraphs />
      window = <WindowGraphs />;
    }

    return (
      <section className="graphs" >
        <div className="graphs-container">
          <div className="graphs-buttons">
            <button onClick={this.onHeatMap}>
              Тепловая карта
            </button>
            <button onClick={this.onGraphs}>
              Графики
            </button>
          </div>
          <div className="graphs-main-content">
            <div className="graphs-filters">
              {filters}
            </div>
            <div className="graphs-window">
              {window}
            </div>
          </div>
        </div>
      </section>
    )
  }
};
export default GraphContainer;
