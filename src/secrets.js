/*
 * secrets.js
 *
 * Contains the secret values used within the application that must not be directly exposed to the user.
 */

// Imports
import fs from 'fs';

// TLS secrets

// Whether to use TLS for securing connections
const useTls = process.env.USE_TLS;

// TLS client certificate
const cert = process.env.TLS_CERT
  ? fs.readFileSync(process.env.TLS_CERT)
  : undefined;

// TLS client private key
const key = process.env.TLS_KEY
  ? fs.readFileSync(process.env.TLS_KEY)
  : undefined;

// TLS certificate authority for validating server certificate
const ca = process.env.TLS_CA ? fs.readFileSync(process.env.TLS_CA) : undefined;

// Diffie-Hellman parameters to enable forward secrecy
const dhparams = process.env.TLS_DHPARAMS
  ? fs.readFileSync(process.env.TLS_DHPARAMS)
  : undefined;

// Secrets object
const secrets = {
  useTls,
  ca,
  cert,
  key,
  dhparams,
};

// Exports
export default secrets;
