const {DeckGL, GreatCircleLayer} = deck;

function updateTooltip({x, y, object}) {
	const tooltip = document.getElementById('tooltip');
	if (object) {
		tooltip.style.top = `${y}px`;
		tooltip.style.left = `${x}px`;
		tooltip.innerText = `flight ${object.flight.identification.number.default} from ${object.flight.airport.origin.origin_name} to ${object.flight.airport.destination.name}`;
	} else tooltip.innerText = '';
}

const deck_gl = new DeckGL({
	container: 'map_container',
	mapboxApiAccessToken: '***REMOVED***',
	mapStyle: 'mapbox://styles/mapbox/dark-v10',
	longitude: -3,
	latitude: 33,
	zoom: 3,
	maxZoom: 20,
	pitch: 30,
	bearing: 0
});

const direction_select = document.getElementById('direction_select');
const airport_select = document.getElementById('airport_select');
const date_select = document.getElementById('date_select');

let airport_data = {};

const update_data = function(){
	// Clear option for date, to update them
	date_select.disabled = true;
	date_select.innerHTML = "";
	airport_selected = airport_select.options[airport_select.selectedIndex].value;
	direction_selected = direction_select.options[direction_select.selectedIndex].value;

	if(!(airport_selected in airport_data && direction_selected in airport_data[airport_selected])){
		// No data for those selected options
		return
	}

	let opt = document.createElement("option");
	opt.text = 'Date';
	opt.disabled = true;
	opt.selected = true;
	date_select.add(opt);

	airport_data[airport_selected][direction_selected].forEach(opt_data => {
		let opt = document.createElement("option");
		opt.value = opt_data[1];
		opt.text = opt_data[0];
		date_select.add(opt);
	})
	date_select.disabled = false;
};

direction_select.addEventListener('change', update_data);
airport_select.addEventListener('change', update_data);

date_select.addEventListener('change', () => {
	airport_data_json_selected = date_select.options[date_select.selectedIndex].value;

	const greatCircleLayer = new GreatCircleLayer({
		id: 'great-circle',
		data: airport_data_json_selected,
		getSourcePosition: d => [d.flight.airport.origin.position.longitude, d.flight.airport.origin.position.latitude],
		getTargetPosition: d => [d.flight.airport.destination.position.longitude, d.flight.airport.destination.position.latitude],
		getSourceColor: [64, 255, 0],
		getTargetColor: [0, 128, 200],
		widthMinPixels: 1,
		pickable: false,
		onHover: updateTooltip,
		wrapLongitude: true
	});

	deck_gl.setProps({layers: [greatCircleLayer]});
})

fetch('data.json')
.then(function (response) {
	return response.json();
})
.then(function (data) {
	airport_data = data;

	for (airport in airport_data){
		let opt = document.createElement("option");
		opt.value = airport;
		opt.text = airport;
		airport_select.add(opt);
	}
	airport_select.disabled = false;
});