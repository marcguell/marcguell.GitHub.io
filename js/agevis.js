
AgeVis = function(_parentElement, _data,_radioDistribution){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.radioDistribution=_radioDistribution;

    // TODO: define all constants here
    this.margin = {top: 20, right: 0, bottom: 30, left: 30},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
AgeVis.prototype.initVis = function(){

    var that = this; 

    //construct or select svg
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  // - create axis
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.ordinal()
      .rangeRoundBands([0, this.height], .1);
    
    this.color = d3.scale.category20();
    
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(6)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .tickValues([1,5,10,25,50,75,])
      .orient("left");

    // Add axes visual elements
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");

    // Add axes visual elements
    this.svg.append("g")
      .attr("class", "y axis")

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
AgeVis.prototype.wrangleData= function(_filterFunction){

    this.allData=this.filterAndAggregate(null);

    this.displayData = this.filterAndAggregate(_filterFunction);

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AgeVis.prototype.updateVis = function(){

	var that = this;

   // updates scales

	var MaxMin=d3.extent(this.displayData, function(d) { return d.count; });

	this.x.domain(d3.extent(this.displayData, function(d) { return d.count; }));
 	this.y.domain(this.displayData.map(function(d) { return d.size; }));
	this.color.domain(this.displayData.map(function(d) { return d.size }));

     // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

  // updates axis
    this.svg.select(".y.axis")
        .call(this.yAxis);

    // updates graph

    this.svg.selectAll(".bar").remove();

    // Data join
    var bar = this.svg.selectAll(".bar")
      .data(this.displayData);

    // Append new bar groups, if required
    var bar_enter = bar.enter().append("g");

    // Append a rect and a text only for the Enter set (new g)
    bar_enter.append("rect");
    bar_enter.append("text");

    // Add attributes (position) to all bars
    bar
      .attr("class", "bar")
      .transition()
      .attr("transform", function(d, i) { 

        if(typeof d != 'undefined'){

          return "translate(0," + that.y(d.size) + ")";
        }
         })


    // Remove the extra bars
    bar.exit()
      .remove();


    bar.selectAll("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 
          this.y.rangeBand()/2
        
        
      )
        
      .style("fill", function(d,i) {
        if(d.type=="deletions"){
          return "blue";  
        }else{
          return "red";
        }
        
      })
      .transition()
      .attr("width", function(d, i) {
          return that.x(d.count);
      });

}



/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */

var selectionStartV,selectionEndV;

AgeVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    selectionStartV=selectionStart;
    selectionEndV=selectionEnd;
    this.wrangleData(this.filterAndAggregate(filterFunc));
    this.updateVis();

}


/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */
    filterFunc=function(d){
            if((d.start1+d.block1)>=selectionStartV & (d.start2)<=selectionEndV){
                return true;
            }else{
                return false;
            }
    };


AgeVis.prototype.onRadioChange= function (_radioDistribution){
 
      this.radioDistribution=_radioDistribution;
      this.wrangleData(filterFunc);
      
      this.updateVis();

}

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
AgeVis.prototype.filterAndAggregate = function(_filter){

    // Set filter to a function that accepts all items
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
        filter=filterFunc;
    }

    var that = this;

    // create an array of values for age 0-100
    var res_dels = d3.range(100).map(function (d) {
        return {size:d,count:0,type:"deletions"};
    });

    var res_ins = d3.range(100).map(function (d) {
        return {size:d,count:0,type:"insertions"};
    });


 var res_sum_dels=[];
  for(var prop in that.data.deletions){
      res_sum_dels.push({name:that.data.deletions[prop][0].id,
        start1:parseInt(that.data.deletions[prop][0].templateStart),
          start2:parseInt(that.data.deletions[prop][0].templateStart2),
            block1:parseInt(that.data.deletions[prop][0].blockSize1),
              block2:parseInt(that.data.deletions[prop][0].blockSize2)});

  }

    // accumulate all values that fulfill the filter criterion


    res_sum_dels.filter(filter).forEach(function(d){
        res_dels[d.start2-(d.start1+d.block1-1)-1].count=res_dels[d.start2-(d.start1+d.block1-1)-1].count+1;

    });

 var res_sum_ins=[];
        for(var prop in that.data.insertions){
      res_sum_ins.push({name:that.data.insertions[prop][0].id,
        start1:parseInt(that.data.insertions[prop][0].templateStart),
          start2:parseInt(that.data.insertions[prop][0].templateStart2),
            block1:parseInt(that.data.insertions[prop][0].blockSize1),
              block2:parseInt(that.data.insertions[prop][0].blockSize2),
              sequence:that.data.insertions[prop][0].seq,
              insertion:parseInt(that.data.insertions[prop][0].queryStart2)-(parseInt(that.data.insertions[prop][0].blockSize1)+parseInt(that.data.insertions[prop][0].queryStart1)+-1),
                type:"insertion"});

  }
 res_sum_ins.filter(filter).forEach(function(d){
        res_ins[d.insertion-1].count=res_ins[d.insertion-1].count+1;

    });

var res=[];
  if(this.radioDistribution[0][0].checked==true){
    res=res_dels.concat(res_ins);  
  }else if(this.radioDistribution[0][1].checked==true){
    res=res_dels;
  }else if(this.radioDistribution[0][2].checked==true){
    res=res_ins;
  }


    return res;

}




