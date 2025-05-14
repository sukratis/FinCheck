// File: lib/arcjet-sdk.js
import { Arcjet } from "@arcjet/sdk";

const arcjet = new Arcjet({
  key: process.env.ARCJET_KEY,
});

export default arcjet;

