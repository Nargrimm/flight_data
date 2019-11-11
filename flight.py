#!/usr/bin/env python3

from http.server import HTTPServer, SimpleHTTPRequestHandler
from utils.generate_data_json import generate_data

if __name__ == '__main__':
    generate_data()
    print("Serving HTTP on 0.0.0.0 port 8000 ...")
    httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
    httpd.serve_forever()