const province_name_map = {
  北京: "Beijing",
  天津: "Tianjin",
  河北: "Hebei",
  山西: "Shanxi",
  内蒙古: "Neimenggu",
  辽宁: "Liaoning",
  吉林: "Jilin",
  黑龙江: "Heilongjiang",
  上海: "Shanghai",
  江苏: "Jiangsu",
  浙江: "Zhejiang",
  安徽: "Anhui",
  福建: "Fujian",
  江西: "Jiangxi",
  山东: "Shandong",
  河南: "Henan",
  湖北: "Hubei",
  湖南: "Hunan",
  广东: "Guangdong",
  广西: "Guangxi",
  海南: "Hainan",
  重庆: "Chongqing",
  四川: "Sichuan",
  贵州: "Guizhou",
  云南: "Yunnan",
  西藏: "Xizang",
  陕西: "Shaanxi",
  甘肃: "Gansu",
  青海: "Qinghai",
  宁夏: "Ningxia",
  新疆: "Xinjiang",
  香港: "Hong Kong",
  澳门: "Macau",
  台湾: "Taiwan",
};

// d3
let svg = d3.select(".svg1");
// const width = +svg.attr("width");
// const height = +svg.attr("height");
const windowWidth = document.body.clientWidth;
const windowHeight = document.body.clientHeight;
const margin = {
  top: 80,
  right: 0,
  bottom: 40,
  left: 0,
};
const innerWidth = windowWidth - margin.left - margin.right;
const innerHeight = windowHeight - margin.top - margin.bottom;
const g = svg
  .append("g")
  .attr("id", "maingroup")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// convert dataPath to svgPath;
// go to https://github.com/d3/d3-geo for more different projections;
const projection = d3.geoMercator();
const pathGenerator = d3.geoPath().projection(projection);
// var color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);

//setting up the tip tool;
// const tip = d3.tip()
//     .attr('class', 'd3-tip').html(function (d) {
//         return d.properties.name
//     });
// svg.call(tip);

let worldmeta;
let lastid = undefined;
var isZoomIn = false;
var currProvince = "";
var currMethod = {
  color: d3.interpolateReds,
  properties: {
    title: "Confirmed cases",
    abbv: "Confirmed",
    columeName: "Confirmed",
  },
};
var currDate = "";

d3.json("/d3 Visualization/data/chinaprovince.json").then(function (geoData) {
  // convert topo-json to geo-json;
  // let china = topojson.feature(data, data.objects.provinces);

  // this code is really important if you want to fit your geoPaths (map) in your SVG element;

  projection.fitSize([innerWidth, innerHeight], geoData);
  // console.log(geoData)

  const provinces = geoData.features;

  // perform data-join;
  const paths = g
    .selectAll("path")
    .data(provinces, (d) => d.properties.name)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("stroke", "white")
    .attr("opacity", 1)
    .attr("stroke-width", 1);

  // const zoom = d3.zoom()
  //     .scaleExtent([1, 5])
  //     .extent([
  //         [0, 0],
  //         [width, height]
  //     ])
  //     .on("zoom", () => g.attr("transform", d3.event.transform));

  // svg.call(zoom);

  const render = (method, date) => {
    console.log(currMethod);

    document.querySelector(".svg1").classList.remove("notdisplay");
    document.querySelector(".svg3").classList.add("notdisplay");

    document.querySelector(".slider").classList.remove("notdisplay");

    d3.select(".svg2").remove();
    d3.csv("/d3 Visualization/data/province.csv").then(function (data) {
      let { color, properties } = method;
      var day = date || "27/2/20";
      // console.log(properties);
      const resetRegion = () => {
        d3.select(".rate").text(function () {
          var dataChina = data.filter(
            (d) => d["Province"] == "总计" && d["Date"] == day
          );
          // console.log(dataChina);
          return dataChina[0][properties.columeName];
        });
        d3.select(".city-name").html("China");
        d3.select(".desc").text(properties.title);
        d3.select(".grad-bar").style(
          "background",
          `linear-gradient(to right,${color(0.2)},${color(0.5)},${color(0.9)})`
        );

        d3.select("#secondgroup").remove();
        d3.select("#secondgroupText").remove();
      };

      resetRegion();

      const getDate = function (day) {
        var dateData = day.split("/");

        return new Date(2020, dateData[1] - 1, +dateData[0]);
      };

      // console.log(data);
      // console.log(new Date(2020, 1, 1))
      var dataThatDay = data.filter((d) => d["Date"] == day);
      var dataBeforeDate = data.filter((d) => {
        var selectedDate = getDate(day);
        var thisDate = getDate(d["Date"]);

        if (thisDate <= selectedDate) {
          return d;
        }
      });
      // console.log(dataBeforeDate)
      // console.log(dataThatDay, day);
      var comfirmedCase = {};
      var minValue = Infinity;
      var maxValue = -1;

      dataThatDay.forEach(function (d) {
        var thisValue = d[method.properties.columeName];
        var colorValue;
        if (thisValue != 0) {
          if (method.properties.abbv == "Death") {
            colorValue = Math.log(thisValue);
          } else {
            colorValue = Math.log(thisValue);
          }
        } else {
          colorValue = 0;
        }

        comfirmedCase[d["Province"]] = colorValue;

        minValue = Math.min(minValue, colorValue);
        maxValue = Math.max(maxValue, colorValue);
      });

      var value2range = d3
        .scaleLinear()
        .domain([minValue, maxValue])
        .range([0, 1]);

      var range2color = method.color;

      paths
        .attr("fill", function (d) {
          return range2color(value2range(comfirmedCase[d.properties.name]));
        })
        .attr("opacity", 1)
        .on("mouseover", function (d) {
          let pieData = [];

          d3.select(this)
            .attr("opacity", function (d) {
              if (currProvince == d.properties.name) {
                return 1;
              }
              if (isZoomIn) {
                return 0.4;
              } else {
                return 0.9;
              }
            })
            .attr("fill", function (d) {
              if (currProvince == d.properties.name && isZoomIn) {
                return range2color(
                  value2range(comfirmedCase[d.properties.name])
                );
              } else {
                return "white";
              }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
          var provinceName = d.properties.name;

          d3.select(".city-name").text(province_name_map[provinceName]);
          d3.select(".desc").text(method.properties.columeName + " cases");
          if (provinceName in comfirmedCase) {
            d3.select(".rate").text(function () {
              var dataFiltered = dataThatDay.filter(
                (d) => d["Province"] == provinceName
              );
              // console.log(dataFiltered);
              // console.log(dataFiltered[0]['Recovered'])
              var Confirmed = {};
              Confirmed["name"] = "Confirmed";
              Confirmed["value"] = dataFiltered[0]["Confirmed"];
              pieData.push(Confirmed);
              var Recovered = {};
              Recovered["name"] = "Recovered";
              Recovered["value"] = dataFiltered[0]["Recovered"];
              pieData.push(Recovered);
              var Death = {};
              Death["name"] = "Death";
              Death["value"] = dataFiltered[0]["Death"];
              pieData.push(Death);
              return dataFiltered[0][method.properties.columeName];
            });
            if (!isZoomIn) {
              renderPieChart(pieData, provinceName, day);
            }
          } else {
            d3.select(".rate").text(0);
          }
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .attr("opacity", function (d) {
              if (currProvince == d.properties.name) {
                return 1;
              }
              if (isZoomIn) {
                return 0.5;
              } else {
                return 1;
              }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", function (d) {
              if (!isZoomIn || currProvince == d.properties.name) {
                return range2color(
                  value2range(comfirmedCase[d.properties.name])
                );
              } else {
                return "#444";
              }
            });
          resetRegion();
        })
        .on("click", function (d) {
          var t = d3.transition().duration(800);
          const zoomIn = function (d) {
            document.querySelector(".slider").classList.add("notdisplay");
            currProvince = d.properties.name;

            var padding = 50;
            var fillColor;
            isZoomIn = true;

            projection.fitExtent(
              [
                [padding, padding],
                [windowWidth - padding - 550, windowHeight - padding],
              ],
              d
            );
            paths
              .transition(t)
              .attr("d", pathGenerator)
              .attr("opacity", function (d) {
                if (currProvince == d.properties.name) {
                  return 1;
                } else {
                  return 0.5;
                }
              })
              .attr("fill", function (d) {
                if (currProvince == d.properties.name) {
                  fillColor = range2color(
                    value2range(comfirmedCase[d.properties.name])
                  );
                  return fillColor;
                } else {
                  return "#444";
                }
              });
            console.log(data);
            renderBarChart(dataBeforeDate, currProvince, fillColor);
            renderLineChart(dataBeforeDate, currProvince, fillColor);
          };
          if (currProvince == d.properties.name) {
            if (isZoomIn == false) {
              zoomIn(d);
            } else {
              // console.log(geoData)
              projection.fitSize([innerWidth, innerHeight], geoData);
              paths.transition(t).attr("d", pathGenerator);
              isZoomIn = false;
              d3.select("#thirdgroup").remove();
              d3.select("#fourthgroup").remove();
              document.querySelector(".slider").classList.remove("notdisplay");
              console.log(method);
              render(method);
            }
          } else {
            zoomIn(d);
          }
        });

      function renderLineChart(data, provinceName, color) {
        var lineChart = d3.select("#fourthgroup");
        if (lineChart) {
          lineChart.remove();
        }
        data = data.filter((d) => d["Province"] == provinceName);
        var width = (windowWidth / 5) * 2,
          height = windowHeight / 4;

        var maxYaxis = 0;

        data.forEach(function (d) {
          var thisValue = d["Confirmed"];
          maxYaxis = Math.max(maxYaxis, thisValue);
        });

        const g4 = svg
          .append("g")
          .attr("id", "fourthgroup")
          .attr(
            "transform",
            `translate(${windowWidth - width - 60},${windowHeight / 10 + 120})`
          )
          .attr("width", width)
          .attr("height", height);

        // X axis
        const x = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map(function (d) {
              return d.Date;
            })
          );

        g4.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear().domain([0, maxYaxis]).range([height, 0]);
        g4.append("g").call(d3.axisLeft(y));

        g4.append("text")
          .attr("class", "axis-label")
          .attr("x", -height / 2)
          .attr("y", -40)
          .attr("transform", "rotate(-90)")
          .attr("text-anchor", "middle")
          .text("Number of cases")
          .attr("fill", "white");

        const line = d3
          .line()
          .x((d) => x(d.Date))
          .y((d) => y(d.Confirmed));

        var path = g4
          .append("path")

          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);

        const transitionPath = d3.transition().duration(1200);

        const pathLength = path.node().getTotalLength();

        path
          .attr("stroke-dashoffset", pathLength)
          .attr("stroke-dasharray", pathLength)
          .transition(transitionPath)
          .attr("stroke-dashoffset", 0);
      }

      function renderBarChart(data, provinceName, fillColor) {
        var barChart = d3.select("#thirdgroup");
        if (barChart) {
          barChart.remove();
        }
        data = data.filter((d) => d["Province"] == provinceName);
        var width = (windowWidth / 5) * 2,
          height = windowHeight / 4;

        var maxYaxis = 0;

        data.forEach(function (d) {
          var thisValue = d["新增确诊"];
          maxYaxis = Math.max(maxYaxis, thisValue);
        });

        const g3 = svg
          .append("g")
          .attr("id", "thirdgroup")
          .attr(
            "transform",
            `translate(${windowWidth - width - 60}, ${windowHeight / 10 + 350})`
          )
          .attr("width", width)
          .attr("height", height);

        g3.append("text")
          .attr("class", "axis-label")
          .attr("x", -height / 2)
          .attr("y", -40)
          .attr("transform", "rotate(-90)")
          .attr("text-anchor", "middle")
          .text("Number of cases increased")
          .attr("fill", "white");
        g3.append("text")
          .attr("class", "axis-label")
          .attr("x", width / 2)
          .attr("y", height + 50)
          .attr("text-anchor", "middle")
          .text("Date")
          .attr("fill", "white");

        // X axis
        const x = d3
          .scaleBand()
          .range([0, width])
          .domain(
            data.map(function (d) {
              return d.Date;
            })
          )
          .padding(0.3);

        g3.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear().domain([0, maxYaxis]).range([height, 0]);
        g3.append("g").call(d3.axisLeft(y));

        // Bars
        g3.selectAll("mybar")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function (d) {
            return x(d.Date);
          })
          .attr("width", x.bandwidth())
          .attr("fill", fillColor)
          // no bar at the beginning thus:
          .attr("height", function (d) {
            return height - y(0);
          }) // always equal to 0
          .attr("y", function (d) {
            return y(0);
          });

        var count = 1;

        // Animation
        g3.selectAll("rect")
          .transition()
          .duration(1200)
          .attr("y", function (d) {
            // console.log(d);
            return y(d.新增确诊);
          })
          .attr("height", function (d) {
            return height - y(d.新增确诊);
          })
          .on("end", function (d) {
            count += 1;
            if (count > 2) {
              return;
            }

            g3.append("g")
              .selectAll("text")
              .data(data)
              .enter()
              .append("text")
              .attr("class", "label")
              .attr("font-size", x.bandwidth() + 1)
              .attr("fill", "white")
              .attr("x", function (d) {
                return x(d.Date);
              })
              .attr("y", function (d) {
                return y(d["新增确诊"]) - 1;
              })
              .text(function (d) {
                return d["新增确诊"];
              });
          });
      }

      function renderPieChart(data, provinceName, day) {
        // console.log(data, provinceName, day);
        pie = d3
          .pie()
          .sort(null)
          .value((d) => d.value);

        arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(Math.min(windowWidth, windowHeight) / 6 - 1);

        arcLabel = d3
          .arc()
          .innerRadius((Math.min(windowWidth, windowHeight) / 7) * 0.8)
          .outerRadius((Math.min(windowWidth, windowHeight) / 7) * 0.8);

        const arcs = pie(data);

        const g2 = svg
          .append("g")
          .attr("id", "secondgroup")
          .attr(
            "transform",
            `translate(${windowWidth - 175}, ${windowHeight / 2})`
          )
          .attr("width", 200)
          .attr("height", 200)
          .selectAll("path")
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .data(arcs)
          .join("path")
          .attr("fill", function (d) {
            if (currMethod.properties.abbv == "Confirmed") {
              switch (d.data.name) {
                case "Confirmed":
                  return "#FB9966";
                  break;

                case "Recovered":
                  return "#F75C2F";
                  break;

                case "Death":
                  return "#CB4042";
                  break;

                default:
                  break;
              }
            } else if (currMethod.properties.abbv == "Recovered") {
              switch (d.data.name) {
                case "Confirmed":
                  return "#B5CAA0";
                  break;

                case "Recovered":
                  return "#90B44B";
                  break;

                case "Death":
                  return "#5B622E";
                  break;

                default:
                  break;
              }
            } else {
              switch (d.data.name) {
                case "Confirmed":
                  return "#FCFAF2";
                  break;

                case "Recovered":
                  return "#91989F";
                  break;

                case "Death":
                  return "#828282";
                  break;

                default:
                  break;
              }
            }
          })
          .attr("d", arc)
          .append("title")
          .text((d) => `${d.data.name}: ${d.data.value.toString()}`);

        const g2Text = svg
          .append("g")
          .attr("id", "secondgroupText")
          .attr(
            "transform",
            `translate(${windowWidth - 175}, ${windowHeight / 2})`
          )
          .attr("width", 200)
          .attr("height", 200)
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
          .selectAll("text")
          .data(arcs)
          .join("text")
          .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
          .call((text) =>
            text
              .append("tspan")
              .attr("y", "-0.4em")
              .attr("font-weight", "bold")
              .text((d) => d.data.name)
          )
          .call((text) =>
            text
              .append("tspan")
              .attr("x", 0)
              .attr("y", "0.7em")
              .attr("fill-opacity", 0.7)
              .text((d) => d.data.value.toString())
          );
      }
    });
  };

  const sliderBar = function () {
    var getDaysArray = function (start, end) {
      for (
        var arr = [], dt = new Date(start);
        dt <= end;
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(new Date(dt));
      }
      return arr;
    };

    var dataTime = getDaysArray(new Date(2020, 00, 21), new Date(2020, 01, 27));

    var sliderTime = d3
      .sliderBottom()
      .min(new Date(2020, 00, 21))
      .max(new Date(2020, 01, 27))
      // how much time slide once will change
      .step(1000 * 60 * 60 * 24 * 1)
      .width(300)
      .tickFormat(d3.timeFormat("%m/%d/%Y"))
      .tickValues(dataTime)
      .default(new Date(2020, 01, 27))
      .on("onchange", (val) => {
        d3.select("p#value-time").text(d3.timeFormat("%m/%d/%Y")(val));

        var dateString = d3.timeFormat("%d/%m/%Y")(val);
        dateString = dateString.slice(0, 3) + dateString.slice(4, 8);
        if (dateString[0] == "0") {
          dateString = dateString.slice(1);
        }
        currDate = dateString;
        if (currMethod.properties.abbv == "Comparison") {
          render(currMethod, dateString);
          comparison(dateString);
        } else {
          render(currMethod, dateString);
        }
      });

    var gTime = d3
      .select("#slider-time")
      .append("svg")
      .attr("width", 400)
      .attr("height", 100)

      .append("g")
      .attr("transform", "translate(10, 10)");

    gTime.call(sliderTime);

    d3.select("p#value-time").text(
      d3.timeFormat("%m/%d/%Y")(sliderTime.value())
    );
  };

  sliderBar();

  const comparison = function (date) {
    document.querySelector(".svg3").classList.remove("notdisplay");
    document.querySelector(".svg1").classList.add("notdisplay");
    d3.select(".svg2").remove();
    d3.select(".first-group").remove();

    var day = date || "27/2/20";
    // set the dimensions and margins of the graph
    var margin = {
        top: 30,
        right: 30,
        bottom: 70,
        left: 60,
      },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3
      .select(".svg3")

      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(0, 200)")
      .style("margin", "auto")
      .append("g")
      .attr("class", "first-group")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("/d3 Visualization/data/province.csv").then(function (data) {
      data = data.filter((d) => d["Date"] == day && d["Province"] != "总计");
      // sort data
      data.sort(function (b, a) {
        return a.Confirmed - b.Confirmed;
      });

      var maxYaxis = 0;

      data.forEach(function (d) {
        var thisValue = d["Confirmed"];
        maxYaxis = Math.max(maxYaxis, thisValue);
      });

      data = data.slice(0, 11);

      // X axis
      var x = d3
        .scaleBand()
        .range([0, width])
        .domain(
          data.map(function (d) {
            return province_name_map[d.Province];
          })
        )
        .padding(0.2);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear().domain([0, maxYaxis]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Bars
      svg
        .selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(province_name_map[d.Province]);
        })
        .attr("y", function (d) {
          return y(0);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
          return height - y(0);
        })
        .attr("fill", "#69b3a2");

      var count = 1;

      // Animation
      svg
        .selectAll("rect")
        .transition()
        .duration(1500)
        .attr("y", function (d) {
          // console.log(d);
          return y(d.Confirmed);
        })
        .attr("height", function (d) {
          return height - y(d.Confirmed);
        })
        .on("end", function (d) {
          count += 1;
          if (count > 2) {
            return;
          }

          svg
            .append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("width", x.bandwidth())
            .attr("fill", "white")
            .attr("x", function (d) {
              return x(province_name_map[d.Province]);
            })
            .attr("y", function (d) {
              return y(d["Confirmed"]) - 1;
            })
            .text(function (d) {
              return d["Confirmed"];
            });
        });
    });
  };

  let methods = {
    confirmed: {
      color: d3.interpolateReds,
      properties: {
        title: "Confirmed cases",
        abbv: "Confirmed",
        columeName: "Confirmed",
      },
    },
    Recovered: {
      color: d3.interpolateGreens,
      properties: {
        title: "Recovered cases",
        abbv: "Recovered",
        columeName: "Recovered",
      },
    },
    Death: {
      color: d3.interpolateGreys,
      properties: {
        title: "Death cases",
        abbv: "Death",
        columeName: "Death",
      },
    },
    Comparison: {
      color: d3.interpolateReds,
      properties: {
        title: "Confirmed cases",
        abbv: "Comparison",
        columeName: "Confirmed",
      },
    },
    BarChartRace: {
      color: d3.interpolateReds,
      properties: {
        title: "Bar chart race",
        abbv: "Bar chart race",
        columeName: "Confirmed",
      },
    },
  };

  for (let method in methods) {
    d3.select(".methods")
      .append("input")
      .attr("type", "radio")
      .attr("name", "method-ratio")
      .attr("id", method)
      .on("click", function () {
        currMethod = methods[method];
        if (currMethod.properties.abbv == "Comparison") {
          comparison(currDate);
        } else if (currMethod.properties.abbv == "Bar chart race") {
          barChartRace();
        } else {
          render(currMethod, currDate);
        }
      });

    d3.select(".methods")
      .append("label")
      .attr("for", method)
      .attr("class", "clickable")
      .text(methods[method].properties.abbv);
  }

  document.querySelector('label[for="confirmed"]').click();
});

var chart;
const barChartRace = function () {
  document.querySelector(".svg1").classList.add("notdisplay");

  document.querySelector(".svg3").classList.add("notdisplay");

  document.querySelector(".slider").classList.add("notdisplay");
  displayChart();
};
const displayChart = function () {
  const svg2 = d3
    .select(".chart2")
    .append("svg")
    .attr("class", "svg2")
    .attr("id", "secondsvg")
    .style("margin", "auto");
  const width2 = document.documentElement.clientWidth / 1.5;
  // console.log(document.documentElement.clientWidth);
  const height2 = document.documentElement.clientHeight;
  const margin2 = {
    top: 200,
    right: 0,
    bottom: 0,
    left: 0,
  };
  svg2
    .attr("width", width2)
    .attr("height", height2)
    .attr("viewBox", [0, 0, width2, height2]);
  barSize = 48;

  d3.csv("/d3 Visualization/data/province1.csv").then(function (data) {
    // data = d3.csvParse(await FileAttachment("/data/category-brands.csv").text(), d3.autoType);
    data = data.filter((d) => d["name"] !== "总计");
    n = 12;
    y = d3
      .scaleBand()
      .domain(d3.range(n + 1))
      .rangeRound([margin2.top, margin2.top + barSize * (n + 1 + 0.1)])
      .padding(0.1);
    x = d3.scaleLinear([0, 1], [margin2.left, width2 - margin2.right]);

    color = (function () {
      const scale = d3.scaleOrdinal(d3.schemeTableau10);
      if (data.some((d) => d.category !== undefined)) {
        const categoryByName = new Map(data.map((d) => [d.name, d.category]));
        scale.domain(Array.from(categoryByName.values()));
        return (d) => scale(categoryByName.get(d.name));
      }
      return (d) => scale(d.name);
    })();
    formatDate = d3.utcFormat("%m/%d/%Y");
    formatNumber = d3.format(",d");
    names = new Set(data.map((d) => d.name));
    k = 10;
    duration = 250;
    d3.group(data, (d) => d.name);
    // viewof replay = html `<button>Replay`;

    datevalues = Array.from(
      d3.rollup(
        data,
        ([d]) => d.value,
        (d) => d.date,
        (d) => d.name
      )
    )
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b));
    // console.log(datevalues)

    function ticker(svg) {
      const now = svg
        .append("text")
        .attr("id", "dateText")
        .style("font", `bold ${barSize}px var(--sans-serif)`)
        .style("font-variant-numeric", "tabular-nums")
        .style("font-size", `${barSize}px`)
        .style("fill", "white")
        .attr("text-anchor", "end")
        .attr("x", width2 - 6)
        .attr("y", margin2.top + barSize * (n - 0.45))
        .attr("dy", "0.32em")
        .text(formatDate(keyframes[0][0]));

      return ([date], transition) => {
        transition.end().then(() => now.text(formatDate(date)));
      };
    }

    function axis(svg) {
      const g = svg
        .append("g")
        .attr("transform", `translate(0,${margin2.top})`);

      const axis = d3
        .axisTop(x)
        .ticks(width2 / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));

      return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
      };
    }

    function textTween(a, b) {
      const i = d3.interpolateNumber(a, b);
      return function (t) {
        this.textContent = formatNumber(i(t));
      };
    }

    function labels(svg) {
      let label = svg
        .append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");

      return ([date, data], transition) =>
        (label = label
          .data(data.slice(0, n), (d) => d.name)
          .join(
            (enter) =>
              enter
                .append("text")
                .attr(
                  "transform",
                  (d) =>
                    `translate(${x((prev.get(d) || d).value)},${y(
                      (prev.get(d) || d).rank
                    )})`
                )
                .attr("y", y.bandwidth() / 2)
                .attr("x", -6)
                .attr("dy", "-0.25em")
                .attr("fill", "white")
                .text((d) => province_name_map[d.name])
                .call((text) =>
                  text
                    .append("tspan")
                    .attr("fill-opacity", 0.7)
                    .attr("font-weight", "normal")
                    .attr("x", -6)
                    .attr("dy", "1.15em")
                ),
            (update) => update,
            (exit) =>
              exit
                .transition(transition)
                .remove()
                .attr(
                  "transform",
                  (d) =>
                    `translate(${x((next.get(d) || d).value)},${y(
                      (next.get(d) || d).rank
                    )})`
                )
                .call((g) =>
                  g
                    .select("tspan")
                    .tween("text", (d) =>
                      textTween(d.value, (next.get(d) || d).value)
                    )
                )
          )
          .call((bar) =>
            bar
              .transition(transition)
              .attr("transform", (d) => `translate(${x(d.value)},${y(d.rank)})`)
              .call((g) =>
                g
                  .select("tspan")
                  .tween("text", (d) =>
                    textTween((prev.get(d) || d).value, d.value)
                  )
              )
          ));
    }

    function bars(svg) {
      let bar = svg.append("g").attr("fill-opacity", 0.6).selectAll("rect");

      return ([date, data], transition) =>
        (bar = bar
          .data(data.slice(0, n), (d) => d.name)
          .join(
            (enter) =>
              enter
                .append("rect")
                .attr("fill", color)
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", (d) => y((prev.get(d) || d).rank))
                .attr("width", (d) => x((prev.get(d) || d).value) - x(0)),
            (update) => update,
            (exit) =>
              exit
                .transition(transition)
                .remove()
                .attr("y", (d) => y((next.get(d) || d).rank))
                .attr("width", (d) => x((next.get(d) || d).value) - x(0))
          )
          .call((bar) =>
            bar
              .transition(transition)
              .attr("y", (d) => y(d.rank))
              .attr("width", (d) => x(d.value) - x(0))
          ));
    }

    keyframes = (function () {
      const keyframes = [];
      let ka, a, kb, b;
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k;
          keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(
              (name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t
            ),
          ]);
        }
      }
      keyframes.push([new Date(kb), rank((name) => b.get(name) || 0)]);
      return keyframes;
    })();
    // console.log(keyframes);

    nameframes = d3.groups(
      keyframes.flatMap(([, data]) => data),
      (d) => d.name
    );
    next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
    prev = new Map(
      nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
    );

    rank((name) => datevalues[0][1].get(name));

    function rank(value) {
      const data = Array.from(names, (name) => ({
        name,
        value: value(name),
      }));
      data.sort((a, b) => d3.descending(a.value, b.value));
      for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
      return data;
    }

    chart = async function plot() {
      const updateBars = bars(svg2);
      const updateAxis = axis(svg2);
      const updateLabels = labels(svg2);
      const updateTicker = ticker(svg2);

      // yield svg2.node();

      for (const keyframe of keyframes) {
        const transition = svg2
          .transition()
          .duration(duration)
          .ease(d3.easeLinear);

        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);

        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);

        // invalidation.then(() => svg2.interrupt());
        await transition.end();
      }
    };
    chart();
  });
};
