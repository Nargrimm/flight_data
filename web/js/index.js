const {DeckGL, GreatCircleLayer} = deck;

// When a greatCircleLayer is hover
function updateTooltip({x, y, object}) {
	const tooltip = document.getElementById('tooltip');
	if (object) {
		tooltip.style.top = `${y}px`;
		tooltip.style.left = `${x}px`;
		tooltip.innerText = `flight ${object.flight.identification.number.default} from ${object.flight.airport.origin.origin_name} to ${object.flight.airport.destination.name}`;
	} else tooltip.innerText = '';
}

let deck_gl;

fetch('mapbox_token.txt')
.then(function (response) {
	return response.text();
})
.then(function (mapbox_token) {
	deck_gl = new DeckGL({
		container: 'map_container',
		mapboxApiAccessToken: mapbox_token,
		mapStyle: 'mapbox://styles/mapbox/dark-v10',
		longitude: -3,
		latitude: 33,
		zoom: 3,
		maxZoom: 20,
		pitch: 30,
		bearing: 0
	});
})

// Find the selected radio for direction
const getSelectedDirection = function(){
	return Array.from(direction_radio_list).find(e => e.checked == true).value;
}

let airport_data = {};

// Set vailabled dates for the selected airport/direction according to airport_data
const update_date_select = function(){
	// Clear option for date, to update them
	date_Choices.disable();
	date_Choices.clearStore();
	airport_selected = airport_Choices.getValue().value;
	direction_selected = getSelectedDirection();

	// Unhide date select
	airport_Choices.containerOuter.element.classList.remove('is_last');
	date_Choices.containerOuter.element.classList.remove('hidden');

	if(airport_selected == '' || !(airport_selected in airport_data && direction_selected in airport_data[airport_selected])){
		// No data for those selected options
		const choices_list = [{ value: '', label: 'No date availaible', disabled: true, selected: true }]
		date_Choices.setChoices(choices_list, 'value', 'label', true);
		return;
	}

	const choices_list = airport_data[airport_selected][direction_selected].map(opt_data => ({
		value: opt_data[1], label: opt_data[0]
	}));
	choices_list[0].selected = true;
	choices_list.unshift({ value: '', label: 'Date', disabled: true, selected: true });

	// Replace date choices
	date_Choices.setChoices(choices_list, 'value', 'label', true);
	date_Choices.enable();
	update_map();
};

// Update the map with data from a certain JSON
const update_map = function(){
	airport_data_json_selected = date_Choices.getValue().value;

	if(airport_data_json_selected == ''){
		// No data for those selected options
		return
	}

	const greatCircleLayer = new GreatCircleLayer({
		id: 'great-circle',
		data: airport_data_json_selected,
		getSourcePosition: d => [d.flight.airport.origin.position.longitude, d.flight.airport.origin.position.latitude],
		getTargetPosition: d => [d.flight.airport.destination.position.longitude, d.flight.airport.destination.position.latitude],
		getSourceColor: [64, 255, 0],
		getTargetColor: [0, 128, 200],
		widthMinPixels: 1,
		pickable: true,
		onHover: updateTooltip,
		wrapLongitude: true
	});

	deck_gl.setProps({layers: [greatCircleLayer]});
}

let direction_radio_list, airport_select, date_select;
let airport_Choices, date_Choices;

const init = function(){
	direction_radio_list = document.querySelectorAll('input[name="direction_radio"]');
	airport_select = document.getElementById('airport_select');
	date_select = document.getElementById('date_select');

	// Initiate Choices object for <select>
	airport_Choices = new Choices(airport_select, { shouldSort: false });
	airport_Choices.disable();
	airport_Choices.containerOuter.element.classList.add('is_last');
	date_Choices = new Choices(date_select, { shouldSort: false });
	date_Choices.disable();
	date_Choices.containerOuter.element.classList.add('hidden');

	// Set event for radio and select
	direction_radio_list.forEach(e => e.addEventListener('change', update_date_select));
	airport_select.addEventListener('change', update_date_select);
	date_select.addEventListener('change', update_map)

	// Fetch data to hydrate <select>
	fetch('data.json')
	.then(function (response) {
		return response.json();
	})
	.then(function (data) {
		airport_data = data;

		const choices_list = Object.keys(airport_data).map(airport => ({
			value: airport, label: airport
		}));
		// Will be used as placeholder
		choices_list.unshift({ value: '', label: 'Airport', disabled: true, selected: true });

		airport_Choices.setChoices(choices_list, 'value', 'label');
		airport_Choices.enable();
	});

	// Set event for direction button
	document.querySelectorAll('[name="direction_radio"]+button').forEach(el => {
		el.addEventListener('click', (e) => {
			el.parentNode.click();
			e.preventDefault();
		});
	});
}

if (document.readyState === "complete") { init(); }
else { window.addEventListener('load', init); }