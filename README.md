

# Airwallex SCA Component Implementation

This is an implementation of the Airwallex KYC component as documented in the [Airwallex Documentation](https://www.airwallex.com/docs/banking-as-a-service__strong-customer-authentication-(sca)__embedded-sca-component).

---

## Steps to Run the Application

### Backend Setup
1. Navigate to the root directory
2. Create a `.env` file and add the following:
   ```plaintext
   AIRWALLEX_API_KEY=your_access_token
Notes:
To create an access token, use your pair of access keys and call the [Authentication API](https://www.airwallex.com/docs/api#/Authentication/API_Access/_api_v1_authentication_login/post)

3. Install dependencies and start the backend server
   ```plaintext
   npm install
   node backed/index.js   
### Frontend Setup
1. Navigate to the `sca-demo` folder.
3. Install dependencies and start the frontend server
   ```plaintext
   npm install
   npm start
### Access the SCA
Open a browser and go to `http://localhost:3000`

The end user is assumed that he's trying so the remaining balances of his connected account and the SCA is triggered 
   








   
