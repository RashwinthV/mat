const axios = require('axios');
const User = require('../Models/user');
const preference = require('../Models/Userprefercnce');
const qs =require('qs')

const KEYCLOAK_URL =
  "http://localhost:8080/realms/demo/protocol/openid-connect";
const CLIENT_ID = "demo_user";
const CLIENT_SECRET = "Dbfxpnwt1uXAisPdGlg3WeuVlIk5eLGS";
const REDIRECT_URI = "http://localhost:4000/form"; //redirection to the form to get user details


exports.loginProvider = (req, res) => {
  const { provider } = req.params;

  
  const providers = {
    google: "google",
    facebook: "facebook",
    instagram: "instagram",
    "linkedin-openid-connect": "linkedin-openid-connect",
  };

  if (!providers[provider]) {
    return res.status(400).send('Unsupported provider');
  }

  const loginUrl = `${KEYCLOAK_URL}/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=openid&kc_idp_hint=${providers[provider]}`;
  res.redirect(loginUrl);
};



exports.keycloakCallback = async (req, res) => {
  try {
    const { code } = req.query;
    // console.log(code);
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    const tokenResponse = await axios.post(
      `${KEYCLOAK_URL}/token`,
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "client_credentials", 
        code, 
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", 
        },
      }
    );
   
    const accessToken = tokenResponse.data.access_token;
    // console.log("user Accesstoke  got ");

    const userResponse = await axios.get(
      "http://localhost:8080/admin/realms/demo/users",
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );
    
    
    
    const KEYCLOAK_BASE_URL = 'http://localhost:8080';
    const ADREALM = 'master';
    const USERNAME = 'rashwinth'; 
    const PASSWORD = 'admin'; 
    const ADCLIENT_ID = 'admin-cli';  
    const REALM = 'demo';   
    const ADCLIENT_SECRET = 'ensYvPNqaqYgU5I9Fcmz1aijLTg4lE0E';  
    
    // 1. Obtain the Admin Access Token
    const response = await axios.post(
      `${KEYCLOAK_BASE_URL}/realms/${ADREALM}/protocol/openid-connect/token`,
      qs.stringify({
        grant_type: 'password',  
        client_id: ADCLIENT_ID,  
        client_secret: ADCLIENT_SECRET,  
        username: USERNAME,  
        password: PASSWORD,  
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  
        },
      }
    );
    
    const adminAccessToken = response.data.access_token;
    // console.log('Admin Access Token:', adminAccessToken);
    
    // 2. Get the Client UUID for "demo_user"
    const clientResponse = await axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/clients`,
      {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,  
        },
      }
    );
    
    // Find the client UUID for demo_user
    const client = clientResponse.data.find(client => client.clientId ===CLIENT_ID);
    const clientUuid = client ? client.id : null;
    
    if (!clientUuid) {
      console.log('Client not found');
      return;
    }
    
    // console.log('Client UUID:', clientUuid);
    
    // 3. Fetch user sessions for the "demo_user" client
    const sessionResponse = await axios.get(
      `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/clients/${clientUuid}/user-sessions`,
      {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,  
        },
      }
    );
    
    const sessions = sessionResponse.data;
    // console.log(sessions);
    
    if (sessions.length === 0) {
      console.log('No active sessions found.');
      return;
    }
    
    const latestSession = sessions.reduce((latest, session) => {
      
      if (!latest.lastAccess || session.lastAccess > latest.lastAccess) {
        return session;  
      }
      return latest;  
    }, {}); 

    
    let provider; // Declare provider outside the loop

    // Fetch user details
    for (let user of userResponse.data) {
    
      try {
        const idpResponse = await axios.get(
          `http://localhost:8080/admin/realms/demo/users/${user.id}/federated-identity`,
          {
            headers: {
              Authorization: `Bearer ${adminAccessToken}`,
            },
          }
        );
        // console.log("idresponse", idpResponse.data);
        user.identityProviders = idpResponse.data; // Assuming you're setting identity providers for each user
    
      } catch (idpError) {
        console.warn(`No identity provider found for user: ${user.username}`);
        user.identityProviders = [];
      }
    }
    
    // Find the user based on their username
    const us = userResponse.data.find(user => user.username === latestSession.username);
    const email = us.email;

    if (us) {
    
      const identityProviderData = us.identityProviders.find(idp => idp.userName === email);
    
      if (identityProviderData) {
        provider = identityProviderData.identityProvider; 
      } 
    } else {
      console.log("User not found in userResponse data.");
    }
    
   

    if (!email) {
      return res.status(400).send('Unable to retrieve email from Keycloak');
    }

    // Check if user exists in database
    let user = await User.findOne({ email });
    var user_count=await User.find().countDocuments()
    let user_id = "user" + String(user_count + 1).padStart(2, '0');    
    if (!user) {
      user = new User({ email,social_login:provider,customer_id:user_id });
      var pref=new preference({customer_id:user_id})
      var new_preference=await pref.save()
        localStorage.setItem("user_id",user_id)
       var store = await user.save()    
       res.redirect(`${REDIRECT_URI}/user?email=${encodeURIComponent(email)}`)

    }else{
      localStorage.setItem("user_id",user.customer_id)
      res.redirect(`http://localhost:4000/dashboard?email=${encodeURIComponent(email)}`)
    }
  } catch (error) {
    console.error('Error during Keycloak callback:', error.message);

    if (error.response) {
      console.error('Full error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }

    res.status(500).send('Internal Server Error');
  }
};

