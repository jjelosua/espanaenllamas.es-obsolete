/*
 * Copyright (C) 2012 Juan Elosua Tomé <juan.elosua@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/************************FIRE CUSTOM OVERLAY LAYER************************************************/

//constructor function
function FireOverlay () {
  this.setMap(map);
}
	
FireOverlay.prototype = new google.maps.OverlayView();

//OnAdd function
FireOverlay.prototype.onAdd = function() {
  // Create the DIV and set some basic attributes.
  var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
              .attr("class", "fireLayer");
};

//draw function
FireOverlay.prototype.draw = function(force) {
  //The smallest the fire the higher the zIndex to be able to select every overlapping fire
  var ZINDEX_OFFSET = 201
  var projection = this.getProjection();
  
  //Math to obtain the appropiate radius
  var sw = map.getBounds().getSouthWest();
  var ne = map.getBounds().getNorthEast();
  var swProj = projection.fromLatLngToContainerPixel(sw);
  var neProj = projection.fromLatLngToContainerPixel(ne);
  var w = neProj.x-swProj.x;
  var h = swProj.y-neProj.y;
  var pxDiag = Math.sqrt((w*w) + (h*h));
  var mDiag = google.maps.geometry.spherical.computeDistanceBetween(ne,sw);
  var pxPerM = pxDiag/mDiag;
        
  var f = d3.select(".fireLayer").selectAll("svg")
          .data(d3.entries(fires))
          .each(refresh)
          .enter().append("svg:svg")
          .attr("class", "wrapper")
          .each(load);

  function load(d,i) {
    var zIndex = i+ZINDEX_OFFSET;
    var r = d.value.gRadio * pxPerM;
    var offset = ~~(r+1);
    fProj = projection.fromLatLngToDivPixel(d.value.gLatLng);
    var f = d3.select(this)
            .style("left", (fProj.x-offset) + "px")
            .style("top", (fProj.y-offset) + "px")
            .style("width", (2*offset) + "px")
            .style("height", (2*offset) + "px")
            .style("z-index",zIndex)
            .append("svg:circle")
            .attr("class", "fireCircle")
            .attr("r", r)
            .attr("cx", offset)
            .attr("cy", offset)
            .attr("fill", d.value.color)
            .on("mouseover", function (d, i) {return showTooltip(d)})
            .on("mouseout", function (d, i) {return hideTooltip(d)})
            .on("click", function (d, i) {return showCartela(d)});
    return f;
  }
    
  function refresh(d,i) {
    var zIndex = i+ZINDEX_OFFSET;
    var r = d.value.gRadio * pxPerM;
    var offset = ~~(r+1);
    fProj = projection.fromLatLngToDivPixel(d.value.gLatLng);
    var f = d3.select(this)
            .style("left", (fProj.x-offset) + "px")
            .style("top", (fProj.y-offset) + "px")
            .style("width", (2*offset) + "px")
            .style("height", (2*offset) + "px")
            .style("z-index",function (d) {return !d.value.visible ? -1 : zIndex;})
            .select(".fireCircle")
            .attr("r", r)
            .attr("cx", offset)
            .attr("cy", offset)
            .style("visibility",function (d) {if (d.value.visible) return "visible"; else return "hidden";})
    return f;
  }
}

//show function
FireOverlay.prototype.show = function() {
  d3.select(".fireLayer")
  .style("visibility","visible");
}

//hide function
FireOverlay.prototype.hide = function() {
  d3.select(".fireLayer")
  .style("visibility","hidden");
}