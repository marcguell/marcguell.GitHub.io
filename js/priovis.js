



PrioVis = function(_parentElement, _data,_radioDistribution){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.allData=[];
    this.seqs=[];

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
PrioVis.prototype.initVis = function(){

    var that = this; // read about the this



  

    //TODO: create axis and scales

  // - create axis
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.ordinal()
      .rangeRoundBands([0, this.height], .1);
        //.rangeRoundBands([0,this.height],0.1);
    
    //this.color = d3.scale.category20();


    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .ticks(6)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    //var zoom = d3.behavior.zoom()//http://bl.ocks.org/mbostock/3892919
      //.x(this.x)
      //.y(this.y)
      //.scaleExtent([1, 32])
 //     .on("zoom", function() {
   //     this.svg.select(".x.axis").call(this.xAxis);
     //   this.svg.select(".y.axis").call(this.yAxis);
     // });

    this.zoom = d3.behavior.zoom().on("zoom", function () {
        that.updateVis();
    }).scaleExtent([1,20]);

    // bind the xScale to react to zoom events !!
    this.zoom.x(that.x);





    //TODO: construct or select SVG
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
    
    .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(this.zoom)
        .on("mousedown.zoom",null)
        .on("touchstart.zoom",null);
        


    // Add axes visual elements
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();




}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
PrioVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    //this.previousData=this.displayData;
    //this.allData=this.filterAndAggregate(null);
    //this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
    //console.log(this.data2.deletions);

  var that=this;



  var resDels=[];
  for(var prop in that.data.deletions){
      resDels.push({name:that.data.deletions[prop][0].id,
        start1:parseInt(that.data.deletions[prop][0].templateStart),
          start2:parseInt(that.data.deletions[prop][0].templateStart2),
          query1:parseInt(that.data.deletions[prop][0].queryStart1),
          query2:parseInt(that.data.deletions[prop][0].queryStart2),
            block1:parseInt(that.data.deletions[prop][0].blockSize1),
              block2:parseInt(that.data.deletions[prop][0].blockSize2),
              sequence:that.data.deletions[prop][0].seqs,
                type:"deletion"});

  }

  resDels=resDels.sort(function(a,b){
            if((a.start1+a.block1)>(b.start1+b.block1)){
              return 1;
            } else if((a.start1+a.block1)<(b.start1+b.block1)){
              return -1;
            } else if((a.start1+a.block1)==(b.start1+b.block1)){
                if((a.start2-(a.start1+a.block1))>=(b.start2-(b.start1+b.block1))){
                  return 1;
                } else if((a.start2-(a.start1+a.block1))<(b.start2-(b.start1+b.block1))){
                  return -1;
              }
            }

      });

  var resIns=[];
  

    for(var prop in that.data.insertions){
      resIns.push({name:that.data.insertions[prop][0].id,
        start1:parseInt(that.data.insertions[prop][0].templateStart),
          start2:parseInt(that.data.insertions[prop][0].templateStart2),
            block1:parseInt(that.data.insertions[prop][0].blockSize1),
              block2:parseInt(that.data.insertions[prop][0].blockSize2),
              sequence:that.data.insertions[prop][0].seq,
              insertion:parseInt(that.data.insertions[prop][0].queryStart2)-(parseInt(that.data.insertions[prop][0].blokSize1)+parseInt(that.data.insertions[prop][0].queryStart1)+-1),
                type:"insertion"});

  }


    resIns=resIns.sort(function(a,b){
            if((a.start1+a.block1)>(b.start1+b.block1)){
              return 1;
            } else if((a.start1+a.block1)<(b.start1+b.block1)){
              return -1;
            } else if((a.start1+a.block1)==(b.start1+b.block1)){
                if((a.start2-(a.start1+a.block1))>=(b.start2-(b.start1+b.block1))){
                  return 1;
                } else if((a.start2-(a.start1+a.block1))<(b.start2-(b.start1+b.block1))){
                  return -1;
              }
            }

      });


  

  //console.log(this.radioDistribution);

  if(this.radioDistribution[0][0].checked==true){
    res=resDels.concat(resIns);  
  }else if(this.radioDistribution[0][1].checked==true){
    res=resDels;
  }else if(this.radioDistribution[0][2].checked==true){
    res=resIns;
  }

  
  this.tilingData=res;

  this.displayData=res;
  //console.log(this.tilingData);

  this.displayData = this.filterAndAggregate(_filterFunction);

  //console.log(this.tilingData);  

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
PrioVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};


    // TODO: implement...
 
    var that = this;
  //console.log(that.tilingData);
	//[{counts,type},{counts,type},...,}

    // TODO: ...update scales
   // updates scales


var MaxMin=d3.extent(that.displayData.map(function(d) { return d.start1; }));

var MAX=d3.max(that.displayData.map(function(d) { return d.start2+d.block2; }));
var MIN=d3.max(that.displayData.map(function(d) { return d.start1; }));

//console.log(that.displayData);

    this.x.domain(d3.extent(this.displayData.map(function(d) { return d.start1; }).concat(this.displayData.map(function(d) { return d.start2+d.block2; }))));
    this.y.domain(this.displayData.map(function(d) { 
      //console.log(d);
      return d.name; }));
    //this.color.domain(this.displayData.map(function(d) { return d.type }));

     // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    // updates graph

    // Data join
    this.svg.selectAll(".bar").remove();

    var bar = this.svg.selectAll(".bar")
      .data(this.displayData, function(d) { return d.name; });

    // Append new bar groups, if required
    var bar_enter = bar.enter().append("g");

    // Append a rect and a text only for the Enter set (new g)
    bar_enter.append("rect");
    // Add attributes (position) to all bars
    bar
      .attr("class", "bar")
      .transition()
      .attr("transform", function(d, i) { return "translate(0," + that.y(d.name) + ")"; })

    // Remove the extra bars
    bar.exit()
      .remove();


bar_enter.append("line");

 bar.selectAll("line")
      .attr("stroke", "black")
   .attr("stroke-width", 2)
    .attr("x1", function(d,i){
        return that.x(d.start1+d.block1);
      })
    .attr("y1", function(d,i) { return that.y.rangeBand() / 2; })
    .attr("x2", function(d,i){
        return that.x(d.start2);
      })
    .attr("y2", function(d,i) { return that.y.rangeBand() / 2; });
//block1
    bar.selectAll("rect")
      .attr("x", function(d,i){
        return that.x(d.start1);
      })
      .attr("y", 0)
      .attr("height", 3*this.y.rangeBand()/4)
      .attr("fill", function(d,i){
      //    console.log(d.type);
          if(d.type=="deletion"){
            return "green";
          }else{
            return "blue";
          }
      }
      )
      .transition()
      .attr("width", function(d, i) {
        //console.log(d.start2-(d.start1+d.block1));
          return that.x(d.start2+d.block2);
      });

bar_enter.append("circle");

 bar.selectAll("circle")
    .attr("stroke", "red")
    .attr("opacity",
    function(d,i){
        if(d.type=="deletion"){
          return 0;
        }else{
          return 1;
        }
    } )
    .attr("r", 2)
    .attr("stroke-width", 2)
    .attr("cx", function(d) {
      return that.x(d.start1+d.block1);
    })
    .attr("cy", function(d) {
      return that.y.rangeBand() / 2;
    })



//block2





    bar_enter.append("text")
      .text(function(d){
        var ss1=d.sequence.substring(d.query1,d.query1+d.block1);
        var ppd=d3.range(0,d.start2-(d.start1+d.block1)).map(function(d){return "-";}).join("");
        var ss2=d.sequence.substring(d.query2,d.start2+d.block2);
        var seqTot=ss1+ppd+ss2;
        console.log(this.svg);
        return seqTot;})
      .style("font-size", function(d) { 
        return that.width*0.0001/(MAX-MIN) + "px";
    })
      .attr("y", function(d,i) { 
        return that.y.rangeBand() / 2; 
      })
      .attr("x", function(d) { return that.x(d.start1); })
      .attr("dy", ".35em");
    







}


/**
 * Helper function that figures if there is sufficient space
 * to fit a label inside its bar in a bar chart
 */
PrioVis.prototype.doesLabelFit = function(datum, label) {
  var pixel_per_character = 6;  // obviously a (rough) approximation

  //return datum.type.length * pixel_per_character < this.x(datum.start1);
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */

var selectionStartV,selectionEndV;

PrioVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    selectionStartV=selectionStart;
    selectionEndV=selectionEnd;

    this.wrangleData(filterFunc);

    //console.log(this.displayData); 

    this.updateVis();


}

var radioA;

PrioVis.prototype.onRadioChange= function (_radioDistribution){

      radioA=_radioDistribution;
      //this.wrangleData(filterFunc);
      
      //this.updateVis();

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




/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
PrioVis.prototype.filterAndAggregate = function(_filter){




       if (_filter == null){
          return this.displayData;
        }else{
                  
          //debugger;

          return this.displayData.filter(function(d){
                  if((d.start1+d.block1)>=selectionStartV & (d.start2)<=selectionEndV){
                    return true;
                  }else{
                    return false;
                  }
                    });


            
        }




}




