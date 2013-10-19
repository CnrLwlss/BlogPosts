// Volume of liquid in a perfectly horizontal, cylindrical tank 
// of internal radius Rad & length Len filled up to height Ht
var volume = function (Rad,Len,Ht) {
	return((Math.PI*Rad*Rad*Len/2.0-Rad*Len*((Rad-Ht)*Math.sqrt(Ht*(2*Rad-Ht)/(Rad*Rad))+Rad*Math.asin(1.0-Ht/Rad))));
}

var R,L,m,w,h,scaleFactor,ntickX,ntickY,Hmax,Vmax,dh,dv,xdata,x,y,line,graph,xAxis,yAxisLeft,xGrid,yGrid,tx,ty,pointer,vText,hText,lastMove,arrowline, mousemove

// Function to update plot, to be called within a webpage, for example
drawPlot = function (R,L,scaleFactor){

	// Plot variables
	m = [75, 75, 75, 75];  // margins
	w = 600 - m[1] - m[3]; // width
	h = 600 - m[0] - m[2]; // height
	//scaleFactor = 0.5;  	// Only plot a fraction of whole curve
	ntickX = 10; // Number of ticks on x-axis
	ntickY = 10; // Number of ticks on y-axis

	Hmax = 2*R*scaleFactor;	// Maximum liquid height to be displayed on plot
	Vmax = volume(R,L,Hmax); 	// Maximum liquid volume to be displayed on plot

	dh = 0.01*Hmax;
	dv = 0.01*Vmax;

	// 100 points along the x-axis to give a smooth curve
	xdata = d3.range(0.0,Hmax,Hmax/100.0);

	// Scale x values to lie within 0-w (px)
	x = d3.scale.linear().domain([0, Hmax]).nice(ntickX).range([0, w]);
	// Scale y values lie within 0-w (px) (Note the inverted domain for the y-scale: bigger is up!)
	y = d3.scale.linear().domain([0, Vmax]).nice(ntickY).range([h, 0]);

	// Line function generates y coords from x coords and transforms to pixel units
	line = d3.svg.line()
		.x(function(h) {return x(h);})
		.y(function(h) {return y(volume(R,L,h));})
		.interpolate("basis");  // Smooth plotted lines (B-spline)

	// Add SVG element with the desired dimensions and margin.
	graph = d3.select("#graph").append("svg")
		.attr("width", w+m[1]+m[3])
		.attr("height", h+m[0]+m[2])
		.append("g")
		.attr("transform", "translate("+m[3]+","+m[0]+")");
		
	// x-grid
	xGrid = d3.svg.axis().scale(x).ticks(10).orient("bottom").tickSize(h, h, 0).tickSubdivide(true).tickFormat("");	
	graph.append("g")
		.attr("class","xgrid")
		.attr("transform", "translate(0,0)")
		.call(xGrid);
		
	// x-axis
	xAxis = d3.svg.axis().scale(x).ticks(10).orient("bottom").tickSize(10,5,0).tickSubdivide(true);
	graph.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(0,"+h+")")
		.call(xAxis);

	// x-axis label
	graph.append("text")
		.attr("class", "axlab")
		.attr("text-anchor", "middle")
		.attr("x", x(Hmax/2.0))
		.attr("y", y(-0.135*Vmax))
		.text("Depth (m)");

	// y-grid
	yGrid = d3.svg.axis().scale(y).ticks(10).orient("left").tickSize(-w, -w, 0).tickSubdivide(true).tickFormat("");
	graph.append("g")
		.attr("class","ygrid")
		.attr("transform", "translate(0,0)")
		.call(yGrid);
		
	// y-axis
	yAxisLeft = d3.svg.axis().scale(y).ticks(10).orient("left").tickSize(10,5,0).tickSubdivide(true);
	graph.append("g")
		.attr("class", "yaxis")
		.attr("transform", "translate(0,0)")
		.call(yAxisLeft);

	// y-axis label
	tx = x(-0.125*Hmax);
	ty = y(Vmax/2.0);
	graph.append("text")
		.attr("class", "axlab")
		.attr("text-anchor", "middle")
		.attr("x", tx)
		.attr("y", ty)
		.attr("transform", "rotate(-90,"+tx+","+ty+")") // Need to specify transform origin for rotation
		.text("Liquid volume (kL)");
		
	// Finally, plot curve (last so it's on top)
	graph.append("path")
		.attr("class", "curve")
		.attr("d", line(xdata));

	// Make new, dynamic object which responds to mouse moves
	pointer = graph.append("g")
		.attr("class", "pointer")
		.style("display", "none");

	// Draw arrow path
	pointer.append("path")
		.attr("class","arrow")

	// Draw text labels: liquid height and volume
	vText=graph.append("text")
		.attr("class", "arrowtext")
		.attr("text-anchor","left")
		.attr("x",x(dh))

	hText=graph.append("text")
		.attr("class", "arrowtext")
		.attr("text-anchor","left")
		.attr("y",y(dv))
		
	lastMove=0;
	mousemove = function () {
		//if ( lastMove && Date.now() - lastMove < 30 ) return;  // Reduce frequency with which line is drawn
		var hCurr = x.invert(d3.mouse(this)[0]);
		var vCurr = volume(R,L,hCurr);
		var pathpts = [{"x":hCurr,"y":0},{"x":hCurr,"y":vCurr},{"x":0,"y":vCurr}];  // Calculate path coords
		pointer.select("path").attr("d",arrowline(pathpts));	// Update arrow path
		vText.attr("y",y(vCurr+dv)).text(vCurr.toPrecision(3));
		hText.attr("x",x(hCurr+dh)).text(hCurr.toPrecision(3));  // Display current depth and volume on chart
		//lastMove = Date.now();
	}

	graph.append("rect")
		.attr("class", "overlay")
		.attr("width", w)
		.attr("height", h)
		.on("mouseover", function() { pointer.style("display", null); 
												vText.style("display", null);
												hText.style("display", null);})  // Display arrow & text
		.on("mouseout", function() { 	pointer.style("display", "none"); 
												vText.style("display", "none");
												hText.style("display", "none");}) // Hide arrow & text
		.on("mousemove", mousemove);  // Update arrow

	// Line function generates y coords from x coords and transforms to pixel units
	arrowline = d3.svg.line()
		.x(function(d) {return x(d.x);})
		.y(function(d) {return y(d.y);})
		.interpolate("linear");
}

transitionPlot = function (Rnew,Lnew,scaleFactornew){
	Hmax = 2*Rnew*scaleFactornew;	// Maximum liquid height to be displayed on plot
	Vmax = volume(Rnew,Lnew,Hmax); 	// Maximum liquid volume to be displayed on plot

	dh = 0.01*Hmax;
	dv = 0.01*Vmax;

	// 100 points along the x-axis to give a smooth curve
	xdata = d3.range(0.0,Hmax,Hmax/100.0);
	
	// Line function generates y coords from x coords and transforms to pixel units
	// Unnecessary redundancy, redefining function?  Possible to avoid this?
	line
		.x(function(h) {return x(h);})
		.y(function(h) {return y(volume(Rnew,Lnew,h));})
		.interpolate("basis");  // Smooth plotted lines (B-spline)

	// Scale x values to lie within 0-w (px)
	x.domain([0, Hmax]).nice(ntickX).range([0, w]);
	// Scale y values lie within 0-w (px) (Note the inverted domain for the y-scale: bigger is up!)
	y.domain([0, Vmax]).nice(ntickY).range([h, 0]);
	
	var t = graph.transition().duration(750);
	
	t.select(".xgrid") // change the x grid
		.call(xGrid);
	t.select(".ygrid") // change the y grid
		.call(yGrid)
	t.select(".xaxis") // change the x axis
      .call(xAxis);
   t.select(".yaxis") // change the y axis
      .call(yAxisLeft);	
	t.select(".curve") // change the data plotted
		.attr("d", line(xdata));
;
		
	mousemove = function () {
		//if ( lastMove && Date.now() - lastMove < 30 ) return;  // Reduce frequency with which line is drawn
		var hCurr = x.invert(d3.mouse(this)[0]);
		var vCurr = volume(Rnew,Lnew,hCurr);
		var pathpts = [{"x":hCurr,"y":0},{"x":hCurr,"y":vCurr},{"x":0,"y":vCurr}];  // Calculate path coords
		pointer.select("path").attr("d",arrowline(pathpts));	// Update arrow path
		vText.attr("y",y(vCurr+dv)).text(vCurr.toPrecision(3));
		hText.attr("x",x(hCurr+dh)).text(hCurr.toPrecision(3));  // Display current depth and volume on chart
		//lastMove = Date.now();
	}
	
	graph.select(".overlay")
		.on("mousemove",mousemove);
	
}