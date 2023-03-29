var final_transcript = "";
var recognizing = false;
var ignore_onend;
var start_timestamp;
var bodyTag = document.getElementById("bodyTag");
var respondDiv = document.getElementById("chat-message-content-sys");
var commandDiv = document.getElementById("chat-message-content-user");
var chatBoxArea = document.getElementById("chat-history");
var startButtonElement = document.getElementById("Start_Button");
var startButtonElement2 = document.getElementById("primary");
var legendAnHoverDiv = document.getElementById("Legend-and-Hover");
var minZoomLevel = 6;
var mapDiv = document.getElementById("map");

var segments = [];
var colors = [];
var paintTemplate = [];
var layers = [];
var classes = [];
var pattern = [];
var mapOpacity = 1;//it can range between 0-1

function showAction2(responseText) {
  const chatSysmsg = `<div class="chat-message clearfix">
    <div id ="chat-message-content-sys" class="clearfix">
        <span class="chat-time-sys">${new Date().toLocaleTimeString()}</span>
        <h5>System</h5>
        ${responseText}
    </div>
</div>
<hr>`;
  chatBoxArea.innerHTML += chatSysmsg;
  chatBoxArea.scrollTop = chatBoxArea.scrollHeight - chatBoxArea.clientHeight;
}

function samanbahoosh(final_span, interim_span) {
  const charUsermsg = `<div class="chat-message clearfix">
    <div id="chat-message-content-user" class="clearfix">
        <span class="chat-time-user">${new Date().toLocaleTimeString()}</span>
        <h5>User</h5>
        <span id="final_span" class="final">${final_span}</span>
        <span id="interim_span" class="interim">${interim_span}</span>
    </div>
</div>
<hr>`;
  chatBoxArea.innerHTML += charUsermsg;
  chatBoxArea.scrollTop = chatBoxArea.scrollHeight - chatBoxArea.clientHeight;
}

//showing the options for changing the basemap
function showOptionBasemaps(Message,BasemapOptions) {
  let ResOptionsBasemap = `
    <div class="chat-message clearfix">
      <div id="chat-message-content-sys" class="clearfix">
        <span class="chat-time-sys">${new Date().toLocaleTimeString()}</span>
        <h5>System</h5>
        ${Message}</br>`;
  for (const BasemapOption of BasemapOptions) {
    ResOptionsBasemap += `<br><span class="options"><strong>${BasemapOption}</strong></span></br>`;
  }
  ResOptionsBasemap += `<br></div></div><hr>`;
  chatBoxArea.innerHTML += ResOptionsBasemap;
  chatBoxArea.scrollTop = chatBoxArea.scrollHeight - chatBoxArea.clientHeight;
}

//function for showing the color palette 
function makeColorPalletes(Message, pallets){
  let palletsList = ``;
  pallets.forEach((pallet, i)=>{
      let colors = ``;
      pallet.colors.forEach((color, i)=>{
          colors += `<span class="options" style="display: inline-block;width: 10px;height: 10px;background-color: ${color}"></span>&nbsp;`;
      })
      palletsList += `
      <div class="b-color-palettes__item">
          <span class="key-of-the-pallet"><strong>${pallet.name}</strong></span><br>
          ${colors}
      </div><br>`;
  })
  
 
  return chatBoxArea.innerHTML += `
  <div class="chat-message clearfix">
      <div id="chat-message-content-sys" class="clearfix">
      <span class="chat-time-sys">${new Date().toLocaleTimeString()}</span>
      <h5>System</h5>
      ${Message}
      <br>
      ${palletsList}
      <br>
      </div>
  </div>`;
  
  

}



var colorpalletsOpt = [
  {
      "name": "BStreams",
      "colors": [
        "rgb(26, 35, 126)",
        "rgb(48, 124, 16)",
        "rgb(232, 234, 246)",
        "rgb(175, 180, 43)",
        "rgb(240, 244, 195)",
        "rgb(240, 240, 241)",
        "rgb(196, 69, 23)"
      ]
  },
  {
      "name": "Hot and cold",
      "colors": [
        "rgb(49, 54, 149)",
        "rgb(90, 141, 192)",
        "rgb(201, 231, 239)",
        "rgb(254, 232, 157)",
        "rgb(243, 119, 72)",
        "rgb(227, 75, 52)",
        "rgb(165, 0, 38)"
      ]
  },
  {
      "name": "Nature",
      "colors": [
        "rgb(194, 163, 38)",
        "rgb(189, 198, 97)",
        "rgb(76, 83, 67)",
        "rgb(109, 112, 113)",
        "rgb(33, 139, 158)",
        "rgb(87, 130, 43)",
        "rgb(172, 210, 237)"
      ]
  },
  {
      "name": "Fruit juice",
      "colors": [
        "rgb(166, 206, 227)",
        "rgb(178, 223, 138)",
        "rgb(227, 26, 29)",
        "rgb(202, 178, 215)",
        "rgb(177, 89, 40)",
        "rgb(92, 107, 192)",
        "rgb(219, 122, 74)"
      ]
  }, 
  {
      "name": "Magma",
      "colors": [
        "rgb(233, 208, 34)",
        "rgb(233, 180, 30)",
        "rgb(232, 138, 25)",
        "rgb(231, 95, 20)",
        "rgb(231, 53, 14)",
        "rgb(230, 39, 13)",
        "rgb(230, 11, 9)"
      ]
  },
  {
      "name": "Red to acid green",
      "colors": [
        "rgb(86, 0, 0)",
        "rgb(102, 28, 9)",
        "rgb(126, 69, 23)",
        "rgb(151, 111, 37)",
        "rgb(175, 152, 50)",
        "rgb(183, 166, 55)",
        "rgb(199, 194, 64)"
      ]
  },
  {
      "name": "Ice cold",
      "colors": [
        "rgb(41, 85, 138)",
        "rgb(51, 98, 150)",
        "rgb(66, 118, 170)",
        "rgb(76, 132, 183)",
        "rgb(134, 169, 203)",
        "rgb(173, 194, 216)",
        "rgb(213, 219, 230)"
      ]
  
  }
]

function showPopUp(Title, subTitle) {
  const popup = `<div class="map-overlay" id="features">
    <h2>${Title}</h2>
    <div id="pd">
        <p>${subTitle}</p>
    </div>
</div>`;
  legendAnHoverDiv.innerHTML += popup;
}

function RemovePopup (){
  let popup = document.getElementById("features");
  legendAnHoverDiv.removeChild(popup);
}

//defining the variables as global variable 


function addLegend() {
  const leggend = `<div class="map-overlay" id="legend" style="left:25px;"></div>`;

  // map.on("mousemove", (event) => {
  //   const states = map.queryRenderedFeatures(event.point, {
  //     layers: ["maine"],
  //   });
  //   console.log(states);
  //   document.getElementById("pd").innerHTML = states.length
  //     ? `<h3>${states[0].properties.reg_name_LOCAL}</h3><p><strong>had<em>${states[0].properties.total_case}</strong>total case of covide till 18/11/2022.</em></p>`
  //     : `<p>Hover over a province!</p>`;
  //   let PopUpDiv = document.getElementById("features");
  //   PopUpDiv.scrollTop = PopUpDiv.scrollHeight - PopUpDiv.clientHeight;
  // });
  legendAnHoverDiv.innerHTML += leggend;
  
}

// 



function RemoveLeggend() {
  let leggend = document.getElementById("legend")
  legendAnHoverDiv.removeChild(leggend);
}

function URLStyle(StyleLayers) {
  var style2 = "mapbox://styles/mapbox/" + StyleLayers;
  return style2;
}

//defining the palettes 
const BstreamsPalette  = [
  "rgb(26, 35, 126)",
  "rgb(92, 107, 192)",
  "rgb(48, 124, 16)",
  "rgb(159, 168, 219)",
  "rgb(103, 176, 61)",
  "rgb(197, 202, 233)",
  "rgb(232, 234, 246)",
  "rgb(130, 119, 23)",
  "rgb(175, 180, 43)",
  "rgb(212, 225, 87)",
  "rgb(240, 244, 195)",
  "rgb(188, 189, 193)",
  "rgb(240, 240, 241)",
  "rgb(58, 60, 72)",
  "rgb(196, 69, 23)"
];

const HotandColdPalette = [
  "rgb(49, 54, 149)",
  "rgb(65, 99, 171)",
  "rgb(90, 141, 192)",
  "rgb(125, 178, 212)",
  "rgb(162, 209, 229)",
  "rgb(201, 231, 239)",
  "rgb(231, 245, 227)",
  "rgb(250, 248, 193)",
  "rgb(254, 232, 157)",
  "rgb(253, 202, 124)",
  "rgb(251, 163, 94)",
  "rgb(243, 119, 72)",
  "rgb(227, 75, 52)",
  "rgb(199, 35, 40)",
  "rgb(165, 0, 38)"
];

const NaturePalette = [
  "rgb(194, 163, 38)",
  "rgb(225, 226, 137)",
  "rgb(189, 198, 97)",
  "rgb(187, 141, 133)",
  "rgb(185, 85, 67)",
  "rgb(76, 83, 67)",
  "rgb(73, 118, 181)",
  "rgb(24, 99, 35)",
  "rgb(109, 112, 113)",
  "rgb(71, 126, 136)",
  "rgb(33, 139, 158)",
  "rgb(190, 104, 38)",
  "rgb(87, 130, 43)",
  "rgb(153, 170, 56)",
  "rgb(172, 210, 237)"
]

const FruitJuicePalette = [
  "rgb(166, 206, 227)",
  "rgb(31, 120, 181)",
  "rgb(178, 223, 138)",
  "rgb(51, 160, 45)",
  "rgb(251, 154, 153)",
  "rgb(227, 26, 29)",
  "rgb(254, 191, 111)",
  "rgb(255, 127, 0)",
  "rgb(202, 178, 215)",
  "rgb(106, 62, 154)",
  "rgb(255, 255, 154)",
  "rgb(177, 89, 40)",
  "rgb(92, 107, 192)",
  "rgb(103, 176, 61)",
  "rgb(219, 122, 74)"
]

const CinderelaPalette = [
  "rgb(82, 1, 47)",
  "rgb(112, 1, 65)",
  "rgb(142, 1, 82)",
  "rgb(197, 27, 125)",
  "rgb(222, 119, 175)",
  "rgb(241, 182, 218)",
  "rgb(253, 224, 240)",
  "rgb(237, 237, 237)",
  "rgb(231, 246, 208)",
  "rgb(184, 225, 134)",
  "rgb(127, 188, 65)",
  "rgb(78, 146, 34)",
  "rgb(39, 100, 25)",
  "rgb(29, 74, 18)",
  "rgb(19, 48, 12)"

]

const RedToAcidGreenPalette = [
  "rgb(86, 0, 0)",
  "rgb(94, 14, 5)",
  "rgb(102, 28, 9)",
  "rgb(110, 42, 14)",
  "rgb(118, 55, 18)",
  "rgb(126, 69, 23)",
  "rgb(134, 83, 27)",
  "rgb(143, 97, 32)",
  "rgb(151, 111, 37)",
  "rgb(159, 125, 41)",
  "rgb(167, 139, 46)",
  "rgb(175, 152, 50)",
  "rgb(183, 166, 55)",
  "rgb(191, 180, 59)",
  "rgb(199, 194, 64)"
]

const MagmaPalette = [
  "rgb(233, 208, 34)",
  "rgb(233, 194, 32)",
  "rgb(233, 180, 30)",
  "rgb(232, 166, 29)",
  "rgb(232, 152, 27)",
  "rgb(232, 138, 25)",
  "rgb(232, 124, 23)",
  "rgb(232, 110, 22)",
  "rgb(231, 95, 20)",
  "rgb(231, 81, 18)",
  "rgb(231, 67, 16)",
  "rgb(231, 53, 14)",
  "rgb(230, 39, 13)",
  "rgb(230, 25, 11)",
  "rgb(230, 11, 9)"

]

const IceCold = [
  "rgb(41, 85, 138)",
  "rgb(46, 91, 144)",
  "rgb(51, 98, 150)",
  "rgb(56, 105, 157)",
  "rgb(61, 111, 163)",
  "rgb(66, 118, 170)",
  "rgb(71, 125, 176)",
  "rgb(76, 132, 183)",
  "rgb(95, 144, 189)",
  "rgb(115, 156, 196)",
  "rgb(134, 169, 203)",
  "rgb(154, 181, 209)",
  "rgb(173, 194, 216)",
  "rgb(193, 206, 223)",
  "rgb(213, 219, 230)"

]



//generate the color pallete
// var colors = [];
function generatePalette(palette, steps, shuffleColors) {
  const numColors = palette.length;
  const incr = numColors / steps
  
  if (shuffleColors) {
    colors[0] = palette[Math.floor(incr/2)]
    let sum = incr/2;
    sum += incr;
    let i=0;
    while (sum < numColors) {
      colors[++i] = palette[Math.floor(sum)]
      sum += incr
    }
  } else {
    colors = palette.slice(0,steps);
  }
  return colors
}



const shuffleColors = false;
//intialize data for testing
var dataset = [
  44325, 201510, 65726, 58328, 146124, 75621, 267636, 215108, 132947, 201260,
  135868, 95507, 154658, 130433, 95125, 96918, 308497, 488099, 146907, 91492,
  70251, 360637, 402354, 102093, 171293, 237950, 174452, 130380, 57328, 47808,
  78037, 143765, 199755, 182757, 59188, 83550, 81616, 24765, 89320, 122849,
  232598, 321300, 118938, 136250, 84615, 162096, 132485, 167611, 76421, 64738,
  243128, 294454, 348530, 123614, 63322, 52531, 485779, 396211, 166319, 210454,
  298688, 127365, 142126, 102852, 174706, 117584, 129861, 123057, 99282, 117036,
  188070, 230248, 64549, 178748, 108175, 437372, 127734, 96637, 107803, 152680,
  66078, 208053, 142865, 93486, 129902, 12755, 448899, 110954, 228941, 349046,
  59358, 440541, 50939, 439847, 100705, 495217, 1234196, 453083, 405160, 319826,
  1242300, 1630773, 859887, 95626, 139703, 198507, 419158,
];
dataset.sort(function(a,b){
  return a-b;
})
// console.log(dataset)
// let newpalette = generatePalette(HotandColdPalette,7,shuffleColors);
// console.log("56565",newpalette);

function createSegments (palette,steps,data,method,shuffleColors) {
  var colors = generatePalette(palette,steps, shuffleColors)
  let limits
  switch (method) {
    case "quantile": {
      const quantile = d3.scaleQuantile()
				.domain(data)
				.range(colors)
			limits = quantile.quantiles()
      console.log("i got the values")
			break;
    }
    case "logarithmic": {
			colors = []
			const range = 2.83 / steps	
			for (let i=range; i<=2.8301; i+=range) {
				let v = Math.floor(Math.E ** i) - 1
				if (v > 14) v = 14
				colors.push(palette[v])
			}
			//this.logg && console.log('COLORS',colors)
			const quantize = d3.scaleQuantize()
				.domain(d3.extent(data))
				.range(colors)
				.nice()
			limits = quantize.thresholds()
			break;
		}
    default: {
			const quantize = d3.scaleQuantize()
				.domain(d3.extent(data))
				.range(colors)
				.nice()
			limits = quantize.thresholds()
			//console.log('LIMITS',limits)
		}
  }
  limits = [0 , ...limits.map(el => Math.floor(el))]
	
	for (let i=0; i<steps; i++) {
		const item = {
      from: limits[i],
			to: limits[i+1],
			color: colors[i],
			// label: '',
		}
		segments.push(item)
	}
  console.log(segments)
  console.log("im a mess in variables",colors)
  console.log(limits)
	//this.logg && console.log('segments',JSON.parse(JSON.stringify(segments)))
	console.log("man injam", colors)
  return segments
}
//calling the function for testing









var outdoor = "outdoors-v12";
var streets = "streets-v12";
var light = "light-v11";
var dark = "dark-v11";
var satellite = "satellite-v9";
var streetSatellite = "satellite-streets-v12";
var navigationDay = "navigation-day-v1";
var navigationNight = "navigation-night-v1";

//break the text in the recived text from the user
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, "<p></p>").replace(one_line, "<br>");
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function (m) {
    return m.toUpperCase();
  });
}

if (!("webkitSpeechRecognition" in window)) {
  upgrade();
} else {
  try {
    var recognition = new webkitSpeechRecognition();
  } catch (e) {
    var recognition = Object;
    console.log(e);
  }

  // Start_Button.style.display = 'inline-block';
  primary.style.display = "inline-bock";
  recognition.continuous = true;
  recognition.interimResults = true;

  //initilizing the starting function for speech recognition
  recognition.onstart = function () {
    recognizing = true;
    bodyTag.classList.add("recognizing"); //adding the html class
    startButtonElement2.innerHTML = "Listening"; //change the text of the button
  };
  //initilizing the error function for speech recognition
  recognition.onerror = function (event) {
    if (event.error == "no-speech") {
      bodyTag.classList.add("info_no_speech"); //adding the html class for further action on button
      ignore_onend = true;
    }
    if (event.error == "audio-capture") {
      bodyTag.classList.add("info_no_microphone");
      ignore_onend = true;
    }

    if (event.error == "not-allowed") {
      if (event.timeStamp - start_timestamp < 100) {
        //if the application didnt recieve any voice
        bodyTag.classList.add("info_blocked"); //the application changed the style of the button
        console.log(event.start_timestamp);
        console.log(event.timeStamp);
      } else {
        bodyTag.classList.add("info_denied"); //to defined classes
      }
      ignore_onend = true;
    }
  };

  //intilizing the ending function for speech recognition
  recognition.onend = function () {
    recognizing = false;
    bodyTag.classList.remove("recognizing");
    startButtonElement2.innerHTML = "Activate Voice";
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
  };

  recognition.onresult = function (event) {
    var interim_transcript = "";

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      //A boolean value that states whether this result is final (true)
      //or not (false) — if so, then this is the final time this result will be returned;
      //if not, then this result is an interim result, and may be updated later on

      if (event.results[i].isFinal) {
        //Each time a snippet of text is found, interprets it into a map command
        final_transcript = event.results[i][0].transcript; //+= event.resultrs[i][0].transcript
        console.log(event.results[i][0].transcript);
        samanbahoosh(
          linebreak(final_transcript),
          linebreak(interim_transcript)
        );
        interpret(event.results[i][0].transcript);
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    //chnage the style of the interpreted command that processed by the application
    final_transcript = capitalize(final_transcript);
    // final_span.innerHTML = linebreak(final_transcript);
    // interim_span.innerHTML = linebreak(interim_transcript);

    if (final_transcript || interim_transcript) {
    }
  };
}

function startButton2(event) {
  if (recognizing) {
    recognition.stop();
    showAction2("Listening is resume, click on the button to restart");
    return;
  }
  final_transcript = "";
  recognition.lang = ["en-US", "it-IT", "Italia"];
  console.log(recognition);
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = "";
  interim_span.innerHTML = "";
  start_timestamp = event.timeStamp;
}

//the main function of the voice commands
function interpret(snippet) {
  snippet = snippet.toLowerCase().trim();

  if (
    snippet.search(/help/i) >= 0 ||
    snippet.search(/instructions/i) >= 0 ||
    snippet.search(/commands/i) >= 0
  ) {
    //showActionPermanently('Find Lake como, search for politecnico di Milano, zoom to 25%, zoom right in, fly down, fly up, move out, closer, further away, north, help, instructions, commands');
    showAction2(
      "Find lake como,fly dow, search for politecnico di Milano, Fly to Venice, as close as possible, as far as you can, move left, go south, east, further away, commands"
    );
  }

  if (
    snippet.search(/move/i) >= 0 ||
    snippet.search(/pan/i) >= 0 ||
    snippet.search(/go/i) >= 0
  ) {
    console.log("detected panning action in [" + snippet.search(/north/i));
    if (snippet.search(/north/i) >= 0 || snippet.search(/up/i) >= 0) {
      //showAction('Moving north');
      showAction2("Moving north");
      map.panBy([0, -getViewportHeightScroll()], { speed: 1 });
    }
    if (snippet.search(/south/i) >= 0 || snippet.search(/down/i) >= 0) {
      //showAction('Moving south');
      showAction2("Moving south");
      map.panBy([0, getViewportHeightScroll()], { speed: 1 });
    }
    if (snippet.search(/east/i) >= 0 || snippet.search(/right/i) >= 0) {
      //showAction('Moving east');
      showAction2("Moving east");
      map.panBy([getViewportWidthScroll(), 0], { speed: 1 });
    }
    if (snippet.search(/west/i) >= 0 || snippet.search(/left/i) >= 0) {
      //showAction('Moving west');
      showAction2("Moving west");
      map.panBy([-getViewportWidthScroll(), 0], { speed: 1 });
    }
  } else {
    if (snippet == "north" || snippet == "up") {
      //showAction('Moving north');
      showAction2("Moving north");
      map.panBy([0, -getViewportHeightScroll()], { speed: 1 });
    }

    if (snippet == "south" || snippet == "down") {
      //showAction('Moving south');
      showAction2("Moving south");
      map.panBy([0, getViewportHeightScroll()], { speed: 1 });
    }

    if (snippet == "east" || snippet == "right") {
      //showAction('Moving east');
      showAction2("Moving east");
      map.panBy([getViewportWidthScroll(), 0], { speed: 1 });
    }

    if (snippet == "west" || snippet == "left") {
      //showAction('Moving west');
      showAction2("Moving west");

      map.panBy([-getViewportWidthScroll(), 0], { speed: 1 });
    }
  }

  if (snippet.search(/covid map/i) >= 0) {
    showAction2("the covid map of Italy's province is shown");
    map.setStyle(style2);
    map = new mapboxgl.Map({
      container: "map", // container ID
      style: style2, // style URL
      center: [12.5674, 41.8719], // starting position [lng, lat]
      zoom: 5, // starting zoom
      projection: "globe", // display the map as a 3D globe
      // transformRequest: (url) => {
      //   return {
      //     url: url +"&srs=3857",
      //   };
      // },
    });
    map.addControl(geocoder);
    
    segments =[];

    createSegments(FruitJuicePalette,7,dataset,"logarithmic",shuffleColors);
    console.log("segments are here 5555",segments)
    paintTemplate = [ "interpolate",
    ["linear"],
    ["get", "total_case"],];
    for (const segment of segments) {
      paintTemplate.push(segment.from);
      paintTemplate.push(segment.color);
    }
    console.log(paintTemplate)
    pattern = [];
    for (const segment of segments){
      pattern.push(segment.color)
    }
    
    classes = [];
    for (const segment of segments) {
      classes.push(segment.from+" _ "+segment.to)
       
    }
    console.log("classes are here...",classes)
    
    loadCovidMap(paintTemplate,mapOpacity);
    

    // let title = "The total case of covid per province";
    // let subtitle = "Hover over a province to see the total case of covid";
    // showPopUp(title, subtitle);
    
    addLegend();

    //Initialize the steps
    layers = classes ;

    //Initialize the colors
    colors = pattern;

    // create legend
    const legend = document.getElementById("legend");

    layers.forEach((layer, i) => {
      const color = colors[i];
      const item = document.createElement("div");
      const key = document.createElement("span");
      key.className = "legend-key";
      key.style.backgroundColor = color;

      const value = document.createElement("span");
      value.innerHTML = `${layer}`;
      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    });

    //B streams

    //add information on the popup
  }
  
  if (snippet.search(/reduce the opacity of the map/i) >=0 ){
    if (map.getLayer("graduatedCovidMapIT") && map.getLayer("outline")){
      mapOpacity = 0.5;
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);
      ReLoadCovidMap(paintTemplate,mapOpacity);
      console.log(paintTemplate)
      console.log(mapOpacity)
      showAction2("The map opacity reduced!");
      
    }

  }
  if(snippet.search(/increase the opacity of the map/i) >=0 ) {
    if (map.getLayer("graduatedCovidMapIT") && map.getLayer("outline")){
      mapOpacity = 1;
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);
      ReLoadCovidMap(paintTemplate, mapOpacity);
      showAction2("The map opacity increased!");
      
    }

  }
  if (snippet.search(/remove color map/i)  >=0 ){

    map.off("load", '');
    // map.setLayoutProperty('graduatedCovidMapIT', 'visibility', 'none')
    map.removeLayer("graduatedCovidMapIT");
    map.removeLayer("outline");
    map.removeSource("maine");
    RemoveLeggend();
    RemovePopup();
    segments = [];
    colors = [];
    paintTemplate = [];
    layers = [];
    classes = [];
    pattern = [];


    // map = new mapboxgl.Map({
    //   container: "map", // container ID
    //   style: style2, // style URL
    //   center: [12.5674, 41.8719], // starting position [lng, lat]
    //   zoom: 5, // starting zoom
    //   projection: "globe", // display the map as a 3D globe
    //   // transformRequest: (url) => {
    //   //   return {
    //   //     url: url +"&srs=3857",
    //   //   };
    //   // },
    // });
    
    showAction2("The covid map of italy removed!")

  } 
  if (snippet.search(/change the color palette/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT")) {
      PaletteMessage = "The color palettes are:";
      makeColorPalletes(PaletteMessage, colorpalletsOpt);
      chatBoxArea.scrollTop = chatBoxArea.scrollHeight - chatBoxArea.clientHeight;
    }
  }
  if (
    snippet.search(/change the color palette to red to magma/i) >= 0 ||
    snippet.search(/magma/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Magma");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(MagmaPalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      // map.setPaintProperty("graduatedCovidMapIT", 'fill-color', paintTemplate);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/change the color palette to red to B streams/i) >= 0 ||
    snippet.search(/B streams/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to BStreams");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(BstreamsPalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/change the color palette to red to ice cold/i) >= 0 ||
    snippet.search(/ice cold/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Ice cold");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(IceCold,7, dataset, "logarithmic", shuffleColors);classes
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/change the color palette to red to acid green/i) >= 0 ||
    snippet.search(/red to acid green/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Red to acid");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(RedToAcidGreenPalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/change the color palette to fruit juice/i) >= 0 ||
    snippet.search(/fruit juice/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Fruit juice");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(FruitJuicePalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/change the color palette to nature/i) >= 0 ||
    snippet.search(/nature/i) >= 0 
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Nature");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(NaturePalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);
  

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;
        
        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/Change the color palette to hot and cold/i) >= 0 ||
    snippet.search(/hot and cold/i) >= 0 ||
    snippet.search(/hot N cold/i) >= 0
  ) {
    if (map.getLayer("graduatedCovidMapIT")) {
      showAction2("The color palette changed to Hot and cold");
      map.setStyle(style2);
      map = new mapboxgl.Map({
        container: "map", // container ID
        style: style2, // style URL
        center: [12.5674, 41.8719], // starting position [lng, lat]
        zoom: 5, // starting zoom
        projection: "globe", // display the map as a 3D globe
        // transformRequest: (url) => {
        //   return {
        //     url: url +"&srs=3857",
        //   };
        // },
      });
      map.addControl(geocoder);

      segments = [];

      createSegments(HotandColdPalette,7, dataset, "logarithmic", shuffleColors);
      paintTemplate = [
        "interpolate",
        ["exponential", 1],
        ["get", "total_case"],
      ];
      for (const segment of segments) {
        paintTemplate.push(segment.from);
        paintTemplate.push(segment.color);
      }
      console.log(paintTemplate);
      pattern = [];
      for (const segment of segments) {
        pattern.push(segment.color);
      }

      classes = [];
      for (const segment of segments) {
        classes.push(segment.from + " _ " + segment.to);
      }
      console.log("classes are here...", classes);

      ReLoadCovidMap(paintTemplate, mapOpacity);
      if (document.getElementById("legend")) {
        RemoveLeggend();
        
        //Initialize the steps
        layers = classes;

        //Initialize the colors
        colors = pattern;

        addLegend();
        // create legend
        legend = document.getElementById("legend");

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement("div");
          const key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          const value = document.createElement("span");
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
      }
    }
  }
  if (
    snippet.search(/hide legend/i) >=0 || 
    snippet.search(/hide the legend/i) >= 0 || 
    snippet.search(/remove the legend/i) >= 0
  ) {
    RemoveLeggend()
    showAction2("the legend removed!")
  }
  if (
    snippet.search(/show legend/i) >= 0 
  ){
    
    showAction2("The legend showed.");
    addLegend();
    let pattern = [];
    for (const segment of segments) {
      pattern.push(segment.color);
    }

    let classes = [];
    for (const segment of segments) {
      classes.push(segment.from + " _ " + segment.to);
    }
    console.log("classes are here...", classes);
    
   


    //Initialize the steps
    let layers = classes ;

    //Initialize the colors
    let colors = pattern;
    
    console.log(segments)
    console.log(layers)
    console.log(colors)
    console.log(classes)
    console.log(pattern)
 

    // create legend
    legend = document.getElementById("legend");

    layers.forEach((layer, i) => {
      const color = colors[i];
      const item = document.createElement("div");
      const key = document.createElement("span");
      key.className = "legend-key";
      key.style.backgroundColor = color;

      const value = document.createElement("span");
      value.innerHTML = `${layer}`;
      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    });
  }
  //orders for the position of the legend 
  if (
    snippet.search(/change the position of the legend/i) >=0 ||
    snippet.search(/change the place of the legend/i) >=0  
  ) {
    if (document.getElementById("legend")) {
      
      let leggendPositions = ["Bottom left", "Bottom right", "Top left", "Top right"];
      let messageLegend = "The position of the legend can be:"
      console.log("man run shoodam...", leggendPositions);
      showOptionBasemaps(messageLegend, leggendPositions);
      
    }
    
  }
  //change the position of the legend to the bottom left 
  if (snippet.search(/bottom left/i) >= 0) {
    if (document.getElementById("legend")) {
      let pos00 = document.getElementById("legend");
      pos00.style.removeProperty("right");
      pos00.style.removeProperty("top");
      pos00.style.cssText += "left:25px;bottom:0;";
    }
  }
  //change the position of the legend to the up left 
  if (snippet.search(/top left/i) >= 0) {
    if (document.getElementById("legend")) {
      let pos02 = document.getElementById("legend");
      console.log(pos02);
      pos02.style.removeProperty("left");
      pos02.style.removeProperty("bottom");
      pos02.style.cssText += "left:25px!important;top:80px;!important;position:fixed!important;";
    }
  }
  //change the position of the legend to the up right 
  if (snippet.search(/top right/i) >= 0) {
    if (document.getElementById("legend")) {
      let pos02 = document.getElementById("legend");
      console.log("helloooooo555",pos02);
      pos02.style.removeProperty('left')
      pos02.style.cssText += `right:0!important;top:80px!important;left:""!important;`;
      pos02.style.cssText +="position:fixed!important;"
    }
  }
  if (
    snippet.search(/change the style of the map/i) >= 0 ||
    snippet.search(/change the base map/i) >= 0 ||
    snippet.search(/modify the base map/i) >= 0
  ) {
    let baseMapOptions = [
      "Streets",
      "Outdoors",
      "Light",
      "Dark",
      "Satellite",
      "Satellite streets",
      "Navigation day",
      "Navigation night",
    ];
    let messageBaseMap = "Please select one of the options bellow:"
    showOptionBasemaps(messageBaseMap,baseMapOptions);
  }

  if (snippet.search(/streets/i) >= 0 || snippet.search(/street/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      map.setLayoutProperty('graduatedCovidMapIT', 'visibility','visible')
      map.setLayoutProperty('outline', 'visibility','visible')
    }
    //  else {
    //   map.removeLayer("graduatedCovidMapIT");
    //   map.removeLayer("outline");
    //   map.removeSource("maine");
    //   RemoveLeggend();
    //   RemovePopup();
    // }
    style2 = URLStyle(streets);
    map.setStyle(style2);
    showAction2("The base map changed to Street style");
    
  }

  if (snippet.search(/outdoors/i) >= 0 || snippet.search(/outdoor/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      map.setLayoutProperty('graduatedCovidMapIT', 'visibility','visible')
      map.setLayoutProperty('outline', 'visibility','visible')
    } 
    
    style2 = URLStyle(outdoor);
    map.setStyle(style2);
    showAction2("The base map changed to Outdoor style");
  }

  if (snippet.search(/light/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(light);
    map.setStyle(style2);
    showAction2("The base map changed to Light style");
  
  }

  if (snippet.search(/dark/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
     ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(dark);
    map.setStyle(style2);
    showAction2("The base map changed to Dark style");
   
  }
  

  if (snippet.search(/satellite/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(satellite);
    map.setStyle(style2);
    showAction2("The base map changed to satellite style");
  }
  

  if (
    snippet.search(/satellite streets/i) >= 0 ||
    snippet.search(/satellite street/i) >= 0
  ) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(streetSatellite);
    map.setStyle(style2);
    showAction2("The base map changed to satellite streets style");
  }

  if (snippet.search(/navigation day/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(navigationDay);
    map.setStyle(style2);
    showAction2("The base map changed to Navigation day style");
  }

  if (snippet.search(/navigation night/i) >= 0) {
    if (map.getLayer("graduatedCovidMapIT") || map.getLayer("outline") || map.getSource("maine")) {
      ReLoadCovidMap(paintTemplate, mapOpacity);
    }
    style2 = URLStyle(navigationNight);
    map.setStyle(style2);
    showAction2("The base map changed to Navigation night style");
  }

  if (
    snippet.search(/zoom in/i) >= 0 ||
    snippet.search(/closer/i) >= 0 ||
    snippet.search(/fly down/i) >= 0 ||
    snippet.search(/move in/i) >= 0
  ) {
    //showAction('Zooming in');
    showAction2("Zooming in");
    map.flyTo({
      zoom: map.getZoom() + 2,
      speed: 1,
    });
  }

  if (
    snippet.search(/zoom out/i) >= 0 ||
    snippet.search(/further away/i) >= 0 ||
    snippet.search(/fly up/i) >= 0 ||
    snippet.search(/move out/i) >= 0
  ) {
    //showAction('Zooming out');
    showAction2("Zooming out");
 


    map.flyTo({
      zoom: map.getZoom() - 2,
      speed: 1,
    });
  }

  if (
    snippet.search(/right in/i) >= 0 ||
    snippet.search(/in close/i) >= 0 ||
    snippet.search(/right down/i) >= 0 ||
    snippet.search(/very close/i) >= 0 ||
    snippet.search(/up close/i) >= 0 ||
    snippet.search(/close up/i) >= 0 ||
    snippet.search(/close as you can/i) >= 0 ||
    snippet.search(/close as possible/i) >= 0
  ) {
    //showAction('Zooming right in');
    showAction2("Zooming right in");

    map.flyTo({
      zoom: 17,
      speed: 1,
    });
  }

  if (
    snippet.search(/right out/i) >= 0 ||
    snippet.search(/far out/i) >= 0 ||
    snippet.search(/far away/i) >= 0 ||
    snippet.search(/far as you can/i) >= 0 ||
    snippet.search(/far as possible/i) >= 0
  ) {
    //showAction('Zooming right out');
    showAction2("Zooming right out");
    map.flyTo({
      zoom: 5,
      speed: 1,
    });
  }

  if (snippet.search(/zoom to/i) >= 0) {
    var trimStartPos = snippet.search(/zoom to/i) + "zoom to".length;
    var trimEndPos = snippet.search(/%/i);
    var searchTerm = snippet.substring(trimStartPos, trimEndPos).trim();

    searchTerm = parseInt(searchTerm, 10);
    if (searchTerm) {
      var searchTermZoomAmount = (22 - 4) * (searchTerm / 100);
      //showAction('Zooming to ' + (searchTerm) + '%');
      showAction2("Zooming to " + searchTerm + "%");
      map.zoomTo(searchTermZoomAmount);
    } else {
      //showAction('Try saying "Zoom to 75%');
      showAction2('Try saying "Zoom to 75%');
    }
  }

  if (
    snippet.search(/go to/i) >= 0 ||
    snippet.search(/fly to/i) >= 0 ||
    snippet.search(/find/i) >= 0 ||
    snippet.search(/search for/i) >= 0
  ) {
    if (snippet.search(/go to/i) >= 0) {
      var trimStartPos = snippet.search(/go to/i) + "go to".length;
    }

    if (snippet.search(/fly to/i) >= 0) {
      var trimStartPos = snippet.search(/fly to/i) + "fly to".length;
    }

    if (snippet.search(/find/i) >= 0) {
      var trimStartPos = snippet.search(/find/i) + "find".length;
    }
    if (snippet.search(/search for/i) >= 0) {
      var trimStartPos = snippet.search(/search for/i) + "search for".length;
    }

    const searchTerm = snippet.substring(trimStartPos).trim(); //intialize the geocoding field

    showAction2("Finding " + searchTerm + "");

    const searchBox = document.getElementsByClassName(
      "mapboxgl-ctrl-geocoder--input"
    )[0];
    var zoomTo = 11;
    if (map.getZoom() > 11) {
      zoomTo = map.getZoom();
    }

    geocoder.query(searchTerm);

    console.log("**********");
  }
}
function getViewportWidthScroll() {
  return window.innerWidth * 0.75;
}
function getViewportHeightScroll() {
  return window.innerHeight * 0.75;
}

//add the encodded location and get  the header
function getJSONP(url, success) {
  var ud = "_" + +new Date(),
    script = document.createElement("script"),
    head = document.getElementsByTagName("head")[0] || document.documentElement;

  window[ud] = function (data) {
    head.removeChild(script);
    success && success(data);
  };

  script.src = url.replace("callback=?", "callback=" + ud);
  head.appendChild(script);
}

var style2 = URLStyle(outdoor);
//intialize base map from mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9tZXlyYW1haG1vdWRpIiwiYSI6ImNsOXBxN3h5MzB2dW0zb3M1bjA1M2c3cTAifQ.c74-2h9mTcQ__zI22yMGgg";
let map = new mapboxgl.Map({
  container: "map", // container ID
  style: style2, // style URL
  center: [12.5674, 41.8719], // starting position [lng, lat]
  zoom: 5, // starting zoomon
  //projection: 'globe', // display the map as a 3D globe
  transformRequest: (url) => {
    return {
      url: url + "&srs=3857",
    };
  },
});

//defining the function for the covid map
function loadCovidMap(x,y) {
  map.once("load", () => {
    map.addSource("maine", {
      type: "geojson",
      data: "https://ceit92.ir/Province-italy-covid.geojson",
      
    });

    map ? document.getElementById("map").replaceWith(map.getContainer()) : "";

    // Add a new layer to visualize the polygon.
    map.addLayer({
      id: "graduatedCovidMapIT",
      type: "fill",
      source: "maine", // reference the data source
      layout: {},
      paint: {
        "fill-color": x, // blue color fill
        "fill-opacity":y,
      },
    });
    // Add a black outline around the polygon.
    map.addLayer({
      id: "outline",
      type: "line",
      source: "maine",
      layout: {},
      paint: {
        "line-color": "#000",
        "line-width": 1,
      },
    });
    console.log("man loadam");
  });
}

function ReLoadCovidMap(m,n) {
  map.once('sourcedata', () => {
    map.addSource("maine", {
      type: "geojson",
      data: "https://ceit92.ir/Province-italy-covid.geojson",
    });

    map ? document.getElementById("map").replaceWith(map.getContainer()) : "";

    // Add a new layer to visualize the polygon.
    map.addLayer({
      id: "graduatedCovidMapIT",
      type: "fill",
      source: "maine", // reference the data source
      layout: {},
      paint: {
        "fill-color":m, // blue color fill
        "fill-opacity":n,
      },
    });
    // Add a black outline around the polygon.
    map.addLayer({
      id: "outline",
      type: "line",
      source: "maine",
      layout: {},
      paint: {
        "line-color": "#000",
        "line-width": 1,
      },
    });
    console.log("man reloadam");
  });
}


//adding and intializing the geocoder of mapbox
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  trackProximity: true,
  countries: "it", //search and query in specific countries
  language: "it", //language of the geocoding fileds
});


map.addControl(geocoder);
