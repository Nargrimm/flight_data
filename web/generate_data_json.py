import os
import re
import json

DATA_DIR = 'airport'
ARRIVALS_PREFIX = 'arrivals'
DEPARTURES_PREFIX = 'departures'
OUTPUT_FILENAME = 'data.json'

base_dir = os.path.dirname(__file__)

data = {}
abs_data_dir = os.path.join(base_dir, DATA_DIR)
for airport in os.listdir(abs_data_dir):

	airport_dir = os.path.join(abs_data_dir, airport)
	for data_filename in os.listdir(airport_dir):
		regex_str = '({}|{})'.format(re.escape(ARRIVALS_PREFIX), re.escape(DEPARTURES_PREFIX)) + r'_(\d{2})_(\d{2})_(\d{4})'

		prefix, day, month, year = re.search(regex_str, data_filename).groups()

		if prefix == ARRIVALS_PREFIX:
			key = 'arrivals'
		if prefix == DEPARTURES_PREFIX:
			key = 'departures'

		date_str = '{}/{}/{}'.format(day, month, year)
		data.setdefault(airport, {}).setdefault(key, []).append((date_str, os.path.join(airport_dir, data_filename)))

with open(OUTPUT_FILENAME, 'w') as output_file:
	json.dump(data, output_file)