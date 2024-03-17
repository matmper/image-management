# Image Management

Personal study repository of an API for managing image files without using frameworks.

<p align="center">
    <a href="https://github.com/matmper/image-management/pulls">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
    </a>
    <a href="https://github.com/matmper/image-management/actions/workflows/github_actions.yml">
        <img src="https://github.com/matmper/image-management/actions/workflows/github_actions.yml/badge.svg?event=push" alt="Github Actions">
    </a>
    <a href="https://github.com/matmper/image-management/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License MIT">
    </a>
</p>

## Requeriments
- Docker
- Docker Compose
- GPU Makefile

## Installation for development

Clone repository, copy env file and configure it:
```bash
$ cp .env.example .env
```

Start docker and run these commands:
```bash
$ make build
```

Use `$ make up` to start or `$ make down` to stop

To access a container folder run: `$ make tty`

## Use

Make an HTTP request in localhost on the configured port (default 3000), example:

```bash
$ curl --location --request POST 'http://localhost:3000/'
```

## Documentation

Coming soon with Swagger!

---

This repository use [MIT License](https://choosealicense.com/licenses/mit/)
