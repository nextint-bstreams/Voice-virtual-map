class VoicemapChart extends Graph {
	
	constructor() {
		super()
		this.chart.margin = { top: 0, right: 0, bottom: 0, left: 0 }
	}
	
	draw() {
		
		const scriptLoaded = () => {

		console.log('CONFFF', this.m)
			
		this.layout.color.highlights = this.layout.highlight?.values 
			? JSON.parse(JSON.stringify(this.layout.highlight.values))
			: []
			
		this.initData()
			
		let customHeight = this.SPECIAL?.vectorMap?.file.split('_')[3]
		if (typeof customHeight == 'object') customHeight = 500
		const heightAdjust = customHeight ? [customHeight,0] : null
			
			
		this.flushVisualization({
			header: this.header,
			help: this.help,
			footer: this.footer,
			highlight: true,
			legend: this.legend,
			heightAdjust,
			segmentData: null, 		// disable segments creation
		})

		//! Truncate Lat and Lng to the fifth decimal	
		this.DATA = this.DATA.map(d => {
			d[0][0] = isNaN(parseInt(d[0][0])) ? d[0][0] : Number(d[0][0]).toFixed(5)
			d[0][1] = isNaN(parseInt(d[0][1])) ? d[0][1] : Number(d[0][1]).toFixed(5)
			return d
		})

		//! AGGREGATE DATA WITH THE SAME LAT-LNG
		let rv
		const groupBy = (data) => {
			rv = {}
			for (const item of data) {
				let newItem = { ...item }
				const key = `${item[0][0]}-${item[0][1]}`;
				(rv[key] = rv[key] ?? []).push(newItem)
			}
			return rv
		}
		//let groupedData = groupBy(this.DATA)
		let indexIcon
		this.logg && console.log('LABELS____', this.LABELS)
		if ('popup' in this.LABELS && (
			this.LABELS.popup.dimension[1] || 	// nel popup è stata inserita sia la dimensione che l'icona
			this.LABELS.popup.dimension.length == 1 && this.DIMENSIONS[2].position == 2	// nel popup è stata inserita solo l'icona
		))
		{
			indexIcon = this.LABELS.popup.dimension.pop()
		}
	
		const rn = this.CHART_NAMEID.slice(0,5)

		console.log('SPECIAL', this.SPECIAL)
		console.log('ID___', this.CHART_DIV.attr('id'))
		this.svg.remove()
		this.CHART_DIV
			.style('height', `${customHeight || 500}px`)
			.attr('id', `CD${this.container}`)
			.style('z-index', 12)
			.style('margin', `${this.chart.margin.top}px ${this.chart.margin.right}px ${this.chart.margin.bottom}px ${this.chart.margin.left}px`)
			.style('background-color', this.chart.bgcolor ?? "#cccccc")
		this.disablePropagation(this.CHART_DIV)
			

		const basemap = this.layout.mapOptions?.defaultLayer ?? "OsmStandard"

		// INSTANTIATE THE POPUP OBJECT 
		const popup = this.SPECIAL?.popup?.show
			? this.chooseMiniChart(this.SPECIAL.popup.type ?? "table", this.FIELDS, this.LABELS["popup"])
			: null

		//let opacity = this.layout.mapOptions.showBaseMap ? this.layout.mapOpacity : 0 
		let opacity = 0.7

		//* STYLES FOR INFO AND LEGEND
		var style = document.createElement('style')
		document.head.appendChild(style)
		style.sheet.insertRule(`.infopanel {padding: 6px 8px; background: white; background: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px;}`)
		style.sheet.insertRule(`.infopanel h4 {margin: 0 0 5px; color: #777;}`)
		style.sheet.insertRule(`.legend {line-height: 18px; color: #555;}`)
		style.sheet.insertRule(`.legend i {width: 18px; height: 18px; float: left; margin-right: 8px; opacity: ${opacity ? 0.7 : 1};}`)
		style.sheet.insertRule(`map { background-color: #cccc33 }`)

		const placeZoom = {"country":5,"region":6,"postcode":7,"district":8,"place":9,"locality":9,"neighborhood":10,"address":11,"poi":11}
		//defining the palettes 
		const palettesObj = {
			BstreamsPalette  : [ "rgb(26, 35, 126)", "rgb(92, 107, 192)", "rgb(48, 124, 16)", "rgb(159, 168, 219)", "rgb(103, 176, 61)", "rgb(197, 202, 233)", "rgb(232, 234, 246)", "rgb(130, 119, 23)", "rgb(175, 180, 43)", "rgb(212, 225, 87)", "rgb(240, 244, 195)", "rgb(188, 189, 193)", "rgb(240, 240, 241)", "rgb(58, 60, 72)", "rgb(196, 69, 23)" ],
			HotandColdPalette : [ "rgb(49, 54, 149)", "rgb(65, 99, 171)", "rgb(90, 141, 192)", "rgb(125, 178, 212)", "rgb(162, 209, 229)", "rgb(201, 231, 239)", "rgb(231, 245, 227)", "rgb(250, 248, 193)", "rgb(254, 232, 157)", "rgb(253, 202, 124)", "rgb(251, 163, 94)", "rgb(243, 119, 72)", "rgb(227, 75, 52)", "rgb(199, 35, 40)", "rgb(165, 0, 38)" ],
			NaturePalette : [ "rgb(194, 163, 38)", "rgb(225, 226, 137)", "rgb(189, 198, 97)", "rgb(187, 141, 133)", "rgb(185, 85, 67)", "rgb(76, 83, 67)", "rgb(73, 118, 181)", "rgb(24, 99, 35)", "rgb(109, 112, 113)", "rgb(71, 126, 136)", "rgb(33, 139, 158)", "rgb(190, 104, 38)", "rgb(87, 130, 43)", "rgb(153, 170, 56)", "rgb(172, 210, 237)" ],
			FruitJuicePalette : [ "rgb(166, 206, 227)", "rgb(31, 120, 181)", "rgb(178, 223, 138)", "rgb(51, 160, 45)", "rgb(251, 154, 153)", "rgb(227, 26, 29)", "rgb(254, 191, 111)", "rgb(255, 127, 0)", "rgb(202, 178, 215)", "rgb(106, 62, 154)", "rgb(255, 255, 154)", "rgb(177, 89, 40)", "rgb(92, 107, 192)", "rgb(103, 176, 61)", "rgb(219, 122, 74)" ],
			CinderelaPalette : [ "rgb(82, 1, 47)", "rgb(112, 1, 65)", "rgb(142, 1, 82)", "rgb(197, 27, 125)", "rgb(222, 119, 175)", "rgb(241, 182, 218)", "rgb(253, 224, 240)", "rgb(237, 237, 237)", "rgb(231, 246, 208)", "rgb(184, 225, 134)", "rgb(127, 188, 65)", "rgb(78, 146, 34)", "rgb(39, 100, 25)", "rgb(29, 74, 18)", "rgb(19, 48, 12)" ],
			RedToAcidGreenPalette : [ "rgb(86, 0, 0)", "rgb(94, 14, 5)", "rgb(102, 28, 9)", "rgb(110, 42, 14)", "rgb(118, 55, 18)", "rgb(126, 69, 23)", "rgb(134, 83, 27)", "rgb(143, 97, 32)", "rgb(151, 111, 37)", "rgb(159, 125, 41)", "rgb(167, 139, 46)", "rgb(175, 152, 50)", "rgb(183, 166, 55)", "rgb(191, 180, 59)", "rgb(199, 194, 64)" ],
			MagmaPalette : [ "rgb(233, 208, 34)", "rgb(233, 194, 32)", "rgb(233, 180, 30)", "rgb(232, 166, 29)", "rgb(232, 152, 27)", "rgb(232, 138, 25)", "rgb(232, 124, 23)", "rgb(232, 110, 22)", "rgb(231, 95, 20)", "rgb(231, 81, 18)", "rgb(231, 67, 16)", "rgb(231, 53, 14)", "rgb(230, 39, 13)", "rgb(230, 25, 11)", "rgb(230, 11, 9)" ],
			IceCold : [ "rgb(41, 85, 138)", "rgb(46, 91, 144)", "rgb(51, 98, 150)", "rgb(56, 105, 157)", "rgb(61, 111, 163)", "rgb(66, 118, 170)", "rgb(71, 125, 176)", "rgb(76, 132, 183)", "rgb(95, 144, 189)", "rgb(115, 156, 196)", "rgb(134, 169, 203)", "rgb(154, 181, 209)", "rgb(173, 194, 216)", "rgb(193, 206, 223)", "rgb(213, 219, 230)" ],
			Plasma : ["#f0f921","#fada24","#febd2a","#fba238","#f48849","#e97158","#db5c68","#cc4778","#b83289","#a31e9a","#8b0aa5","#6f00a8","#5302a3","#350498","#0d0887"],
		}
		const palettes = ["BstreamsPalette","HotandColdPalette","NaturePalette","FruitJuicePalette","CinderelaPalette","RedToAcidGreenPalette","MagmaPalette","IceCold","Plasma"]

		let map = L.map(`CD${this.container}`, {
			zoomControl: this.layout.mapOptions?.showZoom ?? 1,
		})
		let Layers = defineMapLayers(L, opacity)

		
		let legend, cluster, MapCluster, markerShapeNames
		let maxClusterRadius = 100

		let showRegions = true
		let showLegend = true
		let showMarkers = true
		let DATA = JSON.parse(JSON.stringify(this.DATA))
		let visiblePopups = []
		let markersPopupIndex = 0
		let regionsPopupIndex = 0

		const filterValue = (filter, value) => {
			switch (filter.method) {
				case 'less': return value < filter.value; break
				case 'greater': return value > filter.value; break
				default: return false
			}
		}

		const resetVisiblePopups = () => {
			const b = map.getBounds()
			console.log('Bounds_____', b)
			visiblePopups = popupMarkers.filter(m => {
				const mCoo = m._latlng
				//if (!MapCluster.getVisibleParent(m)._group) console.log('>>>>> ', mCoo)
				return mCoo.lat < b._northEast.lat &&
					   mCoo.lat > b._southWest.lat &&
					   mCoo.lng > b._southWest.lng &&
					   mCoo.lng < b._northEast.lng &&
					   MapCluster.getVisibleParent(m) && 
					   !MapCluster.getVisibleParent(m)._group
			})
		}


		//! VOICE COMMAND

		window[`mapLayer${rn}`] = (layer, oldLayer) => {
			oldLayer && map.removeLayer(Layers[oldLayer])
			map.addLayer(Layers[layer])	// Initial Layer
		}
		window[`removeLayer${rn}`] = layer => {
			map.removeLayer(Layers[layer])
		}
		window[`zoomIn${rn}`] = () => {
			map.zoomIn()
			markersPopupIndex = 0
			console.log('POPUPS...', visiblePopups)
		}
		window[`zoomOut${rn}`] = () => {
			map.zoomOut()
			markersPopupIndex = 0
		}
		window[`panBy${rn}`] = direction => {
			switch(direction) {
				case 'north': 
      				map.panBy([0, -100], { speed: 1 })
					break
				case 'south': 
      				map.panBy([0, 100], { speed: 1 })
					break
				case 'west': 
      				map.panBy([-100, 0], { speed: 1 })
					break
				case 'east': 
      				map.panBy([100, 0], { speed: 1 })
					break
			}
			markersPopupIndex = 0
		}
		window[`panTo${rn}`] = ({lat, lng, placeType}) => {
			if (lat) {
				if (placeType) {
					map.flyTo(new L.LatLng(lat, lng), placeZoom[placeType] ?? 5)
				} else {
					map.panTo(new L.LatLng(lat, lng), { speed: 1 })
				}
				markersPopupIndex = 0
			}
		}
		window[`removeCluster${rn}`] = () => {
			//map.removeLayer(cluster)
			showMarkers = false
			cluster.remove()
		}
		window[`addCluster${rn}`] = () => {
			//map.addLayer(cluster)
			showMarkers = true
			cluster.remove()
			cluster.addTo(map)
		}
		window[`removeRegions${rn}`] = () => {
			showRegions = false
			layerGeo.remove()
			legend.remove()
			//map.removeLayer(layerGeo)
		}
		window[`addRegions${rn}`] = () => {
			showRegions = true
			layerGeo.remove()
			layerGeo.addTo(map)
			showLegend && legend.remove() && legend.addTo(map)
			//map.addLayer(layerGeo)
		}
		window[`increaseOpacity${rn}`] = () => {
			if (showRegions) {
				if (opacity > 0.9) return
				opacity = opacity + 0.1
				layerGeo.remove()
				makeGraduatedRegions()
			}
		}
		window[`decreaseOpacity${rn}`] = () => {
			if (showRegions) {
				if (opacity < 0.1) return
				opacity = opacity - 0.1
				layerGeo.remove()
				makeGraduatedRegions()
			}
		}
		window[`showLegend${rn}`] = () => {
			legend.remove()
			showLegend = true
			legend.addTo(map)
		}
		window[`hideLegend${rn}`] = () => {
			showLegend = false
			legend.remove()
		}
		window[`increaseClusterRadius${rn}`] = () => {
			if (showMarkers) {
				cluster.remove()
				maxClusterRadius += 20
				makeMarkerCluster()
				markersPopupIndex = 0
			}
		}
		window[`decreaseClusterRadius${rn}`] = () => {
			if (showMarkers) {
				cluster.remove()
				if (maxClusterRadius > 20) maxClusterRadius -= 20
				makeMarkerCluster()
				markersPopupIndex = 0
			}
		}
		window[`changeMarker${rn}`] = () => {
			if (showMarkers) {
				let i = markerShapeNames.indexOf(this.layout.marker.shape)
				if (++i >= markerShapeNames.length) i=0
				this.layout.marker.shape = markerShapeNames[i]
				cluster.remove()
				makeMarkerCluster()
				markersPopupIndex = 0
			}
		}
		window[`changeMarkerColor${rn}`] = color => {
			if (showMarkers) {
				this.layout.marker.color = color
				cluster.remove()
				makeMarkerCluster()
				markersPopupIndex = 0
			}
		}
		window[`changeNumSteps${rn}`] = n => {
			if (showRegions) {
				layerGeo.remove()
				this.layout.colorize.segments.steps = n
				makeGraduatedRegions()
				legend.remove()
				makeLegend()
			}
		}
		window[`filterAggregates${rn}`] = filter => {
			if (showRegions) {
				layerGeo.remove()
				regionsList = []
				makeGraduatedRegions(filter)
			}
		}
		window[`filterPoints${rn}`] = filter => {
			DATA = JSON.parse(JSON.stringify(this.DATA))
			DATA = DATA.filter(row => filterValue(filter, row[1][0]))
			if (showRegions) {
				layerGeo.remove()
				regionsList = []
				makeGraduatedRegions(filter)
				showLegend && legend.remove() && makeLegend()
			}
			if (showMarkers) {
				cluster.remove()
				makeMarkerCluster()
				markersPopupIndex = 0
			}
		}
		window[`filterAddRegion${rn}`] = region => {
			if (showRegions) {
				layerGeo.remove()
				if (regionsList.indexOf(region) === -1) regionsList.push(region)
				makeGraduatedRegions()			
			}
		}
		window[`filterRemoveRegion${rn}`] = region => {
			if (showRegions) {
				layerGeo.remove()
				const i = regionsList.indexOf(region)
				if (i !== -1) regionsList.splice(i, 1)
				makeGraduatedRegions()
			}
		}
		window[`resetFilters${rn}`] = () => {
			DATA = JSON.parse(JSON.stringify(this.DATA))
			firstTime = true
			if (showRegions) {
				layerGeo.remove() && makeGraduatedRegions()
				showLegend && legend.remove() && makeLegend()
			} 
			if (showMarkers) {
				markersPopupIndex = 0
				cluster.remove()
				makeMarkerCluster()
			}
		}

		window[`changePalette${rn}`] = () => {
			if (showRegions) {
				let i = palettes.indexOf(this.layout.colorize.palette.name)
				if (i === -1 || i >= palettes.length) i = 0
				else i++
				//paletteName = palettes[i]
				this.layout.colorize.palette.name = palettes[i]
				this.layout.colorize.palette.values = palettesObj[palettes[i]]
				layerGeo.remove()
				makeGraduatedRegions()
				showLegend && legend.remove() && makeLegend()
			}
		}
		window[`nextPopup${rn}`] = () => {
			resetVisiblePopups()
			console.log('#visible popups: ', visiblePopups.length, popup, showMarkers)
			if (false && showRegions && popup) {
				regionsPopupIndex++
				if (regionsPopupIndex >= popupLayers.length) regionsPopupIndex = 0
				popupLayers[regionsPopupIndex].openPopup()
			} else if (popup && showMarkers && visiblePopups.length > 0) {
				//console.log('marker ....', popupMarkers[markersPopupIndex]._latlng)
				markersPopupIndex++
				if (markersPopupIndex >= visiblePopups.length) markersPopupIndex = 0
				//console.log('POPUP ...', markersPopupIndex, visiblePopups[markersPopupIndex]._latlng)
				map.setView(visiblePopups[markersPopupIndex]._latlng)
				//map.setZoom(9)
				visiblePopups[markersPopupIndex].openPopup()
			}
		}
		window[`closePopup${rn}`] = () => {
			if (false && showRegions && popup) {
				popupLayers[regionsPopupIndex].closePopup()
			} else if (popup && showMarkers) {
				visiblePopups[markersPopupIndex].closePopup()
			} 
		}
		
		
		// Initialize the basemap
		window[`mapLayer${rn}`](this.layout.mapOptions?.defaultLayer ?? "OsmStandard")
		
		let popupMarkers = []

		//! CLUSTER
		let markers = []
		const makeMarkerCluster = () => {

			let groupedData = groupBy(DATA)

			//MapCluster = map
			cluster = L.markerClusterGroup({
				maxClusterRadius,
			})
			map.addLayer(cluster)
			MapCluster = cluster

			const createPopup = (d) => {
				const size = this.ConvertFontSize(this.datavalues.popup?.fontSize ?? "M")
				const key = `${d[0][0]}-${d[0][1]}`
				const rows = groupedData[key]
				const image = indexIcon ? rows.find(row => row[0][indexIcon])?.[0][indexIcon] : null
				//console.log('......',image)

				let rv = `<div class="tooltip-box chart-custom-scrollbar-light" id="b42b9a91239884dfbae1171d3f9e9c18e-tooltip" style="overflow: auto; max-height: 240px; top: -999px; left: -999px; width: ${image ? '200px' : 'auto'}"><table>`	
				for (let i=0; i<rows.length; i++) {
					const row = rows[i]
					const image = indexIcon ? row[0][indexIcon] : null
					if (image) {
						rv += `<tr><td><span></span></td><td><img src="${image}" width=190 style="margin-bottom: 4px;"></td></tr>`
					}

					for (const i of this.LABELS.popup.dimension) {
						rv += `<tr><td><span></span></td><td style="width: 190px; text-align: ${this.datavalues.popup?.align ?? "center"}; font-size: ${size}px; color: ${this.datavalues.popup?.color ?? 'black'}; font-family: '${this.canvas.family}'"><strong>${row[0][i]}</strong></td></tr>`	
					}

					for (const i of this.LABELS.popup.metric) {
						rv += `<tr><td><span></span></td><td style="width: 190px; text-align: ${this.datavalues.popup?.align ?? "center"}; font-size: ${size}px; color: ${this.datavalues.popup?.color ?? "black"}; font-family: '${this.canvas.family}'"><strong>${this.Format(row[1][i], 'metric', i)}</strong></td></tr>`	
					}

					if (i<rows.length-1) rv += `<tr><td><span></span></td><td valign="middle"><hr style="height: 1px; background: #666666;"></td></tr>`	
				}
				rv += `</table></div>`
				return rv
			}

			const clickZoom = e => {
				console.log('e ...', e)
    			map.setView(e.target.getLatLng(),map.getZoom());
			}

			let markerSize = false
			//const myIcon = L.divIcon({className: 'my-div-icon'})
			const myIcon = L.divIcon()
			const greenIcon = new L.Icon({
				iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  				iconSize: [25, 41],
  				iconAnchor: [12, 41],
  				popupAnchor: [1, -34],
  				shadowSize: [41, 41]
			})
			//const svgColor = '#0DEAD0';
			//const svgLayout = '<svg height="20" width="20" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="5" r="14" fill="' + svgColor + '" /></svg>';
			const markersShape = {
				"pin-basic" : `<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.82346 14.1486L11.9313 21L16.0391 14.1485C17.524 11.6718 18.5965 8.66962 17.2412 6.1197C16.3718 4.48406 14.7942 3 11.9313 3C9.06845 3 7.4908 4.48402 6.6214 6.11964C5.266 8.66958 6.33851 11.6719 7.82346 14.1486ZM11.9313 11.8969C13.5691 11.8969 14.8969 10.5692 14.8969 8.93128C14.8969 7.29341 13.5691 5.96565 11.9313 5.96565C10.2934 5.96565 8.96564 7.29341 8.96564 8.93128C8.96564 10.5692 10.2934 11.8969 11.9313 11.8969Z" fill="${this.layout.marker?.color ?? "#000"}"/></svg>`,
				"pin-dot" : `<svg viewBox="0 0 24 24" fill="none"><rect x="11" y="6" width="1" height="15" rx="0.5" fill="${this.layout.marker?.color ?? '#000'}"/><circle cx="11.5" cy="7.5" r="4.5" fill="${this.layout.marker?.color ?? '#000'}"/></svg>`,
				"pin-dot-paper" : `<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.75 6.39971C15.3686 6.03898 15.75 5.54494 15.75 5C15.75 3.89543 14.183 3 12.25 3C10.317 3 8.75 3.89543 8.75 5C8.75 5.54494 9.13141 6.03898 9.75 6.39971V9.47886C7.54262 10.3723 6 12.4371 6 15H11.75V20.5C11.75 20.7761 11.9739 21 12.25 21C12.5261 21 12.75 20.7761 12.75 20.5V15H18.5C18.5 12.4371 16.9574 10.3723 14.75 9.47886V6.39971Z" fill="${this.layout.marker?.color ?? '#000'}"/></svg>`,
				"pin-flag" : `<svg viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="3" width="2" height="18" rx="1" fill="${this.layout.marker?.color ?? '#000'}"/><path d="M15 4.66667C15 4.29848 15.2762 4 15.617 4H23.3818C23.9315 4 24.2067 4.71809 23.8181 5.13807L21.6058 7.5286C21.3649 7.78895 21.3649 8.21105 21.6058 8.4714L23.8181 10.8619C24.2067 11.2819 23.9315 12 23.3818 12H15.617C15.2762 12 15 11.7015 15 11.3333V4.66667Z" fill="${this.layout.marker?.color ?? '#000'}"/></svg>`,
				"pin-square" : `<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 3H17C18.1046 3 19 3.89543 19 5V15C19 16.1046 18.1046 17 17 17H7C5.89543 17 5 16.1046 5 15V5C5 3.89543 5.89543 3 7 3ZM17 5H7V15H17V5Z" fill="${this.layout.marker?.color ?? '#000'}"/><path d="M12 21L9 16L15 16L12 21Z" fill="${this.layout.marker?.color ?? '#000'}"/></svg>`,
				"square-star" : `<svg viewBox="0 0 30 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M27.0001 2H17.0001C15.8955 2 15.0001 2.89543 15.0001 4V14C15.0001 14 15.0001 14 15.0001 14H15L15.0001 22L18.8971 16H27.0001C28.1047 16 29.0001 15.1046 29.0001 14V4C29.0001 2.89543 28.1047 2 27.0001 2ZM21.3125 5.49956C21.5289 4.83348 22.4713 4.83348 22.6877 5.49956L23.1363 6.88033C23.2331 7.17821 23.5107 7.37989 23.8239 7.37989H25.2757C25.9761 7.37989 26.2673 8.2761 25.7007 8.68777L24.5261 9.54112C24.2727 9.72523 24.1667 10.0516 24.2635 10.3494L24.7121 11.7302C24.9286 12.3963 24.1662 12.9502 23.5996 12.5385L22.425 11.6852C22.1716 11.501 21.8285 11.501 21.5751 11.6852L20.4006 12.5385C19.834 12.9502 19.0716 12.3963 19.288 11.7302L19.7367 10.3494C19.8335 10.0516 19.7274 9.72523 19.474 9.54112L18.2995 8.68777C17.7329 8.2761 18.0241 7.37989 18.7244 7.37989H20.1763C20.4895 7.37989 20.7671 7.17821 20.8639 6.88033L21.3125 5.49956Z" fill="${this.layout.marker?.color ?? '#000'}"/></svg>`,
			}
			markerShapeNames = ["pin-basic","pin-dot-paper","pin-flag","pin-square","square-star","circle"]
			if (!this.layout.marker) this.layout.marker = {}
			this.layout.marker.shape = this.layout.marker.shape ?? "pin-basic"
			const svgIcon = L.divIcon({ 
				className: 'leaf-div-icon',
				html: markersShape[this.layout.marker.shape], 
				iconSize: [24, 24], 
				iconAnchor: [12, 10] 
			})

			let found = []
			for (const d of DATA) {
				const key = `${d[0][0]}-${d[0][1]}`
				if (found.includes(key) || isNaN(parseInt(d[0][0])) || isNaN(parseInt(d[0][1]))) continue
				found.push(key)
				let marker
				if (this.layout.marker?.shape == 'circle') {
					marker = L.circle([d[0][0],d[0][1]], {
						color: this.layout.marker?.color ?? '#303f9f',
						fillColor: this.layout.marker?.color ?? '#303f9f',
						fillOpacity: 0.5,
						radius: (this.layout.marker?.size ?? 5) * 1000,
					}).addTo(MapCluster)
				} else {
					marker = L.marker([d[0][0],d[0][1]], {icon: svgIcon}).addTo(MapCluster)
					if (!markerSize) {
						const icon = marker.options.icon
						const molt = (this.layout.marker?.size ?? 5) / 6 + 0.5
						icon.options.iconSize[0] *= molt
						icon.options.iconSize[1] *= molt
						icon.options.iconAnchor = [icon.options.iconSize[0]/2, icon.options.iconSize[1]]
						marker.setIcon(icon)
						markerSize = true
					}
				}
				markers.push([d[0][0],d[0][1]])
				if (this.DIMENSIONS.length > 2) marker.bindPopup(createPopup(d))
				marker.on('click', clickZoom)
				popupMarkers.push(marker)
			}
	
		}
		makeMarkerCluster()
		map.fitBounds(markers, {maxZoom: 11})	// Center and zoom the map to include all markers
		resetVisiblePopups()
		console.log('VISIBLE POPUPS ', visiblePopups)
		//cluster.remove()	//! TODO remove comment

		//* LEGEND
		const makeLegend = () => {
			if (this.legenda.show) {
				legend = L.control({position: this.legenda.position ?? 'bottomleft'})	
				const legendNumber = num => {
					const format = `,.0f`
					const kmil = num >= 1000000
						? 6
						: num >= 1000
							? 3
							: 0
					return d3.formatPrefix(format,`1e${kmil || 0}`)(num)
				}
				legend.onAdd = map => {
					let div = L.DomUtil.create('div', 'infopanel legend'),
						grades = segments.map(el => ({"n": el.from, "color": el.color, "label": el.label})),
						labels = []
					console.log('GRADES',grades)
					for (let i = 0; i < grades.length; i++) {
						if (grades[i].label) {	// Segment label
							const title = grades[i-1] && grades[i+1]
								? `${legendNumber(grades[i].n)} &ndash; ${legendNumber(grades[i+1].n)}`
								: !grades[i+1]
									? `&gt; ${legendNumber(grades[i].n)}`
									: !grades[i-1]
										? `&#8804; ${legendNumber(grades[i+1]?.n)}`
										: ''
							div.innerHTML += `<i style="background:` + grades[i].color + `" title='${title}'></i> ` + grades[i].label + `<br>`
						} else {	// Not segment label 
							div.innerHTML += `<i style="background:` + grades[i].color + `"></i> `
							div.innerHTML += grades[i-1] && grades[i+1]
								? `${legendNumber(grades[i].n)} &ndash; ${legendNumber(grades[i+1].n)}<br>`
								: !grades[i+1]
									? `&gt; ${legendNumber(grades[i].n)}`
									: !grades[i-1]
										? `&#8804; ${legendNumber(grades[i+1]?.n)}<br>`
										: '<br>'
						}
					}
					return div;
				}
				legend.addTo(map)
			}
		}

		//* GRADUATED
		let layerGeo, highlightFeature, zoomToFeature, onEachFeature
		let info, reg_name, regionLayers, segments
		let regions, bounds
		let result
		let allRegionsList = [], regionsList = []
		let paletteName = this.layout.colorize.palette.name
		let popupLayers = []


		let firstTime = true 	// use to initially populate the regionsList with all the regions

		const makeGraduatedRegions = (filter) => {		// filter = an optional object with method (>,<) and value

			regions = {}; markers = []; bounds = [[],[]]
			const fn = this.METRICS[0].fn || 'SUM'
			let groups = this.createSubset(DATA, [0,1])

			//console.log('#Groups', Object.keys(groups).length)
			console.time('MAIN')
			for (const layer of regionLayers) {
				const feature = layer.feature
				const name = feature.properties.reg_name
				const reg_id = feature.properties.reg_id

				let points = []
				//console.time('CONTAINS')
				let newGroups = {}
				for (const key in groups) {
					const [lat, lng] = key.split('||')
					if (d3.geoContains(feature, [lng, lat])) {
						//console.log('CONTAIN____', feature, lat, lng)
						points = [...points, ...groups[key]]
					} else {
						newGroups[key] = groups[key]
					}
				}
				groups = JSON.parse(JSON.stringify(newGroups))
				//console.timeEnd('CONTAINS')

				if (points.length) {
					firstTime && allRegionsList.push(name)
					const centroid = d3.geoCentroid(feature)
					const aggregateValue = this.calcAggregate(points.map(d => d[1][0]), fn)
					if (
						firstTime || 
						(!filter && regionsList.includes(name)) || 
						(filter && filterValue(filter, aggregateValue))
					) {
						regions[reg_id] = {
							aggregateValue,
							subset: popup?.subset ? this.createSubset(points, popup.subset.dims, popup.subset.mets) : [],
							centroid: {Lat: centroid[1], Lng: centroid[0]},
							reg_name: name,
						}
						if (firstTime || regionsList.indexOf(name) === -1) regionsList.push(name)
					}
				}
				const ll = d3.geoBounds(feature)
				//console.log('ll......',ll)
				//console.log('bounds......',JSON.parse(JSON.stringify(bounds)))
				if ((typeof bounds[0][0] === 'undefined' || +ll[0][1] < +bounds[0][0]) && +ll[0][1] != -90) bounds[0][0] = +ll[0][1]
				if ((typeof bounds[0][1] === 'undefined' || +ll[0][0] < +bounds[0][1]) && +ll[0][0] != -180) bounds[0][1] = +ll[0][0]
				if ((typeof bounds[1][0] === 'undefined' || +ll[1][1] > +bounds[1][0]) && +ll[1][1] != 90) bounds[1][0] = +ll[1][1]
				if ((typeof bounds[1][1] === 'undefined' || +ll[1][0] > +bounds[1][1]) && +ll[1][0] != 180) bounds[1][1] = +ll[1][0]
			}
			console.timeEnd('MAIN')
			//console.log('markers', markers)
			if (typeof bounds[0][0] === 'undefined') bounds[0][0] = -90
			if (typeof bounds[0][1] === 'undefined') bounds[0][1] = -180
			if (typeof bounds[1][0] === 'undefined') bounds[1][0] = 90
			if (typeof bounds[1][1] === 'undefined') bounds[1][1] = 180
			//console.log('bounds', bounds)
			if (firstTime || filter) map.fitBounds(bounds)

			firstTime = false

			//* COLOR THE REGIONS
			const ColorByRegion = reg_id => regions[reg_id] && this.getSegmentColor(regions[reg_id].aggregateValue, segments) || 'gray'

			const aggregates = Object.values(regions).map(el => el.aggregateValue)
			segments = this.createSegments(aggregates, 'flushColor')
			segments = this.purgeSegments(segments)

			// Color the regions based on segments
			for (const reg_id of Object.keys(regions)) {
				regions[reg_id].color = ColorByRegion(reg_id)
			}

			//console.log('DATA', this.DATA)
			console.log('Regions',regions)
			console.log('Opacity',opacity)
			layerGeo = L.topoJson(result, {
				style: feature => {
					const reg_id = feature.properties.reg_id
					return {
						color: 'black',
						fillColor: ColorByRegion(reg_id),
						weight: 1,
						opacity: 0.3,
						//fillOpacity: opacity ? 0.7 : 1, // se non c'è la mappa sotto, mette colore full (1)
						fillOpacity: opacity 
					}
				},
				onEachFeature: onEachFeature,
			}).addTo(map)

			setTimeout(() => {
				//popupLayers[0].openPopup()
			}, 1000);

			DATA = DATA
				.filter(d => !isNaN(d[0][0]) && !isNaN(d[0][1]))
				.map(d => [...d, new L.LatLng(d[0][0], d[0][1])])

				/*
			DATA.forEach(d => {
				console.log('... ', d[0][0], d[0][1])
				d[3] = new L.LatLng(d[0][0], d[0][1])
			})
			*/

		}


		const Color = feature => DATA.filter(d => d3.geoContains(feature, [d[0][2],d[0][1]]))[0]?.[2]?.[0] ??  'gray'


		if (this.SPECIAL?.vectorMap?.file) {

		//const Map = d3.json("../../../../maps/latvia_territories.topo.json")-
		const Map = d3.json(`https://bstreams-data-repository-test.s3.eu-north-1.amazonaws.com/maps/${this.SPECIAL.vectorMap.file ?? "world_countries"}.topo.json`)
		//const Map = d3.json(`https://bstreams-data-repository-dev.s3.eu-north-1.amazonaws.com/maps/2_Europe_countries.topo.json`)

		Map
		.then(MapResult => {

			result = MapResult

			//console.log('topoJson',result)

			highlightFeature = e => {
				const layer = e.target
				layer.setStyle({
					weight: 3,
					color: "#666",
					dashArray: '',
					fillOpacity: 0.7,
				})
				layer.bringToFront()
				info.update(layer.feature.properties)
			}
			const resetHighlight = e => {
				layerGeo.resetStyle(e.target)
				info.update()
			}

			// Function calls when click on a region
			zoomToFeature = e => {
				const reg_id = e.target.feature.properties.reg_id
				if (false && popup && regions[reg_id]) {	//! added false
					popup.minichart.draw(
						regions[reg_id].subset, reg_id, {
							height: 200,
							width: 400,
							color: regions[reg_id].color,
						}
					)
				}
				map.fitBounds(e.target.getBounds())
			}

			onEachFeature = (feature, layer) => {
				const reg_id = feature.properties.reg_id
				if (false && popup && regions[reg_id]) {	//! added false
					const popup = L.popup({maxWidth: 400}).setContent(`<div class="chart-custom-scrollbar-light" id="div${feature.properties.reg_id}" style="width: 420px; max-height: 220px; overflow-y: auto;"></div>`)
					layer.bindPopup(popup)
				}
				layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					click: zoomToFeature,
					popupopen: zoomToFeature,
				})
				popupLayers.push(layer)
			}

			//extend Leaflet to create a GeoJSON layer from a TopoJSON file
			//console.time('Convert')
			L.TopoJSON = L.GeoJSON.extend({
				addData: function (data) {
          			var geojson, key;
    				if (data.type === "Topology") {
          				for (key in data.objects) {
							if (data.objects.hasOwnProperty(key)) {
                				geojson = topojson.feature(data, data.objects[key]);
                				L.GeoJSON.prototype.addData.call(this, geojson);
              				}
            			}
            			return this;
          			}
          			L.GeoJSON.prototype.addData.call(this, data);
          			return this;
        		}
			})
			//console.timeEnd('Convert')
			L.topoJson = (data, options) => {
				return new L.TopoJSON(data, options);
			}

			reg_name = Object.values(L.topoJson(result)._layers)[0].feature?.properties?.[`reg_name_${this.LANGUAGE}`] 
				? `reg_name_${this.LANGUAGE}` 
				: 'reg_name'

			regionLayers = Object.values(L.topoJson(result)._layers)
			regionLayers.sort((a,b) => (a.feature.properties.order ?? 9) - (b.feature.properties.order ?? 9))

			makeGraduatedRegions()

			//* INFO PANEL
			info = L.control({position: this.legenda.show && this.legenda.position == 'topright' ? 'bottomright' : 'topright'})
			info.onAdd = function(map) {
				this._div = L.DomUtil.create('div', 'infopanel') 	// create a div with a class "info"
				this.update()
    			return this._div
			}
			const that = this
			info.update = function(props) {
				this._div.innerHTML = props ?  '<b>' + props[reg_name] + '</b><br />' + (regions[props.reg_id]?.aggregateValue ? that.Format(regions[props.reg_id]?.aggregateValue, 'metric', 0) : '') : '' 
			}
			info.addTo(map)

			// Add the legend
			makeLegend()

			// VOICE CHATLOG
			const chatlog = L.control({position: 'topleft'})	
			chatlog.onAdd = function(map) {
				let regionsList = encodeURI(JSON.stringify(allRegionsList)).replace(/'/g, "##")
				this._div = L.DomUtil.create('div', 'infopanel')
				this._div.innerHTML = `	
				<div id="live-chat">
        			<header class="clearfix">
            			<div class="header-chat-blinker">
                			<button id="VoiceButton${rn}" class="VoiceButton" onclick="startListening(event, {id: '${rn}', bmap: '${basemap}', regions: '${regionsList}'})" autofocus>Activate Voice</button>
            			</div>
        			</header>
        			<div class="chat">
            			<div id="chat-history${rn}" class="chat-history">
                			<div class="chat-message clearfix">
                    			<div id="chat-message-content-sys" class="clearfix">
                        			<span class="chat-time-sys"></span>
                        			<h5 class="subtitle-chat-message-content-sys">System</h5>
                        			Explore the map with voice commands. Say &#34;help&#34; for the command list.
                    			</div>
                			</div>
                			<div class="chat-message clearfix">
                    			<div id="chat-message-content-user" class="clearfix">
                        			<!-- Since the script adding automatically the div, i commented it -->
                        			<!-- <span class="chat-time-user"></span>
                        			<h5 class="subtitle-chat-message-content-user"></h5>
                        			<span id="final_span" class="final"></span>
                        			<span id="interim_span" class="interim"></span> -->
                    			</div>
                			</div>
            			</div>
        			</div>
    			</div>
				`
				return this._div
			}
			chatlog.addTo(map)


			const update = () => {
				//console.log(map.getBounds())
				//drawHighlight()
			}
			map.on("zoom", update);
			map.on("moveend", update);
			update()

		})

		} else {
			map.setView(new L.LatLng(45,0),2)
		}

	}




	var headID = document.getElementsByTagName("head")[0];  
	var cssNode = document.createElement('link');  
	cssNode.type = 'text/css';  
	cssNode.rel = 'stylesheet';  
	cssNode.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
	//cssNode.media = 'screen';  
	headID.appendChild(cssNode);  

	var cssNode1 = document.createElement('link');  
	cssNode1.type = 'text/css';  
	cssNode1.rel = 'stylesheet';  
	cssNode1.href = 'https://bstreams-data-repository-dev.s3.eu-north-1.amazonaws.com/test/voicechathistory.css';
	//cssNode.media = 'screen';  
	headID.appendChild(cssNode1);  

	var cssNode = document.createElement('link');  
	cssNode.type = 'text/css';  
	cssNode.rel = 'stylesheet';  
	cssNode.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css'
	//cssNode.media = 'screen';  
	headID.appendChild(cssNode);  

	var cssNode = document.createElement('link');  
	cssNode.type = 'text/css';  
	cssNode.rel = 'stylesheet';  
	cssNode.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css'
	//cssNode.media = 'screen';  
	headID.appendChild(cssNode);  

	const loadMarkerCluster = () => {
		var newScript = document.createElement('script')
		newScript.type = 'text/javascript'
		newScript.onload=scriptLoaded;  
		newScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js'
		headID.appendChild(newScript)
	}

	const mapxboxScript = () => {
		var newScript = document.createElement('script')
		newScript.type = 'text/javascript'
		newScript.onload=loadMarkerCluster;  
		newScript.src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"
		headID.appendChild(newScript)
	}

	const loadVoiceScript = () => {
		var newScript = document.createElement('script');  
		newScript.type = 'text/javascript';  
		newScript.onload=mapxboxScript;  
		newScript.id = "10"
		newScript.name = 'one'
		//newScript.src = 'https://bstreams-data-repository-dev.s3.eu-north-1.amazonaws.com/test/recognition.js'	// DEV
		newScript.src = 'https://bstreams-data-repository.s3.eu-north-1.amazonaws.com/lib/recognition.js'			// PROD
		headID.appendChild(newScript); 
	}

	const loadTopoScript = () => {
		var newScript = document.createElement('script');  
		newScript.type = 'text/javascript';  
		newScript.onload=loadVoiceScript;  
		newScript.src = 'https://unpkg.com/topojson@3.0.2/dist/topojson.min.js'
		headID.appendChild(newScript); 
	}

	//var headID = document.getElementsByTagName("head")[0];  
	var newScript = document.createElement('script');  
	newScript.type = 'text/javascript';  
	//newScript.onload=scriptLoaded;  
	newScript.onload=loadTopoScript;  
	newScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
	headID.appendChild(newScript); 


	}

}

window.externalCharts[23] = VoicemapChart
