import http.server
import os
import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

def resource_dir():
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS) / "game"
    return Path(__file__).resolve().parent / "game"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

def main():
    root = resource_dir()
    os.chdir(root)
    port = free_port()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{port}/index.html"
    print("CHISHTI BRO: PAKISTAN OPEN WORLD")
    print("Game running at", url)
    webbrowser.open(url)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()

if __name__ == "__main__":
    main()
