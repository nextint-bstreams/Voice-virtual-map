var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
var recognizing = false;
var resultIndex

var recognition = new SpeechRecognition();
var token = "pk.eyJ1IjoiaG9tZXlyYW1haG1vdWRpIiwiYSI6ImNsOXBxN3h5MzB2dW0zb3M1bjA1M2c3cTAifQ.c74-2h9mTcQ__zI22yMGgg"
var basemaps = ["OsmStandard","StamenTonerLite","EsriWorldImagery","OsmStandard"]
var charts = {}
var rn, basemap

var startButtonElement, chatBoxArea

var colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "gray", "black", "white", "beige", "gold", "lavender", "navy", "olive", "silver"]
var mapNumbers = {"zero":0, "one":1, "two":2, "three":3, "four":4, "five":5, "six":6, "seven":7, "eight":8, "nine":9}


recognition.continuous = true;
//recognition.lang = 'en-US';
recognition.lang = ["en-US", "it-IT", "Italia"];
recognition.interimResults = false;
recognition.maxAlternatives = 1;

function startListening(event, {id, bmap, regions}) {
	if (recognizing) {
		recognition.stop()
		return
	}

	console.log('listening ...')
	rn = id
	if (!(rn in charts)) charts[rn] = {}
	charts[rn]["basemap"] = charts[rn]["basemap"] ?? bmap
	regions = regions.replace(/##/g,"'")
	regions = decodeURI(regions)
	charts[rn]['regions'] = JSON.parse(regions)
	startButtonElement = document.getElementById(`VoiceButton${rn}`);
	chatBoxArea = document.getElementById(`chat-history${rn}`);
	recognition.start()
}


//* RECOGNITION EVENTS
recognition.onstart = function(event) {
    recognizing = true
	resultIndex = 0
    document.body.classList.add("recognizing"); //adding the html class
    startButtonElement.innerHTML = "Listening"; //change the text of the button
	console.log('onstart ...')
}
recognition.onresult = event => {
	console.log('onresult ...', event)
	const lastEvent = event.results[resultIndex++]
	interpret(lastEvent[0]?.transcript.trim())
}
recognition.onerror = function(event) {
	console.log('onerror ...', event.error)
}
recognition.onend = function(event) {
    recognizing = false
    document.body.classList.remove("recognizing");
    startButtonElement.innerHTML = "Activate Voice";
	console.log('onend ...', event)
}
recognition.onspeechend = function() {
	recognition.stop();
}
 
function logToBoxArea(snippet, input) {
	console.log('>>>> ', snippet)
	const msg = input == 'user'
	? `
	<div class="chat-message clearfix">
    	<div id="chat-message-content-user" class="clearfix">
     	   <span class="chat-time-user">${new Date().toLocaleTimeString()}</span>
      	  <h5 class="subtitle-chat-message-content-user">User</h5>
       	 <span id="final_span" class="final">${snippet}</span>
    	</div>
	</div>`
	: `
	<div class="chat-message clearfix">
    	<div id ="chat-message-content-sys" class="clearfix">
        	<span class="chat-time-sys">${new Date().toLocaleTimeString()}</span>
        	<h5 class="subtitle-chat-message-content-sys">System</h5>
        	${snippet}
    	</div>
	</div>
	`
	chatBoxArea.innerHTML += msg
	chatBoxArea.scrollTop = chatBoxArea.scrollHeight - chatBoxArea.clientHeight
}
	

//* INTERPRET THE SNIPPET
function interpret(snippet) {
		
	console.log(`snippet: .${snippet}.`)
	logToBoxArea(snippet, 'user')

	if (/^(help|commands) base\s?map$/i.test(snippet)) {
		const text = `
		> change basemap<br>
		> hide basemap<br>
		> show basemap<br>
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands) (movement|move)$/i.test(snippet)) {
		const text = `
		> move up<br>
		> move down<br>
		> move right<br>
		> move left<br>
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands) (zoom|pan)$/i.test(snippet)) {
		const text = `
		> zoom in<br>
		> zoom out<br>
		> zoom/go to &lt;location&gt;<br>
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands) (marker|markers|cluster)$/i.test(snippet)) {
		const text = `
		> show cluster<br>
		> hide cluster<br>
		> increase cluster radius<br>
		> decrease cluster radius<br>
		> change shape of marker<br>
		> change color of marker to &lt;color&gt;<br>
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands) regions?$/i.test(snippet)) {
		const text = `
		> hide regions<br>
		> show regions<br>
		> increase opacity of map<br>
		> decrease opacity of map
		> open popup<br>
		> next popup<br>
		> close popup
		`
		logToBoxArea(text, 'system')
	} else
		if (/^(help|commands) filters?$/i.test(snippet)) {
		const text = `
		> filter greater than &lt;num&gt;<br>
		> filter add &lt;region&gt;<br>
		> filter remove &lt;region&gt;<br>
		> reset filters
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands) segments?$/i.test(snippet)) {
		const text = `
		> change steps to &lt;num&gt;<br>
		> change color palette<br>
		> hide legend<br>
		> show legend
		`
		logToBoxArea(text, 'system')
	} else
	if (/^(help|commands)/i.test(snippet)) {
		const text = `
		> help basemap<br>
		> help movement<br>
		> help zoom<br>
		> help cluster<br>
		> help regions<br>
		> help filters<br>
		> help segments
		`
		logToBoxArea(text, 'system')
	} else
	
	
	
	
	
	//* BASEMAP COMMANDS
	if (/^(change|switch) (base\s?map|basement|map)$/i.test(snippet)) {
		console.log('> change basemap')
		logToBoxArea("Changing basemap", 'system')
		const oldBasemap = charts[rn]["basemap"]
		let i = basemaps.indexOf(oldBasemap)
		if (i++ >= basemaps.length || i === -1) i=0
		const basemap = basemaps[i]
		charts[rn]["basemap"] = basemap
		window[`mapLayer${rn}`](`${basemap}`,`${oldBasemap}`)
	} else
	if (/^(remove|hide) (base\s?map|basement|map)$/i.test(snippet)) {
		console.log('> remove basemap')
		logToBoxArea("Hiding basemap", 'system')
		window[`removeLayer${rn}`](`${charts[rn]["basemap"]}`)
		//charts[rn]['basemap'] = ''
	} else
	if (/^(show|short) (base\s?map|basement|map)$/i.test(snippet)) {
		console.log('> show basemap')
		logToBoxArea("Showing basemap", 'system')
		window[`mapLayer${rn}`](`${charts[rn]['basemap']}`)
	} else


	//* ZOOM COMMANDS
	if (/^\b(zoom|move)\s?in\b|closer|(fly|lie|hi|slide)\s?down$/i.test(snippet)) {
		console.log('> zoom in')
		logToBoxArea("Zooming in", 'system')
		window[`zoomIn${rn}`]()
	} else
	if (/^\b(zoom|move)\s?out\b$/i.test(snippet)) {
		console.log('> zoom out')
		logToBoxArea("Zooming out", 'system')
		window[`zoomOut${rn}`]()
	} else


	//* PAN COMMANDS
	if (/^(move|pan|go)?\s?north$/i.test(snippet)) {
		console.log('> pan north')
		logToBoxArea("Moving north", 'system')
		window[`panBy${rn}`]('north')
	} else
	if (/^(move|pan|go)?\s?south|down$/i.test(snippet)) {
		console.log('> pan south')
		logToBoxArea("Moving south", 'system')
		window[`panBy${rn}`]('south')
	} else
	if (/^(move|pan|go)?\s?east|right$/i.test(snippet)) {
		console.log('> pan east')
		logToBoxArea("Moving east", 'system')
		window[`panBy${rn}`]('east')
	} else
	if (/^(move|pan|go)?\s?west|left$/i.test(snippet)) {
		console.log('> pan west')
		logToBoxArea("Moving west", 'system')
		window[`panBy${rn}`]('west')
	} else 


	//* ZOOM TO LOCATION
	if (
		/^(zoom|zuma|zumba|go|show) (to|2|me) ([\w\s]+)+$/i.test(snippet) ||
		/^find ([\w\s]+)+$/i.test(snippet)
	) {
		console.log('> zoom to')
		let result = /^(?:zoom|zuma|zumba|go|find|show) (?:to|2|me) ([\w\s]+)$/i.exec(snippet)
		if (!result) result = /^find ([\w\s]+)$/i.exec(snippet)
		const location = result?.[1]
		console.log('location ....', location)
		logToBoxArea(`Zooming to ${location}`, 'system')
		//const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(location)}.json?country=it&access_token=${token}`
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(location)}.json?access_token=${token}`
		console.log('url ....', url)
		const newXHRRequest = new XMLHttpRequest()
		newXHRRequest.open( "GET", url, true)
		newXHRRequest.onload = function () {
			if (this.status === 200) {
				const response = JSON.parse(this.responseText);
				const feature = response?.features?.[0]
				console.log('--> ', response)
				const [lng, lat] = feature?.center ?? [null, null]
				//let placeType
				//if (/^(zoom|zuma|zumba)/i.test(snippet)) placeType = feature?.place_type?.[0] ?? null
				const placeType = feature?.place_type?.[0] ?? null
				window[`panTo${rn}`]({lat, lng, placeType})
			} else {
				console.log('err...')
			}
		}
		newXHRRequest.send()
	} else



	//* MARKERS
	// Remove markers
	if (/^(remove|hide) (markers?|cluster|plaster)( markers?)?/i.test(snippet)) {
		logToBoxArea("Remove markers", 'system')
		window[`removeCluster${rn}`]()
	} else
	// Show markers
	if (/^(add|show) (markers?|cluster|plaster)( markers?)?/i.test(snippet)) {
		logToBoxArea("Add markers", 'system')
		window[`addCluster${rn}`]()
	} else
	if (/^(increase|rise|expand)( the)?( cluster| plaster)? radius/i.test(snippet)) {
		logToBoxArea("Increase cluster radius", 'system')
		window[`increaseClusterRadius${rn}`]()
	} else
	if (/^(decrease|shrink)( the)?( cluster| plaster)? radius$/i.test(snippet)) {
		logToBoxArea("Decrease cluster radius", 'system')
		window[`decreaseClusterRadius${rn}`]()
	} else
	if (/^(change|alter|modify)( the)?( (format|type|shape|style|symbol))?( of)?( the)? (marker|pin|pin)s?$/i.test(snippet)) {
		logToBoxArea("Change marker symbol", 'system')
		window[`changeMarker${rn}`]()
	} else
	if (/(change|alter|modify)( the)? (colour|color) of( the)? markers?( to)?/i.test(snippet)) {
		const result = / (\w+)$/.exec(snippet)
		const color = result[1].toLowerCase()
		if (colors.indexOf(color) === -1) {
			logToBoxArea("INVALID COLOR", 'system')
			return
		}
		logToBoxArea(`Change marker color to ${color}`, 'system')
		window[`changeMarkerColor${rn}`](color)
	} else
	if (/^(hide|close) (popup|pop up|pop-up|papa)$/i.test(snippet)) {
		logToBoxArea("Close Popup", 'system')
		window[`closePopup${rn}`]()
	} else
	if (/^((open|next) )?(popup|pop up|pop-up|papa)$/i.test(snippet)) {
		logToBoxArea("Open Popup", 'system')
		window[`nextPopup${rn}`]()
	} else

 
	//* REGIONS
	// Remove regions
	if (/^(remove|hide) regions?/i.test(snippet)) {
		logToBoxArea("Remove regions", 'system')
		window[`removeRegions${rn}`]()
	} else
	// Remove regions
	if (/^(add|show) regions?/i.test(snippet)) {
		logToBoxArea("Show regions", 'system')
		window[`addRegions${rn}`]()
	} else
	// Chage # of steps
	if (/(change|modfify|alter)( the)? steps to (.+)$/i.test(snippet)) {
		const result = /to (.+)$/.exec(snippet)
		let n = result[1]
		if (isNaN(n)) n = mapNumbers[n]
		if (!n) { logToBoxArea("Not a number", 'system'); return }
		n= +n
		if (n<2 || n>10) { logToBoxArea("Invalid number: must be between 2 and 10", 'system'); return }
		logToBoxArea("Show regions", 'system')
		window[`changeNumSteps${rn}`](n)
	} else
	// Add or remove regions
	if (/^filter (add|at|remove) ([\w\s]+)$/i.test(snippet)) {
		const result = /(add|at|remove) ([\w\s]+)$/.exec(snippet)
		const command = result[1]
		const region = result[2]
		if (!charts[rn]['regions'].includes(region)) {
			logToBoxArea("Invalid Region", 'system')
			return 
		}
		if (['add','at'].includes(command)) {
			logToBoxArea(`Add region "${region}"`, 'system')
			window[`filterAddRegion${rn}`](region)
		} else {
			logToBoxArea(`Remove region "${region}"`, 'system')
			window[`filterRemoveRegion${rn}`](region)
		}
	} else
	// Filter points
	if (/^filter points? (less|greater) than/i.test(snippet)) {
		const result = /(less|greater) than ([\w\d\s,]+)$/.exec(snippet)
		if (!result) { logToBoxArea("Invalid filter", 'system'); return }
		const method = result[1].toLowerCase()
		let value = result[2]
			.replace(/,/g,'')
			.replace(/ /g, '')
			.replace(/millions?/i,'000000')
		if (isNaN(value)) value = mapNumbers[value]
		if (!value) { logToBoxArea("Not a number", 'system'); return }
		logToBoxArea(`Filter points ${method} than ${value}`, 'system')
		window[`filterPoints${rn}`]({method, value})
	} else
	// Filter regions with aggregate values greater or less than a number
	if (/^filter( the)?( map)? (less|greater) than/i.test(snippet)) {
		const result = /(less|greater) than ([\w\d\s,]+)$/.exec(snippet)
		if (!result) { logToBoxArea("Invalid filter", 'system'); return }
		const method = result[1].toLowerCase()
		let value = result[2]
			.replace(/,/g,'')
			.replace(/ /g, '')
			.replace(/millions?/i,'000000')
		console.log('value ___', value)
		if (isNaN(value)) value = mapNumbers[value]
		if (!value) { logToBoxArea("Not a number", 'system'); return }
		logToBoxArea(`Filter ${method} than ${value}`, 'system')
		window[`filterAggregates${rn}`]({method, value})
	} else
	// Reset filters
	if (/reset filters?$/i.test(snippet)) {
		logToBoxArea(`Reset filters`, 'system')
		window[`resetFilters${rn}`]()
	} else
	// Change palette
	if (/^change( the)?( (colour|color))? palette$/i.test(snippet)) {
		logToBoxArea(`Change the color palette`, 'system')
		window[`changePalette${rn}`]()
	} else


	//* LEGEND
	if (/(show|display|add)( the)? legend/i.test(snippet)) {
		logToBoxArea("Show the legend", 'system')
		window[`showLegend${rn}`]()
	} else
	if (/(hide|remove)( the)? legend/i.test(snippet)) {
		logToBoxArea("Hide the legend", 'system')
		window[`hideLegend${rn}`]()
	} else

	// OPACITY OF THE MAP
	if (/^(increase|raise|expand)( the)? (opacity|trasparency) of( the)? map/.test(snippet)) {
		logToBoxArea("Increase Opacity", 'system')
		window[`increaseOpacity${rn}`]()
	}
	if (/^(decrease|lower)( the)? (opacity|trasparency) of( the)? map/.test(snippet)) {
		logToBoxArea("Decrease Opacity", 'system')
		window[`decreaseOpacity${rn}`]()
	}
	
}
