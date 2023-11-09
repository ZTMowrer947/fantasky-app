import express from "express";
import cors from "cors";

import "dotenv/config";

import supertokens from "supertokens-node/index.js";
import Session from "supertokens-node/recipe/session/index.js";
import EmailPassword from "supertokens-node/recipe/emailpassword/index.js";
import {
  errorHandler,
  middleware,
} from "supertokens-node/framework/express/index.js";

const websiteDomain = process.env.APP_DOMAIN;
const apiDomain = process.env.API_DOMAIN;

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: "http://localhost:3567",
  },
  appInfo: {
    appName: "Fantasky",
    apiDomain,
    websiteDomain,
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [EmailPassword.init(), Session.init()],
});

const app = express();

app.use(
  cors({
    origin: websiteDomain.replace(/$https?:\/\//, "").replace(/\/.+$/, ""),
    allowedHeaders: ["Content-Type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);

app.use(middleware());

app.use(errorHandler());

app.listen(5000, () => {
  console.log("Auth server running on port 5000");
});
