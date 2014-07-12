(function(root){
  var Drone = root.Drone = (root.Drone || {});





})(this);





try{
  var context = new webkitAudioContext(),
  _x,
  _y;
}
catch(err){
  alert('sorry! so so sorry!');
  alert('really just, gosh, wow, very sorry!');
}






var svg = d3.select("body").append("svg:svg");
function addCircle(x, y, z) {
  svg.append("svg:circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", function(){
      var r = 1e-6 + (y / 20);
      if (r < 1) {
        r = 1;
      }
      return r;
    })
    .style("stroke", ['red', 'yellow', 'green'][Math.floor(Math.random()*3)])
    .style("stroke-width", "10px")
    .style("fill", "none")
    .style("stroke-opacity", 1 - (1 - ( (500 - z) / 1000) ) )
    .transition()
    .duration(1000)
    .ease(Math.sqrt)
    .attr("r", function(){
      if (y < 1) {
        return 1;
      }
      return y;
    })
    .style("stroke-opacity", 1e-6)
    .remove();
}//is this really what d3 is like? NO THANK U








var synths = {};
var gainVal = 0.1;
var counter = 0;
var qval = 25;

var filterFloor = 200;
var filterCeil = 780;


function setupSynth(){
  var nodes={};
  nodes.source = context.createOscillator();
  nodes.source.type=1;
  nodes.source.frequency.value = [100, 150, 200, 250, 50][Math.floor(Math.random() * 5)];
  nodes.filter = context.createBiquadFilter();
  nodes.filter.Q.value = qval;
  nodes.volume = context.createGainNode();
  nodes.filter.type = 0; //0 is a low pass filter

  nodes.volume.gain.value = 0;
  nodes.source.connect(nodes.filter);
  nodes.filter.connect(nodes.volume);

  //frequency val
  nodes.filter.frequency.value = 400;
  nodes.volume.connect(context.destination);

  return nodes;
}


function setReverbImpulseResponse(url, convolver, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    convolver.buffer = context.createBuffer(request.response, false);
    callback();
  };
  request.send();
}

function updateNote(syn, pitch, variance){
  syn.filter.frequency.value = pitch + variance * Math.random();
  // syn.source.frequency.value = (((Math.random() * 2) - 1) * 0.1);
}






function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function getCoord(pointer) {
  return {
    x: window.innerWidth / 2 + 3 * pointer.tipPosition[0],
    y: window.innerHeight - 150 - pointer.tipPosition[1],
    z: 180 + pointer.tipPosition[2],
    id: pointer.id
  };
}







// SO should.include.keys(" ");
// make a theremin object that gets passed a frame.


$(document).ready(function() {
  Leap.loop(function(frame) {



          // can't remember how to avoid zombie objects
      // is this even a zombie object case?
    if (frame.pointables.length <= 0) {

      for (var synth in synths) {
        delete synths.synth;
      }
      synths.length = 0;
      synths = {};
    }


// silence all the synths
    for (var s in synths){
      synths[s].volume.gain.value = 0;
    }



    var onsynth = [];
    for (var i = 0; i < frame.pointables.length; i++) {
      var coord = getCoord(frame.pointables[i]);

      //adding d3 circle
      addCircle(coord.x, coord.y, coord.z);
      var freq = mapRange(coord.y, window.screen.availHeight, 0, filterFloor, filterCeil);
      //set up synth if it doesnt exist
      if (coord.id in synths) {

      } else {
        var n = setupSynth();
        n.source.noteOn(0);
        synths[coord.id] = n;
      }

      //update synth

      var syn = synths[coord.id];
      updateNote(syn, freq, 100);

      onsynth.push(coord.id);
    }



    //only play ones that are on
    for (var os in onsynth){
      synths[onsynth[os]].volume.gain.value = gainVal;
    }
  });
});

