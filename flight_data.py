import datetime
import json
import os
import time

from pyflightdata import FlightData
f = FlightData()

def log_str(str_):
    ts = datetime.datetime.now()
    print(ts.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3] + " " + str_)

def get_date_flight_airport_departures(airport_name, date):

    log_str("START: Request departure for " + airport_name + " on date " + date.strftime("%d/%m/%Y"))

    origin_info = f.get_airport_details(airport_name)
    log_str("Request details Done")

    origin_name = origin_info["name"]
    origin_longitude = origin_info["position"]["longitude"]
    origin_latitude = origin_info["position"]["latitude"]

    full_res = []
    ignored_counter = 0
    #requesting all this is brutal we need to change it
    for i in range(-10, 10):
        res = f.get_airport_departures(airport_name, page=i)
        current_page_ignored = 0
        for item in res:
            if (datetime.date.fromtimestamp(item["flight"]["time"]["scheduled"]["departure"]) != date):
                ignored_counter += 1
                current_page_ignored += 1
                continue

            item["flight"]["airport"]["origin"]["origin_name"] = origin_name
            item["flight"]["airport"]["origin"]["position"] = {"longitude": origin_longitude, "latitude": origin_latitude}
            full_res.append(item)
        #If we ignored all the flight of the following page and reach tommorow's date we ignore the rest
        if current_page_ignored >= len(res) and datetime.date.fromtimestamp(res[0]["flight"]["time"]["scheduled"]["departure"]) > date:
            break

    log_str("Ignored " + str(ignored_counter) + " flights for airport " + airport_name)

    log_str("FINISH: Request departure for " + airport_name + " on date " + date.strftime("%d/%m/%Y"))
    return full_res

def get_date_flight_airport_arrival(airport_name, date):

    log_str("START: Request arrival for " + airport_name + " on date " + date.strftime("%d/%m/%Y"))

    origin_info = f.get_airport_details(airport_name)
    log_str("Request details Done")

    origin_name = origin_info["name"]
    origin_longitude = origin_info["position"]["longitude"]
    origin_latitude = origin_info["position"]["latitude"]

    full_res = []
    ignored_counter = 0
    for i in range(-10, 10):
        res = f.get_airport_arrivals(airport_name, page=i)
        current_page_ignored = 0
        for item in res:
            if (datetime.date.fromtimestamp(item["flight"]["time"]["scheduled"]["arrival"]) != date):
                ignored_counter += 1
                current_page_ignored += 1
                continue

            item["flight"]["airport"]["destination"]["origin_name"] = origin_name
            item["flight"]["airport"]["destination"]["position"] = {"longitude": origin_longitude, "latitude": origin_latitude}
            full_res.append(item)
        #If we ignored all the flight of the following page and reach tommorow's date we ignore the rest
        if current_page_ignored >= len(res) and datetime.date.fromtimestamp(res[0]["flight"]["time"]["scheduled"]["arrival"]) > date:
            break

    log_str("Ignored " + str(ignored_counter) + " flights for airport " + airport_name)

    log_str("FINISH: Request arrival for " + airport_name + " on date " + date.strftime("%d/%m/%Y"))
    return full_res


def log_airport_flight(airport_name, date):
    flights_dep = get_date_flight_airport_departures(airport_name, date)
    pathname = "./airport/" + airport_name  + "/"
    filename =  pathname + "departures_" + date.strftime("%d_%m_%Y") +".json"
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as output:
        output.write(json.dumps(flights_dep, indent=4))

    flights_arr = get_date_flight_airport_arrival(airport_name, date)
    pathname = "./airport/" + airport_name  + "/"
    filename =  pathname + "arrivals_" + date.strftime("%d_%m_%Y") +".json"
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as output:
        output.write(json.dumps(flights_arr, indent=4))


top_10_airport = ["ATL", "PEK", "DXB", "LAX", "HND", "ORD", "LHR", "HKA", "PVG", "CDG"]

for airport in top_10_airport:
    log_airport_flight(airport, datetime.date.today())
    #Avoid DOS the API we have all the time in the world
    time.sleep(5)