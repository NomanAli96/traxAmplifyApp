import { withAuthenticator, Button, Heading } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
import Dashboard from "./UI/Pages/Dashboard";
Amplify.configure(awsconfig);

function App({ signOut, user }) {
  return (
    <>
      <Dashboard />
    </>
  );
}

export default withAuthenticator(App);
