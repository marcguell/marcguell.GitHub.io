
CountVis = function(_parentElement, _data,  _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.displayData = [];


    // TODO: define all "constants" here
    this.margin = {top: 20, right: 0, bottom: 30, left: 30},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountVis.prototype.initVis = function(){

    var that = this; // read about the this

    // - construct SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    // - create axis
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .range([this.height, 0]);
    
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");


    this.area = d3.svg.area( ) 
      .interpolate("monotone")
      .x(function(d) { 
        return that.x(d.locus); })
      .y0(this.height)
      .y1(function(d) { 
        return that.y(d.counts); });


    //brushing to select certain genetic locus to focus
    
    this.brush = d3.svg.brush()
      .on("brush", function(){
         
        var startStopDates=that.brush.extent();
        that.brush.empty();

        $(that.eventHandler).trigger("selectionChanged",[startStopDates[0],startStopDates[1]]);


      });

       // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Counts");

    this.svg.append("g")
      .attr("class", "brush");

    this.svg = this.parentElement.select("svg");

    this.addSlider(this.svg);
    this.addDonut(this.svg);

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}

/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(){

	that=this;

	var dd=[];
	var mm=[];
	for(var prop in that.data.deletions){
		var rangeDel=d3.range(parseInt(that.data.deletions[prop][0].templateStart)+parseInt(that.data.deletions[prop][0].blockSize1),parseInt(that.data.deletions[prop][0].templateStart2));
		rangeDel.forEach(function(d){dd.push(d);});
		
	}
	
	var res=[];
	res=d3.range(0,d3.max(dd)+d3.min(dd)).map(function(d){return {counts:0,locus:d};});
	
	dd.forEach(function(d){
		res[d].counts=res[d].counts+1;
	});
	
	//console.log(res);

	this.data=res;	
	

    this.displayData = this.data;


}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(){
    // updates scales
    this.x.domain(d3.extent(this.displayData, function(d) { 
	return d.locus; }));
    this.y.domain(d3.extent(this.displayData, function(d) { return d.counts; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // updates graph
    var path = this.svg.selectAll(".area")
      .data([this.displayData])

    path.enter()
      .append("path")
      .attr("class", "area");

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();


    this.brush.x(this.x);
    var gBrush=this.svg.select(".brush")
        .call(this.brush)
      .selectAll("rect")
        .attr("height", this.height);



}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CountVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function
    this.wrangleData();
    // do nothing -- no update when brushing


}


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */




//slider function to zoom Y axis
CountVis.prototype.addSlider = function(svg){
    var that = this;


    var sliderScale = d3.scale.linear().domain([0,200]).range([0,200])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));

        var sliderValue = sliderScale.invert(value);

        that.y=d3.scale.pow().exponent(sliderValue/200)
            .range([that.height, 0]);

        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })

        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+0+","+30+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        y:0,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)


}

//add donut with HR and NHEJ values

CountVis.prototype.addDonut = function(svg){
    var that = this;

    var width = that.width/5,
        height = that.height/5,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
        .range(["#fc9272", "#99d8c9"]);

    var arc = d3.svg.arc()
        .outerRadius(radius/2)
        .innerRadius(4*radius/5);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.quantity; });

    var donutGroup = svg.append("g").attr({
        class:"donutGroup",
        "transform":"translate("+this.width*0.9+","+30+")"
    })



    donutGroup.append("svg")
       .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    var g = donutGroup.selectAll(".arc")
      .data(pie([{type:"HR",quantity:100*parseFloat(that.data.HR)},{type:"NHEJ",quantity:100*parseFloat(that.data.NHEJ)}]))
    .enter().append("g")
      .attr("class", "arc");


    var tooltip=g.append("text")
    .attr("transform", "translate(-" +3*width + "," + height/2  + ")")
    .style("visibility", "hidden")
    .attr("dy", ".50em")
    .attr("fill","black")
    .attr("font-weight","bold")
    .classed("top", true)
    .text("Homologous recombination (HR) percentage, and non-homologous end-joining (NHEJ)");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.type); })
      .on("mouseover", function(){return tooltip.style("visibility", "visible");})
        .on("mousemove", function(){return tooltip.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
      

    g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".50em")
      .attr("fill","black")
      .attr("font-weight","bold")
      .style("text-anchor", "middle")
      .text(function(d) { 
            var formatter=d3.format(".2f");

            return d.data.type+":"+formatter(d.data.quantity/100)+"%";
         });
      

}






