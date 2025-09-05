# TinyURLCDK

TinyURLCDK is a serverless URL shortening service built with AWS CDK in TypeScript. It provides APIs to create shortened URLs and retrieve original links. 

## 🛠️ Tech Stack

- **AWS CDK (TypeScript)** – Infrastructure as Code  
- **AWS Lambda** – Serverless compute for business logic  
- **Amazon API Gateway** – RESTful API routing and management  
- **Amazon RDS (PostgreSQL)** – Relational SQL backend for persistent storage  
- **Amazon ElastiCache (Redis)** – In-memory caching for fast lookups  
- **TypeScript** – Language for both infrastructure and function code  

## 🚀 Features

- Dynamically create and deploy AWS CDK stacks  
- Shorten long URLs into TinyURLs via API  
- Retrieve the original URL from a shortened link  


## 🧪 Example Endpoints

- `POST /shorten` – Shorten long URL
- `GET /{code}` – Retrieve the original URL


## 🛠️ Deployment

To deploy the project:

```bash
# Install dependencies
pnpm install

# build code
pnpm run build

# Bootstrap your environment (only once)
cdk bootstrap

# Deploy the stack
cdk deploy

# Destroy the stack
cdk destroy