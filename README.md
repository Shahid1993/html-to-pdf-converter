# Serverless HTML-to-PDF Converter
A simple HTML-to-PDF Converter app developed using AWS Lambda and Serverless Framework

## Functionality of the Application
- This application allows user to generate a pdf for a given url. The user can download the generated pdf.
- It also allows the user to delete existing records.
- Additionally, the user can add metadata for the generated pdf, and that metadata will be embedded into the pdf.
- The application uses **Auth0** as authenticating service.

## Functions implemented
- `Auth` - this function implements a custom authorizer for API Gateway, that is added to all other functions

- `CreatePdf` - this function generates the pdf for the given url, stores the generated pdf in the S3 bucket, and stores all data in dynamoDB table
  It recieves input as JSON that looks like:
  ```
  {
    "url": "https://github.com/Shahid1993"
  }
  ```
  
  It returns the newly generated PDF item, that looks like:
  ```
  {
    "item": {
        "userId": "google-oauth2|101201211415413010342",
        "htmlPdfId": "70a41c90-92d5-4f21-bb64-aff5bff1b2a7",
        "url": "https://github.com/Shahid1993",
        "pdfUrl": "https://html-to-pdf-shahid-dev.s3.amazonaws.com/70a41c90-92d5-4f21-bb64-aff5bff1b2a7.pdf",
        "timeStamp": "2020-04-22T17:18:56.686Z"
    }
  }
  ```
  
- `GetAllPdfs` - this function returns all PDF items for current user. User id is extracted the JWT token that is sent by the frontend.
  
  It returns data as below:
  ```
  {
    "items": [
        {
            "subject": "Git Profile",
            "producer": "HTML-PDF-Converter",
            "creator": "HTML-PDF-Converter Serverless App",
            "userId": "google-oauth2|109809899415693010748",
            "htmlPdfId": "ffad3596-fe5a-4e06-a44d-77d9c5cd1eed",
            "modificationDate": "2020-04-22T14:36:55.209Z",
            "timeStamp": "2020-04-22T12:20:31.456Z",
            "pdfUrl": "https://html-to-pdf-shahid-dev.s3.amazonaws.com/ffad3596-fe5a-4e06-a44d-77d9c5cd1eed.pdf",
            "url": "https://github.com/Shahid1993",
            "author": "Shahid",
            "title": "Shahid Git Profile"
        },
        {
            "timeStamp": "2020-04-22T14:34:01.091Z",
            "pdfUrl": "https://html-to-pdf-shahid-dev.s3.amazonaws.com/7c3c816a-3397-4ea4-9a47-e90a56083332.pdf",
            "url": "https://www.udacity.com/",
            "userId": "google-oauth2|109809899415693010748",
            "htmlPdfId": "7c3c816a-3397-4ea4-9a47-e90a56083332"
        }
    ]
  }
  ```
  
- `UpdatePdfMetadata` - this function updates the metadata of a PDF items for current user.

  The request JSON body is as below:
  ```
  {
    "title": "Shahid's Git Profile",
    "author": "Shahid",
    "subject": "Git Profile",
    "producer": "GitHub",
    "creator": "html-to-pdf-converter"
  }
  ```
  The `id` of the item that should be updated is passed as URL path parameter.  
  
  The function returns an empty body with status `204`
  
- `DeletePdf` - this function deletes a pdf item created by current user.

  The `id` of the item that should be deleted is passed as URL path parameter.  
  
  The function returns an empty body with status `204`
  
- `GetPdfById` - this function returns a particular pdf item created by current user.

  The `id` of the item that should be retrieved is passed as URL path parameter.  
  
  The function returns an below response JSON:
  ```
  {
    "item": {
        "subject": "Git Profile",
        "producer": "HTML-PDF-Converter",
        "creator": "HTML-PDF-Converter Serverless App",
        "userId": "google-oauth2|109809899415693010748",
        "htmlPdfId": "ffad3596-fe5a-4e06-a44d-77d9c5cd1eed",
        "modificationDate": "2020-04-22T14:36:55.209Z",
        "timeStamp": "2020-04-22T12:20:31.456Z",
        "pdfUrl": "https://html-to-pdf-shahid-dev.s3.amazonaws.com/ffad3596-fe5a-4e06-a44d-77d9c5cd1eed.pdf",
        "url": "https://github.com/Shahid1993",
        "author": "Shahid",
        "title": "Shahid Git Profile"
    }
  }
  ```
  
All functions are connected to appropriate events from API Gateway.

The id of a user is extracted from a JWT token passed by a client.

All the necessary resources are added to the `resources` section of the `serverless.yml` file, such as DynamoDB table, & S3 bucket.

## Advanced features

- Distributed tracing is enabled for all lambda functions and API Gateway, by using **Amazon X-Ray** and `serverless-plugin-tracing` plugin, and adding below in `serverless.yml` file
  ```
  tracing:
    lambda: true
    apiGateway: true
  ```

    ![Alt text](screenshots/X-Ray-Tracing.png?raw=true)

  
- IAM Roles are created for each function separately by using `serverless-iam-roles-per-function` plugin.
- Canary Deployment strategy is used by using `serverless-plugin-canary-deployments` plugin, and adding following in `serverless.yml` file for each lambda function, and giving **CodeDeply** permissions
  ```
  deploymentSettings:
      type: Linear10PercentEvery1Minute
      alias: Live
  ```

    ![Alt text](screenshots/Canary-Deployment-3.png?raw=true)


- Individual packaging of lambda functions is enabled by adding below in `serverless.yml` file for optimization.
  ```
  package:
    individually: true
  ```
  


## Frontend

The `client` folder contains a web application that can use the APIs developed in the project. It is built on top of the source code provided by [Udacity for Serverless TODO application](https://github.com/udacity/cloud-developer/tree/master/course-04/project/c4-final-project-starter-code/client). 

The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. Asymmetrically encrypted JWT tokens are recommended.


# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

## Application Interface

#### Main Page:

![Alt text](screenshots/Main-page.png?raw=true)

#### Metadata Updata Page

![Alt text](screenshots/Metadata-Update-Page.png?raw=true)

# Postman collection

An alternative way to test the application is that you can use the Postman collection that contains sample requests. You can find a Postman collection in this project.  To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")


