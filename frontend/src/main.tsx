import { render } from "preact";
import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";

import { App } from "./app.tsx";
import "./index.css";

SuperTokens.init({
  appInfo: {
    apiDomain: `${window.location.protocol}//${window.location.host}`,
    apiBasePath: "/api/auth",
    appName: "Fantasky",
  },
  recipeList: [Session.init(), EmailPassword.init()],
});

render(<App />, document.getElementById("app")!);
