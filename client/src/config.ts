// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'yec0k7uihi'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-25c8tyzh.auth0.com',            // Auth0 domain
  clientId: 'uS3OEYn6A3NQgQ05Xn1b7o9giHT4Q2SM',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
