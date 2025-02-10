# PicPoll

## Getting Started

### Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

### Creating a Docker Image

To create a Docker image, use the following command:

```bash
docker build -t picpoll .
```

### Running the Docker Image

To run the Docker image, use the following command:

```bash
docker run -p 3000:3000 picpoll
```

### Pushing to Docker Hub

To push the Docker image to Docker Hub, follow these steps:

1. Tag the image with your Docker Hub username and repository name:

```bash
sudo docker tag picpoll swemaster/picpoll:latest
```

2. Log in to Docker Hub:

```bash
sudo docker login
```

3. Push the image to Docker Hub:

```bash
sudo docker push swemaster/picpoll:latest
```