# WARNING build before david712/prefect:2.14.12-python3.11 with the following command:
# docker build --pull --rm -f "pipeline/Dockerfile.pre" -t david712/prefect:2.14.12-python3.11 "pipeline"
FROM david712/prefect:2.14.12-python3.11

RUN apt-get update && apt-get install -y
RUN apt-get install -y --no-install-recommends ffmpeg

# Install additional packages
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app/pipeline
COPY requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt


