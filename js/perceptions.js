// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 50, left: 70},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var divCharts = d3.select("body").append("div").attr("class","charts container");

// Get the data
d3.csv("https://raw.githubusercontent.com/thiagomata/perceptions-of-probability/master/data/data.csv", function(error, data) {
  if (error) throw error;
  window.data = data;

  var dimensions = data.columns.filter( c => c != "probability");

  // dimensionColor = d3. line().curve(d3.curveCardinal)
  //   .domain([1,dimensions.length/2,dimensions.length])
  //   .interpolate(d3.interpolateLab)
  //   .range([d3.rgb("#772200"), d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

  var dimensionColor =  d3.scaleSequential(d3.interpolateInferno)
      .domain([dimensions.length,0]);

  window.dimensionColor = dimensionColor;
  dimensions.forEach(
    ( dimension, key ) => {

      // define the line
      var area = d3.area()
          .curve(d3.curveCatmullRom)
          .x(function(d) {
            return x(d.probability);
          })
          .y1(
            function(d) {
            return y(d[dimension]);
          });

      area.y0(y(0))

      // define the line
      var valueline = d3.line()
          .curve(d3.curveCatmullRom)
          .x(function(d) { return x(d.probability); })
          .y(function(d) { return y(d[dimension]); });

      window.valueline = valueline;

      var divDimension = divCharts.append("div").attr("class","dimension");
      var divChart = divDimension.append("div").attr("class","chart row card card-front");
      divChart.append("h2").text(dimension);
      var divTable = divDimension.append("div").attr("class","row-fluid card card-back");
      divTable.append("h2").text(dimension);

      var svg = divChart.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


      // Scale the range of the data
      x.domain([0, 100]);
      y.domain([0, 100]);

      // gridlines in x axis function
      function make_x_gridlines() {
          return d3.axisBottom(x)
              .ticks(5)
      }

      // gridlines in y axis function
      function make_y_gridlines() {
          return d3.axisLeft(y)
              .ticks(5)
      }

      // add the X gridlines
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

      // add the Y gridlines
      svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

      // Add the valueline path.
      // svg.append("path")
      //     .data([data])
      //     .attr("class", "line")
      //     .attr("d", valueline);

      svg.append("path")
          .data([data])
          .attr("class", "area")
          .attr("style", "fill:"+dimensionColor(key))
          .attr("d", area);
      // Add the x Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // text label for the x axis
      svg.append("text")
          .attr("transform",
                "translate(" + (width/2) + " ," +
                               (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text("Probability");

      // Add the y Axis
      svg.append("g")
          .call(d3.axisLeft(y));

      // text label for the y axis
      svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Perception");

      var prob = data.map(
        d => {
          return {
            probability: 1 - ( 1 / 100 ) * d.probability,
            chance: ( 1 / 100 ) * d[dimension]
          }
        }
      );

      var scrumValues = [1,2,3,5,8,13,20,30,50,100];
      var crossScrumRanges = [];
      scrumValues.forEach(
        (v1) => {
          scrumValues.forEach(
            (v2) => {
              if( v1 < v2 ) {
                crossScrumRanges.push({from:v1,to:v2});
              }
            }
          )
        }
      );

      var crossScrumValues = crossScrumRanges.map(
        (scrumRange) => {
          var valueRange = prob.map(
            p => {
              return {
                probability: scrumRange.from +
                  p.probability * ( scrumRange.to - scrumRange.from),
                chance: p.chance
              }
            }
          );
          var expectedValue = valueRange.map(
            n => n.probability * n.chance
          ).reduce( (a,b) => a + b );

          return {
            from: scrumRange.from,
            to: scrumRange.to,
            value: Math.round( expectedValue )
          }
        }
      );

      var scrumTable = document.createElement("table");
      scrumTable.setAttribute("class","scrum-table-values center-block");

      var scrumTableTitle =  document.createElement("tr");
      scrumTableTitle.setAttribute("class","table-title-tr");
      var scrumTableTitleLabel =  document.createElement("td");
      scrumTableTitleLabel.setAttribute("class","table-title-label-td");
      scrumTableTitleLabel.innerHTML = "<span>Probable Score considering the Optimist and Pessimist values <br/> where the Optimist is " + dimension + "</span>";
      scrumTableTitleLabel.setAttribute("colspan",scrumValues.length+2);
      scrumTableTitle.appendChild(scrumTableTitleLabel);
      scrumTable.appendChild(scrumTableTitle);

      var scrumTableLabel =  document.createElement("tr");
      scrumTableLabel.setAttribute("class","optimist-label-tr");

      var scrumHeaderLabelEmpty =  document.createElement("td");
      scrumHeaderLabelEmpty.setAttribute("class","label-empty-td");
      scrumHeaderLabelEmpty.setAttribute("colspan",1);
      scrumTableLabel.appendChild( scrumHeaderLabelEmpty );
      var scrumHeaderLabel =  document.createElement("td");
      scrumHeaderLabel.setAttribute("colspan",scrumValues.length+1);
      scrumHeaderLabel.setAttribute("class","optimist-label-td");
      scrumHeaderLabel.innerHTML = "Optimist";
      scrumTableLabel.appendChild( scrumHeaderLabel );

      var scrumTableHeader =  document.createElement("tr");
      var scrumHeaderEmpty =  document.createElement("td");
      scrumHeaderEmpty.setAttribute("class","empty-cross-td");
      scrumTableHeader.appendChild( scrumHeaderEmpty );
      scrumValues.forEach(
        (v2) => {
          var scrumHeaderV2 =  document.createElement("td");
          scrumHeaderV2.setAttribute("class","td-header");
          scrumHeaderV2.innerHTML = v2;
          scrumTableHeader.appendChild(scrumHeaderV2);
        }
      );

      scrumValues.forEach(
        (v1,key) => {
          var scrumTableRow =  document.createElement("tr");
          if( key == 0 ) {
            var scrumHeaderV1  =  document.createElement("td");
            scrumHeaderV1.innerHTML = "Pessimist";
            scrumHeaderV1.setAttribute("class","pessimist-label-td");
            scrumHeaderV1.setAttribute("rowspan", scrumValues.length + 1);
            scrumTableRow.appendChild( scrumHeaderV1 );
          }
          var scrumHeaderV1 =  document.createElement("td");
          scrumHeaderV1.innerHTML = v1;
          scrumHeaderV1.setAttribute("class","td-header");
          scrumTableRow.appendChild( scrumHeaderV1 );
          // add values
          scrumValues.forEach(
            (v2) => {
              var scrumTableCell =  document.createElement("td");
              var scrumValue = crossScrumValues.filter(
                n => n.to == v1 && n.from == v2
              );
              if( scrumValue.length == 0 ) {
                scrumTableCell.innerHTML = "";
                scrumTableCell.setAttribute("class","emptyvalue");
              } else {
                scrumTableCell.innerHTML = scrumValue[0].value;
              }
              scrumTableRow.appendChild( scrumTableCell );
            }
          );
          scrumTable.appendChild( scrumTableRow );
        }
      );
      scrumTable.appendChild(scrumTableHeader);
      scrumTable.appendChild(scrumTableLabel);

      window.divTable = divTable;
      divTable.node().appendChild(scrumTable);

    }
  );
});
