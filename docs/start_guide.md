# Startup Guide

## Setup the docker docker swarm cluster

### Share the swarm token with the other VMs

For the other VMs to join the swarm cluster, they need to have the swarm token. This token is generated when the first VM is initialised as a swarm manager. To share the token with the other VMs, run the following command:

```bash
./scripts/setup_dockers.sh
```

This will initialise the swarm cluster and share the token with the other VMs. These latter VMs will then join the cluster.

To check that the cluster is up and running, run the following command from the Client VM:

```bash
docker node ls
```

## Start the docker swarm cluster

To start the docker swarm cluster, run the following command:

```bash
./scripts/start_dockers.sh
```

You can check the status of the services by running the following command:

```bash
docker service ls
```

## Use the Web Application

A React web application is available to interact with the audio processing pipeline. If you have started the docker swarm cluster, you can access the web application by visiting the following URL:

```
http://<hostname_of_client_vm>
```

From the web application, you can:
- Add an audio file manually by being redirected to the filebrowser service
- View all existing prefect flow runs status
- View a quick summary of the result of a flow run
- Be redirected to the prefect UI to view the progress or the results of a flow run
- Download the results of one or many flow runs

### Add an audio file manually

To add an audio file there are two options:
- Add the audio files with scp to the 'new_audios' folder in the client VM
- Drag and drop the audio files in the filebrowser service

### Add many audio files at once with a bash script

To add many audio files at once, you can use the following command:

```bash
scp -i ~/.ssh/<your_key> -r <path_to_audio_files> <username>@<client_ip>:/mnt/data/shared/new_audios
```

A bash script is also available to test the audio processing pipeline with a large number of audio files. To use this script, run the following command:

```bash
./scripts/download_audios.sh
```

### Start the flow runs

To start the flow runs, you can visit the web application and click on the 'Start Flow Runs' button. This will start the flow runs for all the audio files in the 'new_audios' folder.

Or you can curl the following endpoint:

```bash
# Via the NGINX server
curl -X POST http://<hostname_of_client_vm>/backend/v1/pipelines/start-processing
```

or inside the backend container:

```bash
curl -X POST http://localhost:3001/v1/pipelines/start-processing
```

### View progress of a run on the Prefect UI

From the web application, you can filter the flow runs by status and click on the 'View' button of the pipeline card to look more details about the Pipeline. From this open card, you can click on the 'Visit Prefect UI' button to be redirected to the Prefect UI.

### Download the results of a run

From the web application, you can filter the flow runs by status and click on the 'Download' button of the pipeline card to download the results of all the displayed flow runs. This will download a json file containing the data of the flow runs.

## Stop the docker swarm cluster

To stop the docker swarm cluster, run the following command:

```bash
./scripts/stop_dockers.sh
```
