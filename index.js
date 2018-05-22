const ArrayMore = require("arraymore.js");
const csv = require("csv-array");
const d3 = require("d3");


var data = null;
var arrData = null;
csv.parseCSV("./data/data.csv", function(csvData){
  data = csvData;
  arrData = ArrayMore.cast(data);
});

const almostCertainly = arrData.map(
  d => 1 * d['Almost Certainly']
)
