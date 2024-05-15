
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
    const myVars = Object.keys(playerData[0]).filter(key => key !== 'Name' && key !== 'Player ID' && key !== 'PC1'&& key !== 'PC2');

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
        // Highlight row and column
        const selectedGroup = d.group;
        const selectedVariable = d.variable;
        svg.selectAll("rect")
            .filter(function(e) {
                return e.group === selectedGroup || e.variable === selectedVariable;
            })
            .style("stroke", "red");
        // Highlight corresponding dot in scatterplot
    highlightScatterplotDot(selectedGroup);
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

    //Scatterplot
    // Define the circles for the scatterplot

    // Define the scatterplot function
    function drawScatterplot(data) {
        // Set up dimensions and margins
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width = 400 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Append the SVG element for the scatterplot
        const svg = d3.select("#scatterplot-dot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Set up scales for X and Y axes
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.PC1))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.PC2))
            .range([height, 0]);

        // Build color scale for scatterplot
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateRdYlBu)
            .domain([1.37, -0.81]);

        // Add circles for scatterplot
        svg.selectAll(".scatterplot-dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "scatterplot-dot")
            .attr("fill", d => myColor(d.PC1 + d.PC2))
            .attr("cx", d => xScale(d.PC1))
            .attr("cy", d => yScale(d.PC2))
            .attr("r", 5)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke", "red")
                highlightHeatmapPlayer(d.Name)
            })
            .on("mouseleave", function(event, d) {
                 d3.select(this).attr("stroke", "none");
                 svg.selectAll("rect")
                .style("stroke", "none");
            });
    }

    // Call the scatterplot function
    drawScatterplot(playerData);

    // By hovering over a dot in the PCA scatterplot, highlight the corresponding team/player on the heatmap
    function highlightHeatmapPlayer(playerName) {
        // Remove highlight from all rects
        svg.selectAll("rect")
            .style("stroke", "none");
        // Highlight corresponding player
        svg.selectAll("rect")
            .filter(function(d) { return d.group === playerName; })
            .style("stroke", "red");
    }

    function highlightScatterplotDot(playerName) {
    // Remove highlight from all dots
    d3.selectAll(".scatterplot-dot")
        .attr("stroke", "none");
    // Highlight corresponding dot
    d3.selectAll(".scatterplot-dot")
        .filter(function(d) { return d.Name === playerName; })
        .attr("stroke", "red")
        .attr("stroke-width", 2 );
}

console.log(filtered)