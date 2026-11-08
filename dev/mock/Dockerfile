FROM python:3.12-alpine
RUN pip install --no-cache-dir "paho-mqtt>=2,<3"
WORKDIR /app
COPY house.py simulator.py ./
CMD ["python", "-u", "simulator.py"]
