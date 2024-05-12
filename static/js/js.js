
    // set the dimensions and margins of the graph
    const margin = {top: 80, right: 0, bottom: 80, left: 120},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(playerData.map(d => d.Name)))
    const myVars = Object.keys(playerData[0]).filter(key => key !== 'Name' && key !== 'Player ID');

  // Build X scales and axis:
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(myGroups)
  .padding(0.05);

svg.append("g")
    .style("font-size", 11)
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x).tickSize(0))
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-0.8em")
  .attr("dy", "-0.5em")
  .attr("transform", "rotate(-45)");



    // Build Y scales and axis:
    const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.05);
    svg.append("g")
    .style("font-size", 11)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

    // Build color scale
     var myColor = d3.scaleSequential()
    .interpolator( d3.interpolateRdYlBu)
    .domain([1.37, -.81])

    // TODO redo it to the pop-up notification on hover
    // create a tooltip
    const tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("border", "solid")
        .style("width", "50%")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
    tooltip
        .style("opacity", 1)

        // d3.select(this)
        // .style("stroke", "red")

    // Highlight row and column
    const selectedGroup = d.group;
    const selectedVariable = d.variable;

    svg.selectAll("rect")
        .filter(function(e) {
            return e.group === selectedGroup || e.variable === selectedVariable;
        })
        .style("stroke", "red");
}
    const mousemove = function(event,d) {
    tooltip
        .html("The exact value of<br>this cell is: " + d.value)
        .style("left", (event.x) / 2 + "px")
        .style("top", (event.y) / 2 + "px")
}
    const mouseleave = function(event,d) {
    tooltip.style("opacity", 0);

    // Remove highlight
    svg.selectAll("rect")
        .style("stroke", "none");
}

    // add the squares
    svg.selectAll()
    .data(playerData)
    .enter()
    .selectAll("rect")
    .data(function(d) {return myVars.map(function(key) {return {group: d.Name, variable: key, value: d[key]};});})
    .join("rect")
    .attr("x", function(d) {return x(d.group)})
    .attr("y", function(d) {return y(d.variable)})
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) {return myColor(d.value)} )
    .style("stroke-width", 2)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

    // Add title to graph
    svg.append("text")
    .attr("x", 0)
    .attr("y", -50)
    .attr("text-anchor", "left")
    .style("font-size", "22px")
    .text("other title");

    // Add subtitle to graph
    svg.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "left")
    .style("font-size", "14px")
    .style("fill", "grey")
    .style("max-width", 400)
    .text("other text");

// Add scatterplot connected to our heatmap

    // Define a function to handle mouseover event on PCA scatterplot
const handlePCAOver = function(event, d) {
    // Identify the player associated with the hovered dot
    const hoveredPlayer = d.Name;

    // Highlight the corresponding row in the heatmap
    svg.selectAll("rect")
        .filter(function(e) {
            return e.Name === hoveredPlayer;
        })
        .style("stroke", "red");
};

// Define a function to handle mouseleave event on PCA scatterplot
const handlePCALeave = function(event, d) {
    // Remove the highlight from the heatmap
    svg.selectAll("rect")
        .style("stroke", "none");
};

// Create an additional scatterplot near the heatmap for the PCA scatterplot
const pcaMargin = {top: 20, right: 20, bottom: 20, left: 20};
const pcaWidth = 200 - pcaMargin.left - pcaMargin.right;
const pcaHeight = 200 - pcaMargin.top - pcaMargin.bottom;

const pcaSvg = d3.select("#pca_scatterplot")
    .append("svg")
    .attr("width", pcaWidth + pcaMargin.left + pcaMargin.right)
    .attr("height", pcaHeight + pcaMargin.top + pcaMargin.bottom)
    .append("g")
    .attr("transform", `translate(${pcaMargin.left}, ${pcaMargin.top})`);

// Add event listeners to the PCA scatterplot dots
pcaSvg.selectAll("circle")
    .on("mouseover", handlePCAOver)
    .on("mouseleave", handlePCALeave);
